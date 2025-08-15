#!/usr/bin/env python3
import os, json, logging, requests, threading, asyncio
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Исправление для sched_getaffinity
try:
    import multiprocessing
    multiprocessing.set_start_method('fork', force=True)
except (ImportError, RuntimeError):
    pass

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, CallbackContext, filters
from lava_app_client import create_invoice, LavaAppError

# ---------- Config ----------
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '').strip()
WEBHOOK_URL = os.getenv('WEBHOOK_URL', '').strip()  # без /webhook в конце; например: https://<app>.up.railway.app
WEBHOOK_PATH = '/webhook'
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'FORMULA_TMP_SECRET')
PUBLIC_BASE_URL = os.getenv('PUBLIC_BASE_URL', '').strip()  # если используется в ответах
LAVA_TOP_API_KEY = os.getenv('LAVA_TOP_API_KEY', '').strip()
LAVA_OFFER_ID_BASIC = os.getenv('LAVA_OFFER_ID_BASIC', '').strip()
PAYMENT_MINIAPP_URL = os.environ.get("PAYMENT_MINIAPP_URL", "https://acqu1red.github.io/formulaprivate/payment.html")
USE_POLLING = os.environ.get("USE_POLLING", "0") == "1"
LOG_JSON_BODY = os.environ.get("LOG_JSON_BODY", "1") == "1"

# Проверки обязательных переменных
print("🔍 ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:")
print(f"TELEGRAM_BOT_TOKEN: {'✅' if TELEGRAM_BOT_TOKEN else '❌'} {'задан' if TELEGRAM_BOT_TOKEN else 'НЕ ЗАДАН'}")
print(f"WEBHOOK_URL: {'✅' if WEBHOOK_URL else '❌'} {'задан' if WEBHOOK_URL else 'НЕ ЗАДАН'}")
print(f"LAVA_TOP_API_KEY: {'✅' if LAVA_TOP_API_KEY else '❌'} {'задан' if LAVA_TOP_API_KEY else 'НЕ ЗАДАН'}")
print(f"LAVA_OFFER_ID_BASIC: {'✅' if LAVA_OFFER_ID_BASIC else '❌'} {'задан' if LAVA_OFFER_ID_BASIC else 'НЕ ЗАДАН'}")

if not TELEGRAM_BOT_TOKEN:
    print("❌ ОШИБКА: TELEGRAM_BOT_TOKEN не задан в переменных окружения Railway")
    # Не падаем сразу, чтобы увидеть остальные ошибки
if not WEBHOOK_URL:
    print("❌ ОШИБКА: WEBHOOK_URL не задан в переменных окружения Railway (пример: https://<app>.up.railway.app)")
if not LAVA_TOP_API_KEY:
    print("❌ ОШИБКА: LAVA_TOP_API_KEY не задан (ключ из app.lava.top)")
if not LAVA_OFFER_ID_BASIC:
    print("❌ ОШИБКА: LAVA_OFFER_ID_BASIC не задан")

# Проверяем, есть ли критические ошибки
critical_errors = []
if not TELEGRAM_BOT_TOKEN:
    critical_errors.append("TELEGRAM_BOT_TOKEN")
if not WEBHOOK_URL:
    critical_errors.append("WEBHOOK_URL")
if not LAVA_TOP_API_KEY:
    critical_errors.append("LAVA_TOP_API_KEY")
if not LAVA_OFFER_ID_BASIC:
    critical_errors.append("LAVA_OFFER_ID_BASIC")

if critical_errors:
    print(f"🚨 КРИТИЧЕСКИЕ ОШИБКИ: {', '.join(critical_errors)}")
    print("💡 Установите эти переменные в Railway → Variables")
    # Пока не падаем, чтобы приложение запустилось и показало health endpoint

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", force=True)
log = logging.getLogger("app")

def _redact(s: str) -> str:
    if not s: return s
    if len(s) <= 10: return "***"
    return s[:4] + "..." + s[-4:]

print("🚀 ЗАПУСК ПРИЛОЖЕНИЯ")
print(f"📡 WEBHOOK_URL: {WEBHOOK_URL}")
print(f"🤖 TELEGRAM_BOT_TOKEN: {_redact(TELEGRAM_BOT_TOKEN)}")
print(f"🔑 LAVA_TOP_API_KEY: {_redact(LAVA_TOP_API_KEY)}")
print(f"🎯 LAVA_OFFER_ID_BASIC: {_redact(LAVA_OFFER_ID_BASIC)}")

log.info("BOOT: TELEGRAM_BOT_TOKEN=%s WEBHOOK_URL=%s LAVA_TOP_API_KEY=%s OFFER_ID=%s",
         _redact(TELEGRAM_BOT_TOKEN), WEBHOOK_URL, _redact(LAVA_TOP_API_KEY), _redact(LAVA_OFFER_ID_BASIC))

# ---------- Flask ----------
app = Flask(__name__)
CORS(app)

# ---------- Telegram app (set in main) ----------
app.telegram_app = None

# ---------- HTTP request logging ----------
@app.before_request
def _log_in():
    try:
        meta = {
            "method": request.method,
            "path": request.path,
            "ip": request.headers.get("X-Forwarded-For") or request.remote_addr,
            "ct": request.headers.get("Content-Type"),
            "len": request.headers.get("Content-Length"),
        }
        if request.method == "POST":
            meta["json"] = request.get_json(silent=True)
        print("HTTP IN:", meta)
    except Exception as e:
        print("log error:", e)

@app.after_request
def _after(resp):
    try:
        log.info("RESP %s %s -> %s", request.method, request.path, resp.status_code)
    except Exception:
        pass
    return resp

# ---------- Telegram handlers ----------
async def start(update: Update, context: CallbackContext):
    kb = [[InlineKeyboardButton("Оплатить", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))]]
    await update.message.reply_text("Выберите действие:", reply_markup=InlineKeyboardMarkup(kb))

async def payment(update: Update, context: CallbackContext):
    return await start(update, context)

async def handle_web_app_data(update: Update, context: CallbackContext):
    msg = update.message
    user = update.effective_user
    log.info("handle_web_app_data from %s", user.id if user else "unknown")
    if not (hasattr(msg, "web_app_data") and msg.web_app_data and msg.web_app_data.data):
        await msg.reply_text("Данные от Mini App не найдены")
        return
    try:
        data = json.loads(msg.web_app_data.data)
        log.info("web_app_data payload: %s", data)
    except Exception as e:
        await msg.reply_text(f"Ошибка парсинга JSON: {e}")
        return

    email = data.get("email") or data.get("userEmail")
    tariff = (data.get("tariff") or data.get("selectedTariff") or "basic").lower()
    bank = (data.get("bank") or data.get("selectedBank") or "russian").lower()
    currency = (data.get("currency") or ("RUB" if bank == "russian" else "USD")).upper()

    offer_id = os.environ.get("LAVA_OFFER_ID_BASIC")
    if not offer_id:
        await msg.reply_text("Не настроен OFFER_ID")
        return

    client_utm = {"tg_id": str(user.id), "tariff": tariff, "bank": bank}

    try:
        inv = create_invoice(api_key=LAVA_TOP_API_KEY, offer_id=offer_id, email=email,
                             currency=currency, payment_method=None, buyer_language="RU",
                             client_utm=client_utm)
        await msg.reply_text(f"Ссылка на оплату:\n{inv['paymentUrl']}")
    except LavaAppError as e:
        log.exception("LAVA error")
        await msg.reply_text(f"Ошибка LAVA: {e}")
    except Exception as e:
        log.exception("Server error")
        await msg.reply_text(f"Ошибка сервера: {e}")

async def any_msg(update: Update, context: CallbackContext):
    if update.message and update.message.text:
        await update.message.reply_text("Я на месте. Нажмите «Оплатить».")

# ---------- Health/debug ----------
@app.get("/health")
def health():
    return jsonify({
        "status": "ok", 
        "time": datetime.utcnow().isoformat()+"Z",
        "webhook_url": WEBHOOK_URL,
        "bot_token_set": bool(TELEGRAM_BOT_TOKEN),
        "lava_key_set": bool(LAVA_TOP_API_KEY)
    })

@app.get("/webhook-info")
def webhook_info():
    try:
        r = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/getme")
def getme():
    try:
        r = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe", timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.post("/force-set-webhook")
def force_set_webhook():
    try:
        target = f"{WEBHOOK_URL.rstrip('/')}{WEBHOOK_PATH}"
        payload = {
            "url": target,
            "secret_token": WEBHOOK_SECRET,
            "max_connections": 40,
            "allowed_updates": ["message", "callback_query"]
        }
        r_del = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook",
                              json={"drop_pending_updates": False}, timeout=10)
        r_set = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                              json=payload, timeout=10)
        return jsonify({"delete": r_del.json() if r_del.ok else r_del.text,
                        "set": r_set.json() if r_set.ok else r_set.text,
                        "target": target})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.post("/delete-webhook")
def delete_webhook():
    try:
        r = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook",
                          json={"drop_pending_updates": False}, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- Telegram webhook endpoint ----------
@app.route("/webhook", methods=["GET", "POST"])
def telegram_webhook():
    print(f"🌐 WEBHOOK ЗАПРОС: {request.method} {request.path}")
    
    if request.method == "GET":
        print("🔧 GET /webhook - self-heal")
        # self-heal
        try:
            info = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10).json()
            current = info.get("result", {}).get("url", "")
            expected = f"{WEBHOOK_URL.rstrip('/')}{WEBHOOK_PATH}" if WEBHOOK_URL else ""
            if expected and current != expected:
                set_r = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                                      json={"url": expected,
                                            "max_connections": 40,
                                            "allowed_updates": ["message", "callback_query"]},
                                      timeout=10).json()
                log.info("self-heal setWebhook: %s", set_r)
        except Exception as e:
            log.exception("Webhook self-heal failed: %s", e)
        return jsonify({"ok": True})

    data = request.get_json(silent=True)
    log.info("TELEGRAM RAW: %s", data)
    if not data or "update_id" not in data:
        return jsonify({"error": "not telegram"}), 400

    update = Update.de_json(data, app.telegram_app.bot)
    try:
        # Простая обработка без asyncio
        if update.message and update.message.text == '/start':
            # Обрабатываем /start напрямую
            kb = [[InlineKeyboardButton("Оплатить", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))]]
            markup = InlineKeyboardMarkup(kb)
            requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                          json={"chat_id": update.message.chat.id, 
                                "text": "Выберите действие:", 
                                "reply_markup": markup.to_dict()},
                          timeout=10)
            log.info("Обработан /start для chat_id: %s", update.message.chat.id)
        elif update.message and hasattr(update.message, 'web_app_data') and update.message.web_app_data:
            # Обрабатываем данные от Mini App синхронно
            msg = update.message
            user = update.effective_user
            log.info("handle_web_app_data from %s", user.id if user else "unknown")
            
            if not (hasattr(msg, "web_app_data") and msg.web_app_data and msg.web_app_data.data):
                requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                              json={"chat_id": msg.chat.id, "text": "Данные от Mini App не найдены"},
                              timeout=10)
                return jsonify({"ok": True})
            
            try:
                data = json.loads(msg.web_app_data.data)
                log.info("web_app_data payload: %s", data)
                
                email = data.get("email") or data.get("userEmail")
                tariff = (data.get("tariff") or data.get("selectedTariff") or "basic").lower()
                bank = (data.get("bank") or data.get("selectedBank") or "russian").lower()
                currency = (data.get("currency") or ("RUB" if bank == "russian" else "USD")).upper()
                
                client_utm = {"tg_id": str(user.id), "tariff": tariff, "bank": bank}
                
                inv = create_invoice(api_key=LAVA_TOP_API_KEY, offer_id=LAVA_OFFER_ID_BASIC, email=email,
                                     currency=currency, payment_method=None, buyer_language="RU",
                                     client_utm=client_utm)
                
                requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                              json={"chat_id": msg.chat.id, "text": f"Ссылка на оплату:\n{inv['paymentUrl']}"},
                              timeout=10)
            except Exception as e:
                log.error("Ошибка обработки web_app_data: %s", e)
                requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                              json={"chat_id": msg.chat.id, "text": f"Ошибка: {e}"},
                              timeout=10)
        else:
            # Обрабатываем другие сообщения
            requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                          json={"chat_id": update.message.chat.id, 
                                "text": "Я на месте. Нажмите «Оплатить»."},
                          timeout=10)
    except Exception as e:
        log.error("Ошибка обработки update: %s", e)
    return jsonify({"ok": True})

# ---------- Direct MiniApp POST (optional) ----------
@app.post("/api/create-payment")
def api_create_payment():
    try:
        payload = request.get_json(force=True)
        email = payload.get("email")
        tariff = (payload.get("tariff") or "basic").lower()
        bank = (payload.get("bank") or "russian").lower()
        currency = (payload.get("currency") or ("RUB" if bank == "russian" else "USD")).upper()
        offer_id = os.environ.get("LAVA_OFFER_ID_BASIC")
        utm = {"api": "create-payment", "tariff": tariff, "bank": bank}
        inv = create_invoice(api_key=LAVA_TOP_API_KEY, offer_id=offer_id, email=email,
                             currency=currency, payment_method=None, buyer_language="RU",
                             client_utm=utm)
        return jsonify({"ok": True, "paymentUrl": inv["paymentUrl"], "raw": inv["raw"]})
    except LavaAppError as e:
        return jsonify({"ok": False, "error": str(e)}), 400
    except Exception as e:
        log.exception("API error")
        return jsonify({"ok": False, "error": str(e)}), 500

@app.post("/lava-webhook")
def lava_webhook():
    try:
        data = request.get_json(force=True)
        log.info("LAVA webhook: %s", data)
        event = data.get("eventType")
        status = data.get("status")
        client_utm = data.get("clientUtm") or {}
        if event == "payment.success" or status == "completed":
            tg_id = client_utm.get("tg_id")
            if tg_id:
                try:
                    requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                                  json={"chat_id": tg_id, "text": "✅ Оплата прошла успешно. Спасибо!"},
                                  timeout=10)
                except Exception:
                    log.exception("Failed to notify buyer in Telegram")
        return jsonify({"ok": True})
    except Exception as e:
        log.exception("LAVA webhook error")
        return jsonify({"ok": False, "error": str(e)}), 400

# ---------- Startup ----------
def _start_polling(app_obj: Application):
    log.info("Starting PTB polling...")
    app_obj.run_polling(allowed_updates=["message", "callback_query"])

def main():
    print("🔧 ИНИЦИАЛИЗАЦИЯ TELEGRAM БОТА")
    
    # Проверяем, есть ли все необходимые переменные
    if not TELEGRAM_BOT_TOKEN or not WEBHOOK_URL or not LAVA_TOP_API_KEY or not LAVA_OFFER_ID_BASIC:
        print("⚠️  Пропускаем инициализацию Telegram бота из-за отсутствующих переменных")
        print("💡 Установите все переменные окружения в Railway → Variables")
        app.telegram_app = None
    else:
        # PTB app
        application = Application.builder().token(TELEGRAM_BOT_TOKEN).concurrent_updates(False).build()
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("payment", payment))
        application.add_handler(CallbackQueryHandler(lambda *_: None))
        application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
        application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, any_msg))
        app.telegram_app = application

    # quick diagnostics
    try:
        me = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe", timeout=10).json()
        info = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10).json()
        log.info("getMe: %s", me)
        log.info("getWebhookInfo BEFORE: %s", info)
    except Exception:
        log.exception("Telegram diagnostics failed")

    # --- setWebhook на старте ---
    if TELEGRAM_BOT_TOKEN and WEBHOOK_URL:
        print("🔗 ПРОВЕРКА WEBHOOK")
        try:
            target = f"{WEBHOOK_URL.rstrip('/')}{WEBHOOK_PATH}"
            
            # Проверяем текущий webhook
            r_info = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo", timeout=10)
            if r_info.ok:
                info = r_info.json()
                current_url = info.get('result', {}).get('url', '')
                
                if current_url == target:
                    print(f"✅ Webhook уже установлен правильно: {target}")
                else:
                    print(f"🔄 Webhook неправильный, устанавливаем заново...")
                    print(f"   Текущий: {current_url}")
                    print(f"   Нужный:  {target}")
                    
                    # Удаляем старый webhook только если он неправильный
                    if current_url:
                        r_del = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook",
                                      json={"drop_pending_updates": False}, timeout=10)
                        print(f"🗑️  Удаление старого webhook: {r_del.status_code}")
                    
                    # Устанавливаем новый webhook
                    payload = {
                        "url": target,
                        "max_connections": 40,
                        "allowed_updates": ["message", "callback_query"]
                    }
                    r = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook",
                                      json=payload, timeout=10)
                    print(f"📡 setWebhook ответ: {r.status_code} {r.text}")
                    log.info("setWebhook: %s %s", r.status_code, r.text)
            else:
                print(f"❌ Ошибка получения информации о webhook: {r_info.status_code}")
        except Exception as e:
            print(f"❌ Ошибка проверки webhook: {e}")
            log.error("Ошибка webhook: %s", e)
    else:
        print("⚠️  Пропускаем проверку webhook из-за отсутствующих переменных")

    if USE_POLLING:
        threading.Thread(target=_start_polling, args=(application,), daemon=True).start()

    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()

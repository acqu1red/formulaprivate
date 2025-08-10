from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, filters
from queue import Queue
from telegram.ext import ApplicationBuilder
import pytz
from telegram.ext import CallbackQueryHandler
from supabase import create_client, Client
import asyncio
import json
import uuid
import time
from lava_integration import lava_api

MINIAPP_URL = "https://acqu1red.github.io/tourmalineGG/"
PAYMENT_MINIAPP_URL = "https://acqu1red.github.io/tourmalineGG/payment.html"

# Supabase configuration
SUPABASE_URL = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Список username администраторов
ADMIN_USERNAMES = [
    "acqu1red",
    "cashm3thod",
]

# Список ID администраторов (для проверки прав)
ADMIN_IDS = [
    708907063,  # Замените на реальные ID администраторов
    7365307696,
]

# ---------- Admin notification functions ----------

async def save_message_to_db(user, message):
    """Сохраняет сообщение в базе данных"""
    try:
        # Создаем или получаем пользователя
        user_data = {
            'telegram_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        
        # Вставляем или обновляем пользователя
        result = supabase.table('users').upsert(user_data).execute()
        
        # Получаем или создаем диалог
        conversation_result = supabase.table('conversations').select('id').eq('user_id', user.id).execute()
        
        if conversation_result.data:
            conversation_id = conversation_result.data[0]['id']
        else:
            # Создаем новый диалог
            conversation_data = {
                'user_id': user.id,
                'status': 'open'
            }
            conversation_result = supabase.table('conversations').insert(conversation_data).execute()
            conversation_id = conversation_result.data[0]['id']
        
        # Определяем тип сообщения
        message_type = 'text'
        content = message.text or ''
        
        if message.photo:
            message_type = 'image'
            content = message.caption or '[Фото]'
        elif message.video:
            message_type = 'video'
            content = message.caption or '[Видео]'
        elif message.voice:
            message_type = 'voice'
            content = '[Голосовое сообщение]'
        elif message.document:
            message_type = 'file'
            content = f'[Документ] {message.document.file_name or "Без названия"}'
        elif message.sticker:
            message_type = 'sticker'
            content = f'[Стикер] {message.sticker.emoji or "Без эмодзи"}'
        elif message.audio:
            message_type = 'audio'
            content = f'[Аудио] {message.audio.title or "Без названия"}'
        
        # Сохраняем сообщение
        message_data = {
            'conversation_id': conversation_id,
            'sender_id': user.id,
            'content': content,
            'message_type': message_type
        }
        
        supabase.table('messages').insert(message_data).execute()
        
    except Exception as e:
        print(f"Ошибка сохранения в БД: {e}")
        raise e



async def handle_all_messages(update: Update, context: CallbackContext) -> None:
    """Обрабатывает все сообщения - уведомления администраторов и ответы от них"""
    print("🎯 Функция handle_all_messages вызвана!")
    
    # Проверяем, является ли это данными от miniapp
    if update.message and update.message.web_app_data:
        await handle_webapp_data(update, context)
        return
    user = update.effective_user
    message = update.effective_message
    
    # Определяем тип сообщения для отладки
    message_type = "текст"
    if message.photo:
        message_type = "фото"
    elif message.video:
        message_type = "видео"
    elif message.voice:
        message_type = "голосовое"
    elif message.document:
        message_type = "документ"
    elif message.sticker:
        message_type = "стикер"
    elif message.audio:
        message_type = "аудио"
    
    print(f"🔍 Получено {message_type} сообщение от пользователя {user.id} ({user.first_name}): {message.text or '[медиа]'}")
    
    # Если это администратор и он в режиме ответа
    if (user.id in ADMIN_IDS or (user.username and user.username in ADMIN_USERNAMES)) and context.user_data.get('waiting_for_reply') and context.user_data.get('replying_to'):
        print(f"👨‍💼 Администратор {user.id} отправляет ответ пользователю {context.user_data['replying_to']}")
        target_user_id = context.user_data['replying_to']
        
        try:
            # Отправляем ответ пользователю
            await context.bot.send_message(
                chat_id=target_user_id,
                text=f"💬 <b>Ответ от администратора:</b>\n\n{message.text}",
                parse_mode='HTML'
            )
            
            # Подтверждаем отправку администратору
            await update.effective_message.reply_text(
                f"✅ <b>Ответ отправлен пользователю {target_user_id}</b>",
                parse_mode='HTML'
            )
            
            # Очищаем состояние
            context.user_data.pop('waiting_for_reply', None)
            context.user_data.pop('replying_to', None)
            
        except Exception as e:
            await update.effective_message.reply_text(
                f"❌ <b>Ошибка отправки ответа:</b> {str(e)}",
                parse_mode='HTML'
            )
        return
    
    # Сохраняем сообщение в базе данных
    try:
        await save_message_to_db(user, message)
        print(f"💾 Сообщение сохранено в БД для пользователя {user.id}")
    except Exception as e:
        print(f"❌ Ошибка сохранения сообщения в БД: {e}")
    
    # Если это обычный пользователь (не администратор), отправляем уведомление администраторам
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        print(f"📨 Отправляем уведомление администраторам о сообщении от пользователя {user.id}")
        
        # Формируем информацию о пользователе
        user_info = f"👤 <b>Пользователь:</b>\n"
        user_info += f"ID: {user.id}\n"
        user_info += f"Имя: {user.first_name or 'Не указано'}\n"
        user_info += f"Фамилия: {user.last_name or 'Не указана'}\n"
        user_info += f"Username: @{user.username or 'Не указан'}\n"
        
        # Определяем тип сообщения
        message_type = "Текст"
        message_content = message.text or ""
        
        if message.photo:
            message_type = "Фото"
            message_content = f"[Фото] {message.caption or 'Без подписи'}"
        elif message.video:
            message_type = "Видео"
            message_content = f"[Видео] {message.caption or 'Без подписи'}"
        elif message.voice:
            message_type = "Голосовое сообщение"
            message_content = "[Голосовое сообщение]"
        elif message.document:
            message_type = "Документ"
            message_content = f"[Документ] {message.document.file_name or 'Без названия'}"
        elif message.sticker:
            message_type = "Стикер"
            message_content = f"[Стикер] {message.sticker.emoji or 'Без эмодзи'}"
        elif message.audio:
            message_type = "Аудио"
            message_content = f"[Аудио] {message.audio.title or 'Без названия'}"
        
        # Формируем текст сообщения
        message_text = f"📨 <b>Новое сообщение от пользователя!</b>\n\n{user_info}\n"
        message_text += f"💬 <b>Тип сообщения:</b> {message_type}\n"
        message_text += f"💬 <b>Содержание:</b>\n{message_content}\n\n"
        message_text += f"⚠️ <b>Требуется ответ!</b>"
        
        # Создаем инлайн-кнопку для ответа
        keyboard = [
            [InlineKeyboardButton("Ответить долбаебу", callback_data=f'reply_to_{user.id}')]
        ]
        markup = InlineKeyboardMarkup(keyboard)
        
        # Отправляем уведомление всем администраторам по username
        for admin_username in ADMIN_USERNAMES:
            try:
                print(f"📤 Отправляем уведомление администратору @{admin_username}")
                await context.bot.send_message(
                    chat_id=f"@{admin_username}",
                    text=message_text,
                    parse_mode='HTML',
                    reply_markup=markup
                )
                print(f"✅ Уведомление успешно отправлено администратору @{admin_username}")
            except Exception as e:
                print(f"❌ Ошибка отправки уведомления администратору @{admin_username}: {e}")
                # Попробуем отправить без @
                try:
                    print(f"📤 Пробуем отправить без @ администратору {admin_username}")
                    await context.bot.send_message(
                        chat_id=admin_username,
                        text=message_text,
                        parse_mode='HTML',
                        reply_markup=markup
                    )
                    print(f"✅ Уведомление успешно отправлено администратору {admin_username}")
                except Exception as e2:
                    print(f"❌ Ошибка отправки уведомления администратору {admin_username}: {e2}")
    else:
        print(f"👨‍💼 Сообщение от администратора {user.id} - уведомления не отправляем")

async def cancel_reply(update: Update, context: CallbackContext) -> None:
    """Отменяет режим ответа администратора"""
    user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        return
    
    # Очищаем состояние
    context.user_data.pop('waiting_for_reply', None)
    context.user_data.pop('replying_to', None)
    
    await update.effective_message.reply_text(
        "❌ <b>Режим ответа отменен</b>",
        parse_mode='HTML'
    )

async def admin_messages(update: Update, context: CallbackContext) -> None:
    """Показывает администратору новые сообщения от пользователей"""
    user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.effective_message.reply_text(
            "❌ <b>У вас нет прав для выполнения этого действия!</b>",
            parse_mode='HTML'
        )
        return
    
    try:
        # Получаем последние диалоги с сообщениями
        result = supabase.rpc('get_admin_conversations').execute()
        
        if not result.data:
            await update.effective_message.reply_text(
                "📭 <b>Новых сообщений нет</b>",
                parse_mode='HTML'
            )
            return
        
        # Формируем список диалогов
        conversations_text = "📨 <b>Последние сообщения от пользователей:</b>\n\n"
        
        for i, conv in enumerate(result.data[:10], 1):  # Показываем первые 10
            user_name = conv.get('username', f'Пользователь #{conv["user_id"]}')
            last_message = conv.get('last_message', 'Нет сообщений')[:50] + '...' if len(conv.get('last_message', '')) > 50 else conv.get('last_message', 'Нет сообщений')
            message_count = conv.get('message_count', 0)
            
            conversations_text += f"{i}. <b>{user_name}</b> (ID: {conv['user_id']})\n"
            conversations_text += f"   💬 {last_message}\n"
            conversations_text += f"   📊 Сообщений: {message_count}\n\n"
        
        # Создаем кнопки для ответа
        keyboard = []
        for i, conv in enumerate(result.data[:5], 1):  # Кнопки для первых 5
            keyboard.append([InlineKeyboardButton(f"Ответить {i}", callback_data=f'admin_reply_{conv["user_id"]}')])
        
        keyboard.append([InlineKeyboardButton("🔄 Обновить", callback_data='admin_refresh')])
        
        markup = InlineKeyboardMarkup(keyboard)
        
        await update.effective_message.reply_text(
            conversations_text,
            parse_mode='HTML',
            reply_markup=markup
        )
        
    except Exception as e:
        print(f"Ошибка получения сообщений: {e}")
        await update.effective_message.reply_text(
            f"❌ <b>Ошибка получения сообщений:</b> {str(e)}",
            parse_mode='HTML'
        )

# ---------- Builders for messages & keyboards ----------

def build_start_content():
    text = (
        "Добро пожаловать в шлюз в закрытого канала <b>ФОРМУЛА</b>, где знания не просто ценные, жизненно необходимые.\n\n"
        "<b>💳 Подписка - ежемесячная 1500₽ или ~15$</b>, оплата принимается в любой валюте и крипте.\n"
        "<b>⬇️ Ниже — кнопка. Жмешь — и проходишь туда, где люди не ноют, а ебут этот мир в обе щеки.</b>"
    )
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить доступ", web_app=WebAppInfo(url=PAYMENT_MINIAPP_URL))],
        [InlineKeyboardButton("ℹ️ Подробнее о канале", callback_data='more_info')],
        [InlineKeyboardButton("💻 Поддержка", web_app=WebAppInfo(url=MINIAPP_URL))]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_payment_content():
    text = (
        "💵 Стоимость подписки на Базу\n"
        "1 месяц 1500 рублей\n"
        "6 месяцев 8000 рублей\n"
        "12 месяцев 10 000 рублей\n\n"
        "*цена в долларах/евро - конвертируется по нынешнему курсу\n"
        "*оплачивай любой картой в долларах/евро/рублях, бот сконвертирует сам\n\n"
        "Оплатить и получить доступ\n👇👇👇"
    )
    keyboard = [
        [InlineKeyboardButton("1 месяц", callback_data='pay_1_month')],
        [InlineKeyboardButton("6 месяцев", callback_data='pay_6_months')],
        [InlineKeyboardButton("12 месяцев", callback_data='pay_12_months')],
        [InlineKeyboardButton("🔙 Назад", callback_data='back')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_more_info_content():
    text = (
        "ФОРМУЛА — это золотой рюкзак знаний, с которым ты можешь вылезти из любой жопы.\n"
        "Тут не просто \"мотивация\" и \"развитие\", а рабочие схемы, которые ты не найдёшь даже если будешь копать ебучий Даркнет.\n"
        "🧠 Подкасты с таймкодами — от ПРОФАЙЛИНГА до манипуляций баб, от ПСИХОТИПОВ до коммуникации на уровне спецслужб\n"
        "💉 Органический БИОХАКИНГ — почему тебе плохо и как через неделю почувствовать себя богом\n"
        "💸 Уроки по ФРОДУ, где из нуля делается $5000+ в месяц, если не еблан\n"
        "🧱 Как выстроить дисциплину, отшить самобичевание и наконец стать машиной, а не мямлей\n"
        "📈 Авторские стратегии по трейдингу — от $500/мес на автопилоте\n"
        "⚡ Скальпинг и биржи — как хитрить систему, не теряя бабки на комиссиях\n"
        "🎥 Стримы каждые 2 недели, где разбираю вопросы подписчиков: здоровье, деньги, психика, мышление\n\n"
        "И это лишь малая часть того, что тебя ожидает в Формуле.\n"
        "Это не просто канал. Это сила, которая перестраивает твое мышление под нового тебя.\n"
        "Вокруг тебя — миллион способов сделать бабки, использовать людей и не пахать, пока другие пашут.\n"
        "Ты будешь считывать людей с его профиля в мессенджере, зарабатывать из воздуха и нести себя как король, потому что знаешь больше, чем они когда-либо поймут.\n\n"
        "Кнопка внизу ⬇️. Там не просто инфа. Там выход из стада.\n"
        "Решай."
    )
    keyboard = [
        [InlineKeyboardButton("❓ Задать вопрос", web_app=WebAppInfo(url=MINIAPP_URL))],
        [InlineKeyboardButton("🔙 Назад", callback_data='back')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_checkout_content(duration_label: str):
    text = (
        f"🦍 ЗАКРЫТЫЙ КАНАЛ \"ОСНОВА\" на {duration_label}\n\n"
        "Выберите удобный вид оплаты:\n"
        "*если вы из Украины, включите vpn\n"
        "*при оплате картой — оформляется автосписание каждые 30 дней\n"
        "*далее — вы сможете управлять подпиской в Меню бота\n"
        "*оплата криптой доступна на тарифах 6/12 мес"
    )
    keyboard = [
        [InlineKeyboardButton("💳 Карта (любая валюта)", callback_data='noop')],
        [InlineKeyboardButton("💻 Поддержка", web_app=WebAppInfo(url=MINIAPP_URL))],
        [InlineKeyboardButton("📄 Договор оферты", callback_data='noop')],
        [InlineKeyboardButton("🔙 Назад", callback_data='payment')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


# ---------- Command handlers (send new messages) ----------

# Define the start command handler
async def start(update: Update, context: CallbackContext) -> None:
    text, markup = build_start_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# Define the payment command handler
async def payment(update: Update, context: CallbackContext) -> None:
    text, markup = build_payment_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# Define the more_info command handler
async def more_info(update: Update, context: CallbackContext) -> None:
    text, markup = build_more_info_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# ---------- Callback query handler (edits existing message) ----------

async def button(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == 'more_info':
        text, markup = build_more_info_content()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    elif data == 'back':
        text, markup = build_start_content()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    elif data.startswith('reply_to_'):
        # Обработка кнопки "Ответить долбаебу"
        user_id = data.split('_')[2]  # Получаем ID пользователя
        await handle_admin_reply(update, context, user_id)
    elif data.startswith('admin_reply_'):
        # Обработка кнопки "Ответить" из админ-панели
        user_id = data.split('_')[2]  # Получаем ID пользователя
        await handle_admin_reply(update, context, user_id)
    elif data == 'admin_refresh':
        # Обновление списка сообщений
        await admin_messages(update, context)
    elif data.startswith('check_payment_'):
        # Проверка статуса платежа
        order_id = data.split('_', 2)[2]
        await check_payment_status(update, context, order_id)
    else:
        return

async def handle_webapp_data(update: Update, context: CallbackContext) -> None:
    """Обрабатывает данные от miniapp"""
    try:
        webapp_data = update.message.web_app_data.data
        user = update.effective_user
        
        print(f"📱 Получены данные от miniapp: {webapp_data}")
        
        # Парсим JSON данные
        payment_data = json.loads(webapp_data)
        
        # Создаем уникальный ID заказа
        order_id = f"formula_{user.id}_{int(time.time())}"
        
        # Получаем данные о платеже
        tariff = payment_data.get('tariff', '1_month')
        price = payment_data.get('price', 1500)
        email = payment_data.get('email', 'Не указан')
        bank = payment_data.get('bank', 'Не указан')
        
        # Формируем описание платежа
        tariff_names = {
            '1_month': '1 месяц',
            '6_months': '6 месяцев',
            '12_months': '12 месяцев'
        }
        description = f"Подписка на канал ФОРМУЛА - {tariff_names.get(tariff, tariff)}"
        
        # Создаем платеж через Lava Top
        payment_result = lava_api.create_payment(
            amount=price,
            order_id=order_id,
            description=description
        )
        
        if "error" in payment_result:
            print(f"❌ Ошибка создания платежа: {payment_result['error']}")
            await update.message.reply_text(
                "❌ <b>Ошибка создания платежа</b>\n\n"
                "Пожалуйста, попробуйте еще раз или обратитесь в поддержку.",
                parse_mode='HTML'
            )
            return
        
        # Сохраняем информацию о платеже
        payment_info = {
            "payment_id": payment_result.get("payment_id"),
            "order_id": order_id,
            "user_id": user.id,
            "tariff": tariff,
            "price": price,
            "email": email,
            "bank": bank,
            "status": "pending"
        }
        
        # Сохраняем в контексте для отслеживания
        context.user_data['current_payment'] = payment_info
        
        # Формируем сообщение для администраторов
        admin_message = f"💳 <b>Новый платеж через Lava Top!</b>\n\n"
        admin_message += f"👤 <b>Пользователь:</b> {user.first_name}"
        if user.username:
            admin_message += f" (@{user.username})"
        admin_message += f"\n🆔 <b>ID:</b> {user.id}\n"
        admin_message += f"📧 <b>Email:</b> {email}\n"
        admin_message += f"💵 <b>Тариф:</b> {tariff_names.get(tariff, tariff)}\n"
        admin_message += f"🏦 <b>Банк:</b> {bank}\n"
        admin_message += f"💰 <b>Сумма:</b> {price} RUB\n"
        admin_message += f"🆔 <b>Order ID:</b> {order_id}\n"
        admin_message += f"💳 <b>Payment ID:</b> {payment_result.get('payment_id', 'Не получен')}\n\n"
        admin_message += f"⏰ <b>Время:</b> {update.message.date.strftime('%d.%m.%Y %H:%M:%S')}"
        
        # Отправляем уведомление всем администраторам
        for admin_id in ADMIN_IDS:
            try:
                await context.bot.send_message(
                    chat_id=admin_id,
                    text=admin_message,
                    parse_mode='HTML'
                )
            except Exception as e:
                print(f"❌ Ошибка отправки уведомления администратору {admin_id}: {e}")
        
        # Отправляем ссылку на оплату пользователю
        payment_url = payment_result.get("payment_url")
        if payment_url:
            keyboard = [
                [InlineKeyboardButton("💳 Оплатить", url=payment_url)],
                [InlineKeyboardButton("📊 Статус платежа", callback_data=f'check_payment_{order_id}')],
                [InlineKeyboardButton("💬 Поддержка", url="https://t.me/acqu1red")]
            ]
            markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                "✅ <b>Платеж создан успешно!</b>\n\n"
                f"💵 <b>Сумма:</b> {price} RUB\n"
                f"📦 <b>Тариф:</b> {tariff_names.get(tariff, tariff)}\n"
                f"🆔 <b>Order ID:</b> {order_id}\n\n"
                "Нажмите кнопку ниже для перехода к оплате:",
                parse_mode='HTML',
                reply_markup=markup
            )
        else:
            await update.message.reply_text(
                "❌ <b>Ошибка получения ссылки на оплату</b>\n\n"
                "Пожалуйста, обратитесь в поддержку.",
                parse_mode='HTML'
            )
        
    except Exception as e:
        print(f"❌ Ошибка обработки данных miniapp: {e}")
        await update.message.reply_text(
            "❌ <b>Ошибка обработки заявки</b>\n\n"
            "Пожалуйста, попробуйте еще раз или обратитесь в поддержку.",
            parse_mode='HTML'
        )


async def check_payment_status(update: Update, context: CallbackContext, order_id: str) -> None:
    """Проверяет статус платежа"""
    query = update.callback_query
    await query.answer()
    
    try:
        # Получаем информацию о платеже из контекста
        payment_info = context.user_data.get('current_payment')
        
        if not payment_info or payment_info.get('order_id') != order_id:
            await query.edit_message_text(
                "❌ <b>Платеж не найден</b>\n\n"
                "Пожалуйста, создайте новый платеж.",
                parse_mode='HTML'
            )
            return
        
        payment_id = payment_info.get('payment_id')
        if not payment_id:
            await query.edit_message_text(
                "❌ <b>ID платежа не найден</b>\n\n"
                "Пожалуйста, обратитесь в поддержку.",
                parse_mode='HTML'
            )
            return
        
        # Проверяем статус через Lava Top API
        status_result = lava_api.get_payment_status(payment_id)
        
        if "error" in status_result:
            await query.edit_message_text(
                "❌ <b>Ошибка проверки статуса</b>\n\n"
                f"Ошибка: {status_result['error']}\n"
                "Пожалуйста, попробуйте позже.",
                parse_mode='HTML'
            )
            return
        
        status = status_result.get('status', 'unknown')
        amount = status_result.get('amount', payment_info.get('price', 'Неизвестно'))
        
        status_messages = {
            'pending': '⏳ Ожидает оплаты',
            'paid': '✅ Оплачен',
            'failed': '❌ Ошибка оплаты',
            'expired': '⏰ Время истекло',
            'cancelled': '🚫 Отменен'
        }
        
        status_text = status_messages.get(status, f'❓ Статус: {status}')
        
        keyboard = []
        if status == 'pending':
            keyboard.append([InlineKeyboardButton("🔄 Обновить", callback_data=f'check_payment_{order_id}')])
        keyboard.append([InlineKeyboardButton("💬 Поддержка", url="https://t.me/acqu1red")])
        
        markup = InlineKeyboardMarkup(keyboard) if keyboard else None
        
        await query.edit_message_text(
            f"📊 <b>Статус платежа</b>\n\n"
            f"🆔 <b>Order ID:</b> {order_id}\n"
            f"💳 <b>Payment ID:</b> {payment_id}\n"
            f"💰 <b>Сумма:</b> {amount} RUB\n"
            f"📊 <b>Статус:</b> {status_text}\n\n"
            f"⏰ <b>Время проверки:</b> {update.effective_message.date.strftime('%d.%m.%Y %H:%M:%S')}",
            parse_mode='HTML',
            reply_markup=markup
        )
        
        # Если платеж оплачен, уведомляем администраторов
        if status == 'paid':
            admin_message = f"✅ <b>Платеж успешно оплачен!</b>\n\n"
            admin_message += f"🆔 <b>Order ID:</b> {order_id}\n"
            admin_message += f"💳 <b>Payment ID:</b> {payment_id}\n"
            admin_message += f"💰 <b>Сумма:</b> {amount} RUB\n"
            admin_message += f"👤 <b>Пользователь:</b> {update.effective_user.first_name}"
            if update.effective_user.username:
                admin_message += f" (@{update.effective_user.username})"
            admin_message += f"\n🆔 <b>User ID:</b> {update.effective_user.id}\n\n"
            admin_message += f"⏰ <b>Время оплаты:</b> {update.effective_message.date.strftime('%d.%m.%Y %H:%M:%S')}"
            
            for admin_id in ADMIN_IDS:
                try:
                    await context.bot.send_message(
                        chat_id=admin_id,
                        text=admin_message,
                        parse_mode='HTML'
                    )
                except Exception as e:
                    print(f"❌ Ошибка отправки уведомления администратору {admin_id}: {e}")
        
    except Exception as e:
        print(f"❌ Ошибка проверки статуса платежа: {e}")
        await query.edit_message_text(
            "❌ <b>Ошибка проверки статуса</b>\n\n"
            "Пожалуйста, попробуйте позже или обратитесь в поддержку.",
            parse_mode='HTML'
        )


async def handle_admin_reply(update: Update, context: CallbackContext, user_id: str) -> None:
    """Обрабатывает нажатие кнопки 'Ответить долбаебу' администратором"""
    query = update.callback_query
    admin_user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if admin_user.id not in ADMIN_IDS and (admin_user.username is None or admin_user.username not in ADMIN_USERNAMES):
        await query.answer("У вас нет прав для выполнения этого действия!")
        return
    
    # Сохраняем информацию о том, что администратор хочет ответить пользователю
    context.user_data['replying_to'] = user_id
    
    # Отправляем сообщение администратору с инструкциями
    reply_text = f"💬 <b>Ответ пользователю {user_id}</b>\n\n"
    reply_text += "Напишите ваш ответ. Он будет отправлен пользователю.\n"
    reply_text += "Для отмены напишите /cancel"
    
    await query.edit_message_text(text=reply_text, parse_mode='HTML')
    
    # Устанавливаем состояние ожидания ответа администратора
    context.user_data['waiting_for_reply'] = True


# ---------- App bootstrap ----------

# Main function to start the bot
def main() -> None:
    print("🚀 Запуск бота...")
    print(f"👥 Администраторы по ID: {ADMIN_IDS}")
    print(f"👥 Администраторы по username: {ADMIN_USERNAMES}")
    
    application = ApplicationBuilder().token("8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo").build()

    print("📝 Регистрация обработчиков...")
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("payment", payment))
    application.add_handler(CommandHandler("more_info", more_info))
    application.add_handler(CommandHandler("cancel", cancel_reply))
    application.add_handler(CommandHandler("messages", admin_messages))
    application.add_handler(CallbackQueryHandler(button))
    
    # Обработчик для всех сообщений (уведомления администраторов и ответы от них)
    # Обрабатываем ВСЕ сообщения от пользователей, включая медиа
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    print("✅ Обработчик всех сообщений зарегистрирован")

    print("🔄 Запуск polling...")
    application.run_polling()


if __name__ == '__main__':
    main()

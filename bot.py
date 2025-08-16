from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, filters, Application
from queue import Queue
from telegram.ext import ApplicationBuilder
import pytz
from telegram.ext import CallbackQueryHandler
from supabase import create_client, Client
import asyncio
import json
# channel_manager import removed - not needed for webhook version

MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/?type=support"
PAYMENT_MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/payment.html"
SUBSCRIPTION_MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/subscription.html"
ISLAND_MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/docs/island.html"

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
        [InlineKeyboardButton("🏝️ Остров навигации", web_app=WebAppInfo(url=ISLAND_MINIAPP_URL))],
        [InlineKeyboardButton("📋 Меню подписки", web_app=WebAppInfo(url=SUBSCRIPTION_MINIAPP_URL))],
        [InlineKeyboardButton("ℹ️ Подробнее о канале", callback_data='more_info')],
        [InlineKeyboardButton("💻 Поддержка", web_app=WebAppInfo(url=MINIAPP_URL))],
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





# ---------- Command handlers (send new messages) ----------

# Define the start command handler
async def start(update: Update, context: CallbackContext) -> None:
    text, markup = build_start_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)



# Define the more_info command handler
async def more_info(update: Update, context: CallbackContext) -> None:
    text, markup = build_more_info_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# ---------- Callback query handler (edits existing message) ----------



async def menu(update: Update, context: CallbackContext) -> None:
    text, markup = build_start_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)

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
    else:
        return





async def handle_webapp_data(update: Update, context: CallbackContext) -> None:
    """(Legacy) Данные от старой версии MiniApp: больше не создаём платёж здесь.
    Новый поток оплаты: MiniApp → Railway /api/pay/create → lava.top.
    Этот обработчик оставлен только для мягкой миграции пользователей со старой версии.
    """
    try:
        await update.message.reply_text(
            "ℹ️ Оплата теперь происходит прямо в MiniApp (кнопка «Оплатить доступ»).\n"
            "Если страница оплаты не открылась, нажмите сюда: " + PAYMENT_MINIAPP_URL,
            parse_mode='HTML'
        )
    except Exception as e:
        print(f"Ошибка legacy-webapp handler: {e}")



async def check_expired_subscriptions(update: Update, context: CallbackContext) -> None:
    """Проверяет и удаляет пользователей с истекшей подпиской"""
    user = update.effective_user
    
    # Проверяем, является ли пользователь администратором
    if user.id not in ADMIN_IDS and (user.username is None or user.username not in ADMIN_USERNAMES):
        await update.effective_message.reply_text("У вас нет прав для выполнения этого действия!")
        return
    
    try:
        
        await update.effective_message.reply_text(
            "✅ <b>Проверка истекших подписок завершена!</b>\n\n"
            "Все пользователи с истекшей подпиской удалены из канала.",
            parse_mode='HTML'
        )
            
    except Exception as e:
        print(f"Ошибка проверки истекших подписок: {e}")
        await update.effective_message.reply_text(
            f"❌ <b>Ошибка проверки подписок:</b> {str(e)}",
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
    
    application = ApplicationBuilder().token("7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc").build()
    
    print("📝 Регистрация обработчиков...")
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("menu", menu))
    application.add_handler(CommandHandler("more_info", more_info))
    application.add_handler(CommandHandler("cancel", cancel_reply))
    application.add_handler(CommandHandler("messages", admin_messages))
    application.add_handler(CommandHandler("check_expired", check_expired_subscriptions))
    application.add_handler(CallbackQueryHandler(button))
    
    # Обработчик для управления каналом отключен - используем webhook версию
    print("✅ Обработчик управления каналом отключен (webhook версия)")
    
    # Обработчик для всех сообщений (уведомления администраторов и ответы от них)
    # Обрабатываем ВСЕ сообщения от пользователей, включая медиа
    application.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, handle_all_messages))
    print("✅ Обработчик всех сообщений зарегистрирован")

    print("🔄 Запуск polling...")
    application.run_polling()


if __name__ == '__main__':
    main()
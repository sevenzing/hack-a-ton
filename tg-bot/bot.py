import telebot

# from tg.telegram_hidden import TOKEN

my_bot = telebot.TeleBot("5444543656:AAFc6fjdan0_V77kiNRtNYD9jCkp5nxtXQE")

@my_bot.message_handler(commands=['start'])
def send_welcome(message):
	# check if user in db already
	my_bot.send_message(message.chat.id, text="Hi!\nThis bot created for easier use private rpc nodes with Payment channels!")
	msg = my_bot.send_message(message.chat.id, text="Please, send your public key")
	my_bot.register_next_step_handler(msg, get_public_key)


def get_public_key(message):
	print("Public key:" + message.text)
	# save info into db
	auth_token = "ton hueta"
	my_bot.send_message(message.chat.id, text=f"Nice!\nYour auth token is: `{auth_token}`")
	my_bot.send_message(message.chat.id, text="*type* /finish then you wanna `close contract`", parse_mode='Markdown')
	my_bot.send_chat_action(message.chat.id, "typing")

@my_bot.message_handler(commands=['finish'])
def finish(message):
	# get text to sign
	msg = my_bot.send_message(message.chat.id, text="Please, sign this text")
	my_bot.register_next_step_handler(msg, sign)

def sign(message):
	# throw signed text
	# update db
	print(f"Signed text: {message.text}")
	my_bot.send_message(message.chat.id, text="That's all! Thank you!")
	my_bot.send_message(message.chat.id, text="type /start if you wanna continue")

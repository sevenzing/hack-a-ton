import telebot
import requests

# from tg.telegram_hidden import TOKEN

my_bot = telebot.TeleBot("5444543656:AAFc6fjdan0_V77kiNRtNYD9jCkp5nxtXQE")

port = 3000

@my_bot.message_handler(commands=['start'])
def send_welcome(message):    
    user_id = message.from_user.id

    # check if user in db already
    r = requests.post(f"http://localhost:{port}/api/check-user-in-db", data={'telegram_id': user_id})

    result = r.json()['result']

    if result == 'false':
        # register
        print("registration is activated")
        my_bot.send_message(message.chat.id,
                            text="Hi!\nThis bot created for easier use private rpc nodes with Payment channels!")
        msg = my_bot.send_message(message.chat.id,
                                  text="Please, text your secret phraze\n(words in order with separated by a spaces)")
        my_bot.register_next_step_handler(msg, get_private_key)
    elif result == 'true':
        # user exist
        my_bot.send_message(message.chat.id, text=f"I found your account in database! Our pricing:\n1 request = {price}")
        msg = my_bot.send_message(message.chat.id, text="Please, text how much TON you want to spend\ne.g.:0.1")
        my_bot.register_next_step_handler(msg, get_prices)



def get_private_key(message):
    user_id = message.from_user.id

    # save info into db
    r = requests.post(f"http://localhost:{port}/api/save-user-in-db",
                       data={'telegram_id': user_id, 'private_key': message.text})

    result = r.json()['result']

    if result != 'ok':
        print("All is bad")

    price = 1
    my_bot.send_message(message.chat.id, text=f"Cool! Our pricing:\n1 request = {price}")
    msg = my_bot.send_message(message.chat.id, text="Please, text how much TON you want to spend\ne.g.:0.1")
    my_bot.register_next_step_handler(msg, get_prices)
    

def get_prices(message):
    user_id = message.from_user.id
    deposit = message.text

    # update db with deposit
    r = requests.post(f"http://localhost:{port}/api/init-user-balance",
                       data={'telegram_id': user_id, 'balance': deposit})

    result = r.json()['result']

    if result != 'ok':
        print("All is bad")

    get_auth_key(message)

def get_auth_key(message):
    user_id = message.from_user.id
    # get auth token + ref

    r = requests.post(f"http://localhost:{port}/api/get_auth_key",
                       data={'telegram_id': user_id})


    if r.status_code != 200:
        my_bot.send_message(message.chat.id, text="DB throw error :(", parse_mode='Markdown')
        return

    json = r.json() 
    url = json['url']
    auth_token = json['auth_key']

    my_bot.send_chat_action(message.chat.id, "typing")
    my_bot.send_message(message.chat.id, text=f"***Nice!***\nYour auth token is:\n`{auth_token}`",
                        parse_mode='Markdown')
    my_bot.send_message(message.chat.id, text=f"use this url: {url}")
    my_bot.send_message(message.chat.id, text="*type* /finish then you wanna `close contract`",
                        parse_mode='Markdown')


@my_bot.message_handler(commands=['finish'])
def finish(message):
    user_id = message.from_user.id
    # throw finish into back
    # get statistics?
    r = requests.post(f"http://localhost:{port}/api/finish",
                       data={'telegram_id': user_id})

    info = r.json()
    my_bot.send_message(message.chat.id, text=f"Tnanks! Statiscis: {info}")
    my_bot.send_message(message.chat.id, text=f"type /start to restart")


@my_bot.message_handler(commands=['info'])
def info(message):
    user_id = message.from_user.id
    # get statistics
    r = requests.post(f"http://localhost:{port}/api/info",
                       data={'telegram_id': user_id})

    info = r.json()
    my_bot.send_message(message.chat.id, text=f"Statiscis: {info}")


@my_bot.message_handler(commands=['help'])
def help(message):
    # get statistics
    my_bot.send_message(message.chat.id,
                        text="""This bot created to provide developers possibility
of using ***private rpc nodes*** easier.\n
In our project we are using [Payment Channels](https://telegra.ph/TON-Payments-07-01)
for the convenience of working with rpc nodes.\n
Comands:\n/start - Start\n/help - Help\n/finish - Finish
/info - Get statistics while processing""", parse_mode="Markdown")
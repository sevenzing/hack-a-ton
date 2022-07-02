from tracemalloc import Statistic
import telebot
import requests

# from tg.telegram_hidden import TOKEN

my_bot = telebot.TeleBot("5444543656:AAFc6fjdan0_V77kiNRtNYD9jCkp5nxtXQE")

@my_bot.message_handler(commands=['start'])
def send_welcome(message):    
    user_id = message.from_user.id

    # check if user in db already
    r = requests.post("http://localhost:3000/api/check-user-in-db", data={'telegram_id': user_id})

    result = r.json()['result']

    if result == 'false':
        # register
        print("registration is activated")
        my_bot.send_message(message.chat.id,
                            text="Hi!\nThis bot created for easier use private rpc nodes with Payment channels!")
        msg = my_bot.send_message(message.chat.id, text="Please, send your private key")
        my_bot.register_next_step_handler(msg, get_private_key)
    elif result == 'true':
        # user exist
        print("user exist")
        msg = my_bot.send_message(message.chat.id, text="I found you in our database")


def get_private_key(message):
    user_id = message.from_user.id

    # save info into db
    r = requests.post("http://localhost:3000/api/save-user-in-db",
                      data={'telegram_id': user_id, 'private_key': message.text})

    result = r.json()['result']

    if result != 'ok':
        print("All is bad")

    auth(message)


def auth(message):
    user_id = message.from_user.id
    # get auth token + ref

    r = requests.post("http://localhost:3000/api/auth-user",
                      data={'telegram_id': user_id})

    if r.status_code != 200:
        my_bot.send_message(message.chat.id, text="Всё хуёво", parse_mode='Markdown')
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
    r = requests.post("http://localhost:3000/api/finish",
                    data={'telegram_id': user_id})

    info = r.json()
    statistics = {"ton":"pizdec"}
    my_bot.send_message(message.chat.id, text=f"Tnanks! Statiscis: {info}")
    my_bot.send_message(message.chat.id, text=f"type /start to restart")

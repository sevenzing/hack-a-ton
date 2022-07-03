import telebot
import requests
from time import sleep

from constants import *

my_bot = telebot.TeleBot("5444543656:AAFc6fjdan0_V77kiNRtNYD9jCkp5nxtXQE")

port = 3000

price = 0.01

@my_bot.message_handler(commands=['start'])
def send_welcome(message):    
    user_id = message.from_user.id
    # check if user in db already
    r = requests.post(f"http://localhost:{port}/api/check-user-in-db", data={'telegram_id': user_id})
    result = r.json()['result']

    if result == 'false':
        # register
        my_bot.send_message(message.chat.id, text=MSG_WELCOME)
        msg = my_bot.send_message(message.chat.id, text=MSG_SECRET_KEY)
        my_bot.register_next_step_handler(msg, get_private_key)
    elif result == 'true':
        # user exist
        my_bot.send_message(message.chat.id, text=MSG_FOUND_DB)
        my_bot.send_message(message.chat.id, text=MSG_PRICING(price))
        msg = my_bot.send_message(message.chat.id, text=MSG_GET_PRICE)
        my_bot.register_next_step_handler(msg, get_prices)


def get_private_key(message):
    user_id = message.from_user.id

    if len(message.text.split(' ')) != 24:
        msg = my_bot.send_message(message.chat.id, text="Please, try again")
        my_bot.register_next_step_handler(msg, get_private_key)
        return
    # save info into db
    r = requests.post(f"http://localhost:{port}/api/save-user-in-db",
                       data={'telegram_id': user_id, 'private_key': message.text})
    data = r.json()
    result = data['result']

    if result != 'ok':
        my_bot.send_message(message.chat.id, text=MSG_ERROR % data.get('error'))
        return


    my_bot.send_message(message.chat.id, text=MSG_SUCCESS)
    my_bot.send_message(message.chat.id, text=MSG_PRICING(price))
    msg = my_bot.send_message(message.chat.id, text=MSG_INIT_BALANCE)
    my_bot.register_next_step_handler(msg, get_prices)


def get_prices(message):
    user_id = message.from_user.id
    deposit = message.text
    try:
        int(deposit)
    except ValueError:
        my_bot.send_message(message.chat.id, text=MSG_ERROR % 'invalid number')
        return
    # update db with deposit
    r = requests.post(f"http://localhost:{port}/api/init-user-balance",
                       data={'telegram_id': user_id, 'balance': deposit})
    data = r.json()
    result = data['result']

    if result != 'ok':
        my_bot.send_message(message.chat.id, text=MSG_ERROR % data.get('error'))
        return

    get_auth_key(message)


def get_auth_key(message):
    user_id = message.from_user.id
    # get auth token + ref
    my_bot.send_message(message.chat.id, text=MSG_WAIT, parse_mode='Markdown')
    my_bot.send_chat_action(message.chat.id, "typing")

    r = requests.post(f"http://localhost:{port}/api/get_auth_key",
                       data={'telegram_id': user_id})
    if r.status_code != 200:
        error = ''
        try:
            error = r.json().get('error')
        except:
            pass
        my_bot.send_message(message.chat.id, text=MSG_ERROR % error)
        return

    json = r.json() 
    url = json['url']
    auth_token = json['auth_key']
    contract_address = json.get('contract_address')

    text = MSG_DEPLOYMENT_DONE(contract_address, auth_token, url)
    my_bot.send_message(message.chat.id, text=text, parse_mode='Markdown')
    my_bot.send_message(message.chat.id, text=MSG_TYPE_FINISH, parse_mode='Markdown')


@my_bot.message_handler(commands=['finish'])
def finish(message):
    user_id = message.from_user.id
    
    my_bot.send_message(message.chat.id, text=MSG_WAIT)

    r = requests.post(f"http://localhost:{port}/api/finish",
                       data={'telegram_id': user_id})
    if r.status_code != 200:
        error = ''
        try:
            error = r.json().get('error')
        except:
            pass

        my_bot.send_message(message.chat.id, text=MSG_ERROR % error)
        return

    info(message)
    my_bot.send_message(message.chat.id, text=MSG_RESTART)


@my_bot.message_handler(commands=['info'])
def info(message):
    user_id = message.from_user.id
    # get statistics
    r = requests.post(f"http://localhost:{port}/api/info",
                       data={'telegram_id': user_id})
    if r.status_code != 200:
        error = ''
        try:
            error = r.json().get('error')
        except:
            pass
        my_bot.send_message(message.chat.id, text=MSG_ERROR % error)
        return

    info = r.json()
    money_spent = info.get('money_spent')
    money_left = info.get('money_left')
    num_of_req = info.get('num_of_req')
    active = info.get('active')
    my_bot.send_message(message.chat.id, text=MSG_STATISTICS(money_spent, money_left, num_of_req, active), parse_mode='Markdown')


@my_bot.message_handler(commands=['help'])
def help(message):
    my_bot.send_message(message.chat.id, text=MSG_HELP, parse_mode="Markdown")

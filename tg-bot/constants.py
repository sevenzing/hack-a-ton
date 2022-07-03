PRICE = 0.01

MSG_WELCOME = "Hi!\nThis bot created for easier use private rpc nodes with Payment channels!"
MSG_SECRET_KEY = "Please, text your secret phraze\n(words in order with separated by a spaces)"
MSG_FOUND_DB = "I found your account in database!"
MSG_PRICING =  f"Our pricing:\n{PRICE} TON per request"
MSG_GET_PRICE = "Please, text how much TON you want to spend\ne.g.:0.1"
MSG_ERROR = "Something went wrong, please send feedback to @YaStepan"
MSG_SUCCESS = "All is good!"
MSG_INIT_BALANCE = "Please, text how much TON you want to spend\ne.g.:0.1"
MSG_TYPE_FINISH = "*Type* /finish then you wanna `close contract`"
MSG_RESTART = "Type /start to restart"

def MSG_AUTH_TOKEN(auth_token):
    return f"***Nice!***\nYour auth token is:\n`{auth_token}`"

def MSG_USE_URL(url):
    return f"Use this url: {url}"

def MSG_STATISTICS(info):
    return f"Statiscis: {info}"

MSG_HELP = """
This bot created to provide developers possibility
of using ***private rpc nodes*** easier.
In our project we are using [Payment Channels](https://telegra.ph/TON-Payments-07-01)
for the convenience of working with rpc nodes.
Comands:\n/start - Start\n/help - Help\n/finish - Finish
/info - Get statistics while processing
"""
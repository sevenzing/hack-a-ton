

MSG_WELCOME = "Hi!\nThis bot created for easier use private rpc nodes with Payment channels!"
MSG_SECRET_KEY = "This is demo project for hack-a-ton, and for simplicity of transaction sending, we ask you to send your secret phraze\n(words in order with separated by a spaces)"
MSG_FOUND_DB = "Glad to see you again!"

MSG_GET_PRICE = "Please, text what is the maximum number of TONS you want to spend (e.g. 0.1, 1, 10)\nWe will charge this amount to channel contract."
MSG_ERROR = "Something went wrong, please send feedback to @YaStepan\n\n%s"

MSG_SUCCESS = "All is good!"
MSG_TYPE_FINISH = "*Type* /finish then you wanna `close contract`"
MSG_RESTART = "Type /start to restart"
MSG_WAIT = "Ok! Contract deployment and transaction sending may take a while, please wait about 1 minute"
def MSG_DEPLOYMENT_DONE(contract_address, auth_token, url):
    return f"""Nice! Contract was deployed at `{contract_address}`
Your auth token is:
`{auth_token}`
Your url is:
`{url}`

Add your auth token to url like that:

`curl {url} -H "Authorization: {auth_token}"`
"""


def MSG_STATISTICS(money_spent, money_left, num_of_req, active):
    return f"Statiscis:\n\nIs active: {active}\nNumber of requests: `{num_of_req}`\nMoney spent: {money_spent} TON\nMoney left: {money_left} TON"

def MSG_PRICING(price):
    return f"Our pricing:\n{price} TON per request"

MSG_HELP = """
This bot created to provide developers possibility
of using ***private rpc nodes*** easier.
In our project we are using [Payment Channels](https://telegra.ph/TON-Payments-07-01)
for the convenience of working with rpc nodes.
Comands:\n/start - Start\n/help - Help\n/finish - Finish
/info - Get statistics while processing
"""


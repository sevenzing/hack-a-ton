from flask import Flask, request
import requests

balancer = Flask(__name__)

node_url = "https://apple.com"
backend_url = ""

def process_user(token):
    response = requests.post(backend_url, json={"access_key": token})
    if response.status_code == 200:
        return True
    return False


@balancer.route("/", defaults={"path": ""})
@balancer.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def router(path="/"):

    headers = request.headers
    token = headers.get("Authorization")
    result = process_user(token)

    if result:

        method = request.method
        data = request.data
        print(f"USER USED REQUEST TO {node_url}/{path} with method: {method}")

        if method == "GET":
            response = requests.get(f"{node_url}/{path}", params=request.args)
        if method == "POST":
            response = requests.post(f"{node_url}/{path}", data=data)
        if method == "PUT":
            response = requests.put(f"{node_url}/{path}", data=data)
        if method == "DELETE":
            response = requests.delete(f"{node_url}/{path}")

        return response.content, response.status_code

    return "Error"


if __name__ == "main":
    balancer.run(host="0.0.0.0", debug=True)

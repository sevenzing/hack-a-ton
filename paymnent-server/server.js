const express = require('express')
const bodyParser = require('body-parser');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.post('/api/check-user-in-db', check_user_in_db);

app.post('/api/save-user-in-db', save_user_in_db);

app.post('/api/init-user-balance', set_balance);

app.post('/api/get_auth_key', get_auth_key);

app.post('/api/info', info);

app.post('/api/finish', close);

app.post('/api/tick', tick);

app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`);
});

function check_user_in_db(req, res) {
  try {
    // check if user exist in db

    console.log("New user with tg_id=" + req.body.telegram_id);
    // res.status(200).json({result:"true"});
    res.status(200).json({result:"false"});
    // res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function save_user_in_db(req, res) {
  try {
    // save user
    console.log(req.body.telegram_id);
    console.log(req.body.private_key);
  
    res.status(200).json({result:"ok"});
  
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function get_auth_key(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    // try to start poolling user with tg_id

    // balancer is on here
    res.status(200).json({result:"ok", url:"https://google.com", auth_key:"lalala"});
  
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function close(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    // kill node and send contract

    // balancer is off here
    let money_spent = 10000.0 / 1000;
    let num_of_req = 5;

    res.status(200).json({result:"ok",num_of_req:num_of_req, money_spent:money_spent });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function set_balance(req, res) {
  try {
    let tg_id = req.body.telegram_id;
    let balance = req.body.balance;

    // update db 

    res.status(200).json({result:"ok"});
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function info(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    // get info

    let money_spent = 10000.0 / 1000;
    let num_of_req = 5;

    res.status(200).json({result:"ok",num_of_req:num_of_req, money_spent:money_spent });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function tick(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    res.status(200).json({result:"ok"});
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}
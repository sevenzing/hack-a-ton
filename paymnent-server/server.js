const express = require('express')
const bodyParser = require('body-parser');

const tonMnemonic = require("tonweb-mnemonic");

const {toNano, BN, close_channel, start_channel} = require("./blockchain");
const app = express()
const port = 3000

const db = require("./db_functions.js")

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
    if (db.check_is_tg_id_exists(req.body.telegram_id)) {
      console.log("this user exist");
      res.status(200).json({result:"true"});
    } else {
      console.log("new user");
      res.status(200).json({result:"false"});
    }
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
    db.add_telegram_id(req.body.telegram_id);
    db.set_private_key_by_tg_id(req.body.telegram_id, req.body.private_key);
    // db.set_active_by_tg_id(req.body.telegram_id, false);
    
    res.status(200).json({result:"ok"});

  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

async function get_auth_key(req, res) {
  try {
    let tg_id = req.body.telegram_id;
    let balance = req.body.balance;

    let auth_token = (Math.round(Math.random() * 0xfffff * 1000000)).toString(16);

    let data = db.get_info_by_tg_id(tg_id);
    let private_key = data.private_key;
    let init

    let seed = await tonMnemonic.mnemonicToSeed(private_key.split(' '));
    // console.log(seed);
    // start_channel(seed, balance, )
    // db.set_auth_key_by_tg_id(tg_id, auth_token);
    // db.set_active_by_tg_id(tg_id, true);

    // console.log(auth_token);
    // try to start poolling user with tg_id
    // start_channel()

    // balancer is on here
    res.status(200).json({result:"ok", url:"https://google.com", auth_key:auth_token});
  
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function close(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    // db.set_active_by_tg_id(tg_id, false);

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

    // db.set_initial_balance_by_tg_id(tg_id, balance);

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


    // let info = db.get_info_by_tg_id(tg_id);
    // info['field name'] - field value
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
    let auth_key = req.body.access_key;

    // let balance_old = db.get_info_by_auth_key(auth_key)['current_balance'];
    // let balance_new = balance_old + ...;
    // db.set_current_balance_by_auth_key(auth_key, balance_new);

    // find user by access_key and change balance
    res.status(200).json({result:"ok"});
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}
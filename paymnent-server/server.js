const express = require('express')
const bodyParser = require('body-parser');

// const {toNano, BN, close_channel, start_channel} = require("./blockchain");
const app = express()
const port = 3000

const Client = require('pg-native')
const db_port = 5432;

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


function check_user_in_db_query(telegram_id) {
  const client = new Client()
  let connStr = 'postgresql://postgres:postgres@localhost:' + db_port + '/pg_db';
  client.connectSync(connStr);
  let result = true;
  try {
      res = client.querySync('SELECT COUNT(1) FROM rpc_db.user WHERE telegram_id = \'' + telegram_id + '\'');
      if (res[0].count == 0) {
          result = false;
      }
  } catch(err) {
      console.log(err.message);
      result = false;
  }


  client.end();
  return result;
}

function check_user_in_db(req, res) {
  try {
    // check if user exist in db
    console.log("New user with tg_id=" + req.body.telegram_id);
    if (check_user_in_db_query(req.body.telegram_id)) {
      res.status(200).json({result:"true"});
    } else {
      res.status(200).json({result:"false"});
    }
    // res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}



function save_user_in_db_query(telegram_id, private_key) {
  const client = new Client()
  let connStr = 'postgresql://postgres:postgres@localhost:' + db_port + '/pg_db';
  client.connectSync(connStr);
  try {
      client.querySync('insert into rpc_db.user values (\'' + telegram_id + '\', \'' + private_key + '\')');
  } catch(err) {
      console.log(err.message);
  }
  client.end();
  return result;
}

function save_user_in_db(req, res) {
  try {
    // save user
    console.log(req.body.telegram_id);
    console.log(req.body.private_key);
    save_user_in_db_query(req.body.telegram_id, req.body.private_key);
    res.status(200).json({result:"ok"});

  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}

function get_auth_key(req, res) {
  try {
    let tg_id = req.body.telegram_id;

    let auth_token = (Math.round(Math.random() * 0xfffff * 1000000)).toString(16);
    
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
    let tg_id = req.body.access_key;

    // find user by access_key and change balance
    res.status(200).json({result:"ok"});
  } catch (err) {
    console.log(err.message);
    res.sendStatus(400);
  }
}
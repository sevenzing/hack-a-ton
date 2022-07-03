const express = require('express')
const bodyParser = require('body-parser')
const uuid = require("UUID")
const tonMnemonic = require("tonweb-mnemonic")
const config = require('./config')
const TonWeb = require("tonweb");

const {toNano, BN, close_channel, start_channel} = require("./blockchain")
const app = express()
const port = 3000

const db = require("./db_functions.js")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.post('/api/check-user-in-db', check_user_in_db)

app.post('/api/save-user-in-db', save_user_in_db)

app.post('/api/init-user-balance', set_balance)

app.post('/api/get_auth_key', get_auth_key)

app.post('/api/info', info)

app.post('/api/finish', close)

app.post('/api/tick', tick)


app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}`)
})

function check_user_in_db(req, res) {
  try {
    // check if user exist in db
    console.log("New user with tg_id=" + req.body.telegram_id)
    if (db.check_is_tg_id_exists(req.body.telegram_id)) {
      console.log("this user exist")
      res.status(200).json({result:"true"})
    } else {
      console.log("new user")
      res.status(200).json({result:"false"})
    }
    // res.sendStatus(200)
  } catch (err) {
    console.log(err.message)
    res.sendStatus(400)
  }
}

function save_user_in_db(req, res) {
  try {
    // save user
    console.log(req.body.telegram_id)
    console.log(req.body.private_key)
    db.add_telegram_id(req.body.telegram_id)
    db.set_private_key_by_tg_id(req.body.telegram_id, req.body.private_key)
    // db.set_active_by_tg_id(req.body.telegram_id, false)
    
    res.status(200).json({result:"ok"})

  } catch (err) {
    console.log(err.message)
    res.sendStatus(400)
  }
}

async function get_auth_key(req, res) {
  try {
    let tg_id = req.body.telegram_id
    
    let data = db.get_info_by_tg_id(tg_id)
    console.log("get auth key for user: ", data)
    if (data.active) {
      res.status(400).json({result: "error", "error": "Your account already active"})
      return
    }
    let private_key = data.private_key
    let balance = data.initial_balance
    
    let seed = await tonMnemonic.mnemonicToSeed(private_key.split(' '))
    let channel_id = 5
    let [channel_status, channel] = await start_channel(seed, new BN(balance), channel_id)

    if (channel_status == 1) {
      let auth_key = uuid.v4()
      db.set_auth_key_by_tg_id(tg_id, auth_key)
      db.set_active_by_tg_id(tg_id, true)
      db.set_channel_by_tg_id(tg_id, channel_id)
      let contract_address = (await channel.getAddress()).toString(true, true, true)
      res.status(200).json({result:"ok", url:"https://google.com", auth_key, contract_address})
    } else {
      res.status(400).json({result: "error", "error": "Cannot create channel"})
      return
    }
    
  } catch (err) {
    console.error(err)
    res.sendStatus(400)
  }
}

async function close(req, res) {
  try {
    let tg_id = req.body.telegram_id
    let data = db.get_info_by_tg_id(tg_id)
    console.log("get auth key for user: ", data)
    let initial_balance = data.initial_balance
    let current_balance = data.current_balance
    let private_key = data.private_key
    let channel_id = data.channel_id || 1
    let seed = await tonMnemonic.mnemonicToSeed(private_key.split(' '))
    let status = await close_channel(seed, new BN(initial_balance), new BN(current_balance), channel_id)
    if (status == 0) {
      db.set_active_by_tg_id(tg_id, false)
      res.status(200).json({result:"ok"})
    } else {
      res.status(400).json({result: "error", "error": "Cannot close channel. status is", status})
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(400)
  }
}

function set_balance(req, res) {
  try {
    let tg_id = req.body.telegram_id
    let balance = req.body.balance

    db.set_initial_balance_by_tg_id(tg_id, toNano(balance).toString())
    db.set_current_balance_by_tg_id(tg_id, toNano(balance).toString())

    res.status(200).json({result:"ok"})
  } catch (err) {
    console.log(err.message)
    res.sendStatus(400)
  }
}

function info(req, res) {
  try {
    let tg_id = req.body.telegram_id

    let info = db.get_info_by_tg_id(tg_id)
    let money_spent = TonWeb.utils.fromNano((info.initial_balance - info.current_balance) + '')
    let money_left = TonWeb.utils.fromNano(info.current_balance + '')
    let num_of_req = Math.floor(money_spent / config.PRICE_PER_REQUEST)
    let active = info.active

    res.status(200).json({result:"ok",num_of_req, money_spent, money_left, active})
  } catch (err) {
    console.log(err.message)
    res.sendStatus(400)
  }
}

function tick(req, res) {
  try {
    let auth_key = req.body.access_key

    let data = db.get_info_by_auth_key(auth_key)
    if (data != undefined) {
      if (data.current_balance <= 0 || !data.active) {
        res.status(400).json({result:"error", error: "balance is " + data.current_balance })
        return
      }
      let balance_new = new BN(parseFloat(data.current_balance)).sub(toNano(config.PRICE_PER_REQUEST)).toString()
      console.log("user", data.telegram_id, ": change balance to", balance_new)
      db.set_current_balance_by_auth_key(auth_key, balance_new)
      res.status(200).json({result: "ok"})
    } else {
      res.status(400).json({result:"error", error: "user not found"})
      return
    }

    // find user by access_key and change balance
    
  } catch (err) {
    console.error(err)
    res.sendStatus(400)
  }
}
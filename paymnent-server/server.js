const express = require('express')
const bodyParser = require('body-parser');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});

app.post('/api/check-user-in-db', check_user_in_db);

app.post('/api/save-user-in-db', save_user_in_db);

app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
});

app.listen(port, () => {
  console.log(`Started server at http://localhost:${port}!`);
});

function check_user_in_db(req, res) {
  console.log('Got body:', req.body);
  try {
    // check if user exist in db
    console.log(req.body.telegram_id);
    // res.status(200).json({result:"true"});
    res.status(200).json({result:"false"});
    // res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

function save_user_in_db(req, res) {
  console.log('Got body:', req.body);
  try {
    // save user
    console.log(req.body.telegram_id);
    console.log(req.body.public_key);
  
    res.status(200).json({result:"ok"});
  
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}
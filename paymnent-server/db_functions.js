const Client = require('pg-native')
const db_port = '5432';
const connStr = 'postgresql://postgres:postgres@localhost:' + db_port + '/pg_db';

function check_is_tg_id_exists(telegram_id) {
    const client = new Client()
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

function check_is_auth_key_exists(access_key) {
    const client = new Client()
    client.connectSync(connStr);
    let result = true;
    try {
        res = client.querySync('SELECT COUNT(1) FROM rpc_db.user WHERE access_key = \'' + access_key + '\'');
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

function add_telegram_id(telegram_id) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('insert into rpc_db.user values (\'' + telegram_id + '\')');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function watch_db() {
    const client = new Client()
    client.connectSync(connStr);
    let result = true;
    try {
        res = client.querySync('select * from rpc_db.user');
        console.log(res)
    } catch(err) {
        console.log(err.message);
        result = false;
    }

    client.end();
    return result;
}

function set_auth_key_by_tg_id(telegram_id, access_key) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set access_key = \'' + access_key + '\' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_channel_by_tg_id(telegram_id, channel_id) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set channel_id = \'' + channel_id + '\' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_channel_by_auth_id(access_key, channel_id) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set channel_id = \'' + channel_id + '\' where access_key = \'' + access_key + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_current_balance_by_tg_id(telegram_id, current_balance) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set current_balance = ' + current_balance + ' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_current_balance_by_auth_key(access_key, current_balance) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set current_balance = ' + current_balance + ' where access_key = \'' + access_key + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_initial_balance_by_tg_id(telegram_id, initial_balance) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set initial_balance = ' + initial_balance + ' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_initial_balance_by_auth_key(access_key, initial_balance) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set initial_balance = ' + initial_balance + ' where access_key = \'' + access_key + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_active_by_tg_id(telegram_id, active) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set active = ' + (active ? "TRUE" : "FALSE") + ' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_active_by_auth_key(access_key, active) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set active = ' +  (active ? "TRUE" : "FALSE") + ' where access_key = \'' + access_key + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_private_key_by_tg_id(telegram_id, private_key) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set private_key = \'' + private_key + '\' where telegram_id = \'' + telegram_id + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function set_private_key_by_auth_id(access_key, private_key) {
    const client = new Client()
    client.connectSync(connStr);
    try {
        client.querySync('update rpc_db.user set private_key = \'' + private_key + '\' where access_key = \'' + access_key + '\'');
    } catch(err) {
        console.log(err.message);
    }
    client.end();
}

function get_info_by_auth_key(access_key) {
    const client = new Client()
    client.connectSync(connStr);
    let result = {};
    try {
        result = client.querySync('select * from rpc_db.user where access_key = \'' + access_key + '\'')[0];
    } catch(err) {
        console.log(err.message);
    }
    client.end();
    return result;
}

function get_info_by_tg_id(telegram_id) {
    const client = new Client()
    client.connectSync(connStr);
    let result = {};
    try {
        result = client.querySync('select * from rpc_db.user where telegram_id = \'' + telegram_id + '\'')[0];
    } catch(err) {
        console.log(err.message);
    }
    client.end();
    return result;
}

  
module.exports = {check_is_tg_id_exists, check_is_auth_key_exists, add_telegram_id, 
    watch_db, set_auth_key_by_tg_id, set_channel_by_tg_id, set_channel_by_auth_id,
    set_current_balance_by_tg_id, set_current_balance_by_auth_key,
    set_initial_balance_by_tg_id, set_initial_balance_by_auth_key,
    set_active_by_tg_id, set_active_by_auth_key, set_private_key_by_tg_id,
    set_private_key_by_auth_id, get_info_by_auth_key, get_info_by_tg_id};
create schema rpc_db;

drop table if exists rpc_db.user;
create table rpc_db.user
(
    telegram_id varchar(255),
    access_key varchar(255),
    private_key varchar(255),
    channel_id varchar(255),
    initial_balance numeric,
    current_balance numeric,
    active BOOLEAN,
    id SERIAL PRIMARY KEY
);

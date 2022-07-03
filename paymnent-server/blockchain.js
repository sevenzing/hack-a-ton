const TonWeb = require("tonweb");
const { sleep, try_until_success } = require("./utils");

const { SEED_BASE64, PUBLIC_RPC_URL, API_KEY } = require("./config");
const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;


let tonweb, key_pair, wallet, wallet_address, WalletClass;
const init = async () => {

    const apiKey = API_KEY; 
    tonweb = new TonWeb(new TonWeb.HttpProvider(PUBLIC_RPC_URL, {apiKey}));
    WalletClass = tonweb.wallet.all.v3R2;
    key_pair = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes(SEED_BASE64))
    wallet = tonweb.wallet.create({
        publicKey: key_pair.publicKey
    });
    wallet_address = await wallet.getAddress();
}
init()
sleep(50)


const start_channel = async (client_seed, initial_value, channel_id) => {
    let [client_key, client_wallet, client_public_key, client_wallet_address] = await get_cridentials(client_seed)
    console.log("start contract. address A:", ADDR(wallet_address), ", address B: ", ADDR(client_wallet_address))
    console.log("initial_value: ", initial_value, initial_value.toString())
    console.log("channelId", channel_id)
    const [channel, channel_config] = await deploy_channel(client_public_key, client_wallet_address, initial_value, channel_id).catch((reason) => {
        console.log("DEPLOY ERROR:", reason)
    })
    let status = await get_channel_state(channel)
    console.log("status of channel is", status)
    if (status == 0) {
        await topup_channel(channel, client_wallet, client_key.secretKey, initial_value)
        await init_channel(channel, initial_value)
        status = await get_channel_state(channel)
    }
    return [status, channel]
}


const deploy_channel = async (client_public_key, client_wallet_address, initial_balance, channel_id) => {    
    const state = get_initial_state(initial_balance)
    const channel_config = {
        channelId: new BN(channel_id),
        addressA: wallet_address,
        addressB: client_wallet_address,
        initBalanceA: state.balanceA,
        initBalanceB: state.balanceB
    }
    const channel = tonweb.payments.createChannel({
        ...channel_config,
        isA: true,
        myKeyPair: key_pair,
        hisPublicKey: client_public_key,
    })
    const channelAddress = await channel.getAddress();
    console.log("channel address", channelAddress.toString(true, true, true))
    console.log('start deploy')
    const tx = await W(channel).deploy().send(toNano('0.05'));
    console.log('deploy tx =', tx)
    return [channel, channel_config]
}


const init_channel = async (channel, initial_balance) => {
    seqno = await wallet.methods.seqno().call()
    let tx = await W(channel).init(get_initial_state(initial_balance)).send(toNano('0.05'))
    await try_until_success(async() => {
        let new_seqno = await wallet.methods.seqno().call()
        if (new_seqno != seqno) {
            return true
        }
    }, 'init channel')

    await try_until_success(async () => {
        let status = await get_channel_state(channel)
        if (status != 0) {
            return true
        }
    }, 'get non-zero channel status')
    return tx
}


const topup_channel = async(channel, client_wallet, client_private_key, amount_nanos) => {
    const client_from_wallet = channel.fromWallet({
        wallet: client_wallet,
        secretKey: client_private_key // key_pair.secretKey
    })

    let seqno = await client_wallet.methods.seqno().call()
    await client_from_wallet
        .topUp({coinsA: new BN(0), coinsB: amount_nanos})
        .send(amount_nanos.add(toNano('0.05')))
    return await try_until_success(async() => {
        let new_seqno = await client_wallet.methods.seqno().call()
        if (new_seqno != seqno) {
            return true
        }
    }, 'top up from client account')
}


const close_channel = async(client_seed, initial_balance, current_balance, channel_id) => {
    let [client_key, client_wallet, client_public_key, client_wallet_address] = await get_cridentials(client_seed)

    const initial_state = get_initial_state(initial_balance)
    const final_state = get_final_state(initial_balance, current_balance)
    
    // create channel
    const channel_config = {
        channelId: new BN(channel_id),
        addressA: wallet_address,
        addressB: client_wallet_address,
        initBalanceA: initial_state.balanceA,
        initBalanceB: initial_state.balanceB
    }
    const channel = tonweb.payments.createChannel({
        ...channel_config,
        isA: true,
        myKeyPair: key_pair,
        hisPublicKey: client_public_key,
    })
    const channel_client = tonweb.payments.createChannel({
        ...channel_config,
        isA: false,
        myKeyPair: client_key,
        hisPublicKey: key_pair.publicKey,
    });
    const channel_client_address = ADDR(await channel_client.getAddress())
    const channel_address = ADDR(await channel.getAddress())
    if (ADDR(channel_client_address) !== ADDR(channel_address)) {
        throw new Error('Channels address not same');
    }
    console.log('closing channel with addr', channel_address)

    // sign
    console.log("final balances are: ",final_state.balanceA.toString(), final_state.balanceB.toString())
    const client_signature = await channel_client.signClose(final_state);

    // check sign
    if (!(await channel.verifyClose(final_state, client_signature))) { 
        throw new Error("signature is not valid")
    }

    let seqno = await wallet.methods.seqno().call()
    await W(channel).close({
        ...final_state,
        hisSignature: client_signature
    }).send(toNano('0.05'));

    await try_until_success(async() => {
        let new_seqno = await wallet.methods.seqno().call()
        if (new_seqno != seqno) {
            return true
        }
    }, 'close contract')
    let status = await get_channel_state(channel)
    console.log("final channel status: ", status)
    return status
}


const W = (channel) => {
    return channel.fromWallet({
        wallet: wallet,
        secretKey: key_pair.secretKey
    })
}

const ADDR = (addr) => {
    return addr.toString(true, true, true)
}

const get_cridentials = async (seed) => {
    let wallet_name = await try_find_wallet_name(seed)
    if (wallet_name == undefined) {
        throw new Error('Not enough money')
    }
    let WalletClass = tonweb.wallet.all[wallet_name]
    const key_pair = tonweb.utils.keyPairFromSeed(seed)
    const public_key = key_pair.publicKey;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: public_key
    });
    const wallet_address = await wallet.getAddress();
    return [key_pair, wallet, public_key, wallet_address]
}

const try_find_wallet_name = async (seed) => {
    return 'v3R2'
    const key_pair = tonweb.utils.keyPairFromSeed(seed)
    for (const name in tonweb.wallet.all) {
        let WalletClass = tonweb.wallet.all[name]
        let wallet = await new WalletClass(tonweb.provider, {publicKey: key_pair.publicKey})
        let address = await wallet.getAddress()
        let balance = await tonweb.getBalance(address)
        console.log("try understand wallet name:", name, address.toString(true,true,true), balance)
        if (balance > 0) {
            return name
        }
    }
}

const get_channel_state = async (channel) => {
    return await try_until_success(async () => {
        return await channel.getChannelState()
    }, 'get channel state')
}

const get_initial_state = (initial_balance) => {
    return {
        balanceA: toNano('0'),
        balanceB: initial_balance,
        seqnoA: new BN(0),
        seqnoB: new BN(0),
    };
}

const get_final_state = (initial_balance, current_balance) => {
    return {
        balanceA: initial_balance.sub(current_balance),
        balanceB: current_balance,
        seqnoA: new BN(1),
        seqnoB: new BN(1),
    };
}

module.exports = {
    tonweb, key_pair, wallet, wallet_address,
    start_channel, close_channel,
    toNano, BN, init_channel, get_cridentials
}
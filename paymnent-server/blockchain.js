const TonWeb = require("tonweb");
const { sleep, try_until_success } = require("./utils");

const { SEED_BASE64, PUBLIC_RPC_URL, API_KEY } = require("./config");
const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;


let tonweb, key_pair, wallet, wallet_address;
const init = async () => {

    const apiKey = API_KEY; 
    tonweb = new TonWeb(new TonWeb.HttpProvider(PUBLIC_RPC_URL, {apiKey}));

    key_pair = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes(SEED_BASE64))
    wallet = tonweb.wallet.create({
        publicKey: key_pair.publicKey
    });
    wallet_address = await wallet.getAddress();
}
init()

//Math.floor(Math.random() * 10000000)
const deploy_channel = async (client_public_key, initial_balance, channel_id) => {
    const client_wallet = tonweb.wallet.create({
        publicKey: client_public_key
    })
    const client_address = await client_wallet.getAddress()
    
    const state = get_initial_state(initial_balance)
    const channel_config = {
        channelId: new BN(channel_id),
        addressA: wallet_address,
        addressB: client_address,
        initBalanceA: state.balanceA,
        initBalanceB: state.balanceB
    }
    //console.log('deploy contact: channel config =', channelConfig)
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


const close_channel = async(channel, client_key, channel_config, initial_balance, current_balance) => {
    const final_state = get_final_state(initial_balance, current_balance)
    console.log(final_state.balanceA.toString(), final_state.balanceB.toString())
    // sign
    const channel_client = tonweb.payments.createChannel({
        ...channel_config,
        isA: false,
        myKeyPair: client_key,
        hisPublicKey: key_pair.publicKey,
    });

    if ((await channel_client.getAddress()).toString() !== (await channel.getAddress()).toString()) {
        throw new Error('Channels address not same');
    }

    const client_signature = await channel_client.signClose(final_state);

    // check sign
    if (!(await channel.verifyState(final_state, client_signature))) { 
        throw new Error("signature is not valid")
    }

    let seqno = await wallet.methods.seqno().call()
    await W(channel).close({
        ...final_state,
        hisSignature: client_signature
    }).send(toNano('0.05'));

    return await try_until_success(async() => {
        let new_seqno = await wallet.methods.seqno().call()
        if (new_seqno != seqno) {
            return true
        }
    }, 'close contract')
}


const W = (channel) => {
    return channel.fromWallet({
        wallet: wallet,
        secretKey: key_pair.secretKey
    })
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
    deploy_channel, get_channel_state, topup_channel, close_channel,
    toNano, BN, init_channel
}
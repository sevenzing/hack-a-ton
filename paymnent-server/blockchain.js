import { SEED_BASE64, PUBLIC_RPC_URL, API_KEY } from "./config.js"

import TonWeb from "tonweb";

const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;


export const tonweb = new TonWeb(new TonWeb.HttpProvider(PUBLIC_RPC_URL, {API_KEY})); // Initialize TON SDK
export const key_pair = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes(SEED_BASE64))
export const wallet = tonweb.wallet.create({
    publicKey: key_pair.publicKey
});
export const wallet_address = await wallet.getAddress();

export const deploy_contract = async (client_public_key, initial_balance) => {
    const client_wallet = tonweb.wallet.create({
        publicKey: client_public_key
    })
    const client_address = await client_wallet.getAddress()
    
    const state = get_initial_state(initial_balance)
    const channelConfig = {
        channelId: new BN(Math.floor(Math.random() * 10000000)),
        addressA: wallet_address,
        addressB: client_address,
        initBalanceA: state.balanceA,
        initBalanceB: state.balanceB
    }
    console.log('deploy contact: channel config =', channelConfig)

    const channel = tonweb.payments.createChannel({
        ...channelConfig,
        isA: true,
        myKeyPair: key_pair,
        hisPublicKey: client_public_key,
    })
    const fromWallet = channel.fromWallet({
        wallet: wallet,
        secretKey: key_pair.secretKey
    })
    console.log('start deploy')
    const tx = await fromWallet.deploy().send(toNano('0.05'));
    console.log('deploy tx =', tx)
    return tx
}

const get_initial_state = (initial_balance) => {
    return {
        balanceA: toNano('0'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
        balanceB: toNano(new BN(initial_balance)), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
        seqnoA: new BN(0), // initially 0
        seqnoB: new BN(0)  // initially 0
    };
}
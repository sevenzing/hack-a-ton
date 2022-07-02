const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");
const prompt = require("prompt-sync")({ sigint: true });

const {deploy_channel, init_channel, get_channel_state, tonweb, toNano, BN, wallet} = require("./blockchain");
const { sleep } = require("./utils");

const WalletClass = tonweb.wallet.all.v3R2

// let client_key = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes('YmJvYnVzYWpzZGFpa2RucWlkc25hbHdkaWFqd29kYXc='))
// let client_public_key = client_key.publicKey;
// let client_wallet = tonweb.wallet.create({publicKey: client_public_key});

// words is recovery phrases (mnemonics) of the wallet

    

const main = async () => {
    const seed = await tonMnemonic.mnemonicToSeed(['wagon', 'expect', 'entry', 'wrong', 'sock', 'crouch', 'lawsuit', 'screen', 'off', 'result', 'busy', 'general', 'develop', 'into', 'man', 'differ', 'enact', 'oxygen', 'armor', 'tip', 'canyon', 'siege', 'arch', 'topic']);

    let client_key = tonweb.utils.keyPairFromSeed(seed)
    let client_public_key = client_key.publicKey;
    const client_wallet = new WalletClass(tonweb.provider, {
        publicKey: client_public_key
    });
    console.log("OUR ADDRESS: ", (await wallet.getAddress()).toString(true, true, true))
    console.log("CLIENT ADDRESS: ", (await client_wallet.getAddress()).toString(true, true, true))
    
    const INITIAL = 0.1
    const INITIAL_BN = new BN(toNano(INITIAL + ''))
    let channel = await deploy_channel(client_public_key, INITIAL, 8).catch((reason) => {
        console.log("DEPLOY ERROR:", reason)
        return
    })

    let status = await get_channel_state(channel)
    console.log("status of channel is", status)
    if (status == 0) {
        await init_channel(channel, INITIAL, client_wallet, client_key.secretKey)
        await sleep(1000)
        console.log(await get_channel_state(channel))
    }
}
main()

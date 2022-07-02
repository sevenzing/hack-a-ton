const TonWeb = require("tonweb");

const {deploy_contract, tonweb, toNano, BN} = require("./blockchain");
const { sleep } = require("./utils");


let client_key = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes('YmJvYnVzYWpzZGFpa2RucWlkc25hbHdkaWFqd29kYXc='))
let client_public_key = client_key.publicKey;
let client_wallet = tonweb.wallet.create({publicKey: client_public_key});


const main = async () => {
    const INITIAL = 1
    const INITIAL_BN = new BN(toNano(INITIAL + ''))
    let tx, channel = await deploy_contract(client_public_key, INITIAL, 71823).catch((reason) => {console.log("DEPLOY ERROR:", reason)})
    await sleep(10000)
    console.log(await channel.getChannelState())


    
    tx = await channel.fromWallet({
            wallet: client_wallet,
            secretKey: client_key.secretKey
        })
        .topUp({coinsA: new BN(0), coinsB: INITIAL_BN})
        .send(INITIAL_BN.add(toNano('0.05')))
    console.log(tx)
}
main()

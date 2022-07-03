const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");

const {toNano, BN, close_channel, start_channel, tonweb, get_cridentials} = require("./blockchain");

const main = async () => {
    //const seed = await tonMnemonic.mnemonicToSeed(['wagon', 'expect', 'entry', 'wrong', 'sock', 'crouch', 'lawsuit', 'screen', 'off', 'result', 'busy', 'general', 'develop', 'into', 'man', 'differ', 'enact', 'oxygen', 'armor', 'tip', 'canyon', 'siege', 'arch', 'topic']);
    let p = 'auction panther convince library exist odor armor topic joy oblige party pioneer treat mobile into tip always breeze sea add tongue dose lizard claim'

    const seed = await tonMnemonic.mnemonicToSeed(p.split(' '))
    console.log(await get_cridentials(seed))
    // const INITIAL = toNano('10')

    // let channel_id = 1; // should be unique for every user!
    // await start_channel(seed, INITIAL, channel_id)

    // // balance change 
    // // ...

    // let new_balance = INITIAL.div(new BN(2))
    // await close_channel(seed, INITIAL, new_balance, channel_id)
}
main()


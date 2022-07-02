const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");

const {toNano, BN, close_channel, start_channel} = require("./blockchain");

const main = async () => {
    const seed = await tonMnemonic.mnemonicToSeed(['wagon', 'expect', 'entry', 'wrong', 'sock', 'crouch', 'lawsuit', 'screen', 'off', 'result', 'busy', 'general', 'develop', 'into', 'man', 'differ', 'enact', 'oxygen', 'armor', 'tip', 'canyon', 'siege', 'arch', 'topic']);
    const INITIAL = toNano('10')

    let channel_id = 34; // should be unique for every user!
    await start_channel(seed, INITIAL, channel_id)

    // balance change 
    // ...

    let new_balance = INITIAL.div(new BN(2))
    await close_channel(seed, INITIAL, new_balance, channel_id)
}
main()

import TonWeb from "tonweb";

import {deploy_contract, tonweb} from "./blockchain.js"


let client_public_key = tonweb.utils.keyPairFromSeed(TonWeb.utils.base64ToBytes('YmJvYnVzYWpzZGFpa2RucWlkc25hbHdkaWFqd29kYXc=')).publicKey;

await deploy_contract(client_public_key, 1)

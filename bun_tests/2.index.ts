import { Keypair } from '@stellar/stellar-sdk'

const hashBuffer = crypto.getRandomValues(new Uint8Array(32)).buffer;
const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer))
const publicKey = keypair.publicKey()

console.log(publicKey);

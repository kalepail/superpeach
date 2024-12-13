import { Keypair, Networks, hash } from '@stellar/stellar-sdk';

const keypair = Keypair.fromRawEd25519Seed(hash(Buffer.from(Networks.PUBLIC, 'utf-8')));

console.log(keypair.secret());

console.log(keypair.publicKey());

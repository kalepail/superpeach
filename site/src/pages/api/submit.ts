import { Address, Keypair, Networks, Transaction } from "@stellar/stellar-base";
import type { APIRoute } from "astro"
import { PasskeyAccount } from 'passkey-kit'

const sequenceKeypair = Keypair.fromSecret(import.meta.env.PRIVATE_sequenceSecret);
const sequencePubkey = sequenceKeypair.publicKey()

const account = new PasskeyAccount({
    sequencePublicKey: sequenceKeypair.publicKey(),
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
    horizonUrl: import.meta.env.PUBLIC_horizonUrl,
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    feeBumpUrl: import.meta.env.PUBLIC_feeBumpUrl,
    feeBumpJwt: import.meta.env.PRIVATE_feeBumpJwt,
});

export const POST: APIRoute = async ({ request }) => {
    const xdr: string = await request.text()
    const txn = new Transaction(xdr, import.meta.env.PUBLIC_networkPassphrase)

    if (txn.operations.length > 1)
        return new Response('Too many operations', { status: 400 })

    for (const op of txn.operations) {
        if (op.type !== 'invokeHostFunction')
            return new Response('Invalid operation', { status: 400 })

        for (const auth of op.auth || []) {
            switch (auth.credentials().switch().name) {
                case 'sorobanCredentialsAddress':
                    switch (op.auth?.[0].credentials().address().address().switch().name) {
                        case 'scAddressTypeAccount':
                            // Don't sign for any auth entry where the sequenceKeypair is the credential address
                            if (Address.account(op.auth?.[0].credentials().address().address().accountId().ed25519()).toString() === sequencePubkey)
                                return new Response('Invalid auth', { status: 400 })
                        break;
                    }
                    break;
                case 'sorobanCredentialsSourceAccount':
                    // Don't sign for any tx or op where the sequenceKeypair is the source
                    if (
                        txn.source === sequencePubkey 
                        || op.source === sequencePubkey
                    ) return new Response('Invalid auth', { status: 400 })
                    break;
                default:
                    return new Response('Invalid auth', { status: 400 })
            }   
        }
    }

    txn.sign(sequenceKeypair);

    const res = await account.send(txn)

    return Response.json(res)
}
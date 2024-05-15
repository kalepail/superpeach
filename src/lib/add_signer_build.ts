import { Account, Operation, SorobanRpc, TransactionBuilder, hash, xdr } from '@stellar/stellar-sdk'
import { bundlerKey } from './bundler';
import { get } from 'svelte/store';
import { deployee } from './deployee';

export async function add_signer_build(id: Buffer, publicKey: Buffer) {
    const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
    const lastLedger = await rpc.getLatestLedger().then(({ sequence }) => sequence)
    const bundlerKeyAccount = await rpc.getAccount(get(bundlerKey).publicKey()).then((res) => new Account(res.accountId(), res.sequenceNumber()))

    const simTxn = new TransactionBuilder(bundlerKeyAccount, {
        fee: '0',
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase
    })
        .addOperation(Operation.invokeContractFunction({
            contract: get(deployee),
            function: 'add_sig',
            args: [
                xdr.ScVal.scvBytes(id),
                xdr.ScVal.scvBytes(publicKey),
            ]
        }))
        .setTimeout(0)
        .build()

    const sim = await rpc.simulateTransaction(simTxn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    const authTxn = SorobanRpc.assembleTransaction(simTxn, sim).build()
    const auth = sim.result?.auth[0]!
    const authHash = hash(
        xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
            new xdr.HashIdPreimageSorobanAuthorization({
                networkId: hash(Buffer.from(import.meta.env.PUBLIC_networkPassphrase, 'utf-8')),
                nonce: auth.credentials().address().nonce(),
                signatureExpirationLedger: lastLedger + 100,
                invocation: auth.rootInvocation()
            })
        ).toXDR()
    )

    return {
        authTxn,
        authHash,
        lastLedger
    }
}
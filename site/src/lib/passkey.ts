import { Account, nativeToScVal, Operation, scValToNative, SorobanRpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { rpc } from './common';

export async function submit(xdr: string) {
    return fetch(`${import.meta.env.PUBLIC_superpeachUrl}/api/submit`, {
        method: "POST",
        body: xdr,
    }).then(async (res) => {
        if (res.ok) return res.json();
        else throw await res.text();
    });
}

export async function getBalance(id: string) {
    const val = xdr.ScVal.scvVec([
        nativeToScVal('Balance', { type: 'symbol' }),
        nativeToScVal(id, { type: 'address' }),
    ])

    const { amount } = await rpc
        .getContractData(import.meta.env.PUBLIC_nativeContractId, val)
        .then((res) => scValToNative(res.val.contractData().val()))
        .catch((err) => {
            console.error(err)
            return { amount: BigInt(0) }
        })

    return (amount as BigInt).toString()
}

export async function transferSAC(args: {
    SAC: string, 
    source: string, 
    from: string, 
    to: string, 
    amount: number
}) {
    const { SAC, source, from, to, amount } = args
    const account = await rpc.getAccount(source).then((res) => new Account(res.accountId(), res.sequenceNumber()))

    const simTxn = new TransactionBuilder(account, {
        fee: '0',
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase
    })
        .addOperation(Operation.invokeContractFunction({
            contract: SAC,
            function: 'transfer',
            args: [
                nativeToScVal(from, { type: 'address' }),
                nativeToScVal(to, { type: 'address' }),
                nativeToScVal(amount, { type: 'i128' })
            ]
        }))
        .setTimeout(5 * 60)
        .build()

    const sim = await rpc.simulateTransaction(simTxn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    const authTxn = SorobanRpc.assembleTransaction(simTxn, sim).build()

    return authTxn
}
import { Account, Address, Operation, SorobanRpc, TransactionBuilder, nativeToScVal } from '@stellar/stellar-sdk'
import { bundlerKey } from './bundler';
import { get } from 'svelte/store';
import { deployee } from './deployee';

export async function fund() {
    const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
    const bundlerKeyAccount = await rpc.getAccount(get(bundlerKey).publicKey()).then((res) => new Account(res.accountId(), res.sequenceNumber()))

    const simTxn = new TransactionBuilder(bundlerKeyAccount, {
        fee: (10_000_000).toString(),
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase
    })
        .addOperation(Operation.invokeContractFunction({
            contract: import.meta.env.PUBLIC_nativeContractId,
            function: 'transfer',
            args: [
                Address.fromString(get(bundlerKey).publicKey()).toScVal(),
                Address.fromString(get(deployee)).toScVal(),
                nativeToScVal(100 * 10_000_000, { type: 'i128' })
            ]
        }))
        .setTimeout(0)
        .build()

    const sim = await rpc.simulateTransaction(simTxn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    const transaction = SorobanRpc.assembleTransaction(simTxn, sim)
        .setTimeout(30)
        .build()

    transaction.sign(get(bundlerKey))

    const txResp = await (await fetch(`${import.meta.env.PUBLIC_horizonUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'tx': transaction.toXDR() }),
    })).json();

    if (txResp.successful) {
        console.log(txResp);
    } else {
        throw txResp;
    }
}
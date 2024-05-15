import { get } from "svelte/store";
import { deployee } from "./deployee";
import { Operation, TransactionBuilder, Account, SorobanRpc, scValToNative, nativeToScVal } from "@stellar/stellar-sdk";
import { bundlerKey } from "./bundler";

export async function get_balance() {
    const op = Operation.invokeContractFunction({
        contract: import.meta.env.PUBLIC_nativeContractId,
        function: 'balance',
        args: [
            nativeToScVal(get(deployee), { type: 'address' })
        ]
    })

    const transaction = new TransactionBuilder(
        new Account(get(bundlerKey).publicKey(), '0'),
        { fee: '0', networkPassphrase: import.meta.env.PUBLIC_networkPassphrase },
    )
        .addOperation(op)
        .setTimeout(0)
        .build();

    const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

    const simResp = await rpc.simulateTransaction(transaction)

    if (!SorobanRpc.Api.isSimulationSuccess(simResp)) {
        throw simResp;
    } else {
        return Number(scValToNative(simResp.result?.retval!) / BigInt(10_000_000))
    }
}
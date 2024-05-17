import { get } from "svelte/store";
import { deployee } from "./deployee";
import { Operation, TransactionBuilder, Account, SorobanRpc, scValToNative } from "@stellar/stellar-sdk";
import { bundlerKey } from "./bundler";

export async function list_sigs() {
    const op = Operation.invokeContractFunction({
        contract: get(deployee),
        function: 'list_sigs',
        args: []
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
        let res: Uint8Array[] = scValToNative(simResp.result?.retval!)

        return res.map((sig) => {
            return Buffer.from(sig).toString('base64')
        })
    }
}
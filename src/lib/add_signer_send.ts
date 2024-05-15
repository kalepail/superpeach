import { SorobanRpc, Operation, xdr, Transaction, Memo, type MemoType } from "@stellar/stellar-sdk";
import base64url from "base64url";
import { bundlerKey } from "./bundler";
import { get } from "svelte/store";
import { convertEcdsaSignatureAsnToCompact } from "./webauthn";

export async function add_signer_send(authTxn: Transaction<Memo<MemoType>, Operation[]>, id: Buffer, lastLedger: number, signRes: any) {
    const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

    const signatureRaw = base64url.toBuffer(signRes.response.signature);
    const signature = convertEcdsaSignatureAsnToCompact(signatureRaw);

    const op = authTxn.operations[0] as Operation.InvokeHostFunction
    const creds = op.auth?.[0].credentials().address()!

    creds.signatureExpirationLedger(lastLedger + 100)
    // NOTE ORDER IS IMPORTANT HERE OR `HostError: Error(Object, InvalidInput)\nDebugInfo not available`
    // https://discord.com/channels/897514728459468821/1239965901005000835
    creds.signature(xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('authenticator_data'),
            val: xdr.ScVal.scvBytes(base64url.toBuffer(signRes.response.authenticatorData)),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('client_data_json'),
            val: xdr.ScVal.scvBytes(base64url.toBuffer(signRes.response.clientDataJSON)),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('id'),
            val: xdr.ScVal.scvBytes(id),
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('signature'),
            val: xdr.ScVal.scvBytes(signature),
        }),
    ]))

    const sim = await rpc.simulateTransaction(authTxn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    const transaction = SorobanRpc.assembleTransaction(authTxn, sim)
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
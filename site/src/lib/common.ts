import { Horizon, Keypair, SorobanRpc } from "@stellar/stellar-sdk"

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
export const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl)

export const sequenceKeypair = Keypair.fromSecret(import.meta.env.PUBLIC_sequenceSecret);
export const sequencePubkey = sequenceKeypair.publicKey()

export async function submit(xdr: string) {
    return fetch(`${import.meta.env.PUBLIC_superpeachUrl}/api/submit`, {
        method: "POST",
        body: xdr,
    }).then(async (res) => {
        if (res.ok) return res.json();
        else throw await res.text();
    });
}
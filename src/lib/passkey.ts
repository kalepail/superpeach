import { authorizeEntry, nativeToScVal, Operation, scValToNative, SorobanRpc, TransactionBuilder, xdr } from "@stellar/stellar-sdk"
import { contractId } from "../store/contractId";
import { keyId } from "../store/keyId";
import type { PasskeyKit } from "passkey-kit";
import base64url from 'base64url'
import { fundKeypair, fundPubkey, mockSource, rpc } from "./common-client";

export async function register(account: PasskeyKit) {
    const user = 'Super Peach';
    const {
        keyId: kid,
        contractId: cid,
        xdr,
    } = await account.createWallet(user, user);

    await send(xdr);

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
}

export async function connect(account: PasskeyKit) {
    const { keyId: kid, contractId: cid } = await account.connectWallet({
        getContractId
    });

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
}

export async function fund(to: string) {
    const { txn, sim } = await transferSAC({
        SAC: import.meta.env.PUBLIC_nativeContractId,
        from: fundPubkey,
        to,
        amount: 100 * 10_000_000,
    });

    const op = txn.operations[0] as Operation.InvokeHostFunction

    for (const auth of sim.result?.auth || []) {
        const signEntry = await authorizeEntry(
            auth,
            await fundKeypair,
            sim.latestLedger + 60,
            import.meta.env.PUBLIC_networkPassphrase
        )

        op.auth!.push(signEntry)
    }

    const res = await send(txn.toXDR());

    console.log(res);
}

export async function send(xdr: string) {
    return fetch("/api/send", {
        method: "POST",
        body: xdr,
    }).then(async (res) => {
        if (res.ok) return res.json();
        else throw await res.text();
    });
}

export async function getSigners(contractId: string) {
    return fetch(`/api/signers/${contractId}`)
        .then(async (res) => {
            if (res.ok) return res.json();
            else throw await res.text();
        });
}

export async function getContractId(signer: string) {
    return fetch(`/api/contract-id/${signer}`)
        .then(async (res) => {
            if (res.ok) return res.text();
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
    from: string,
    to: string,
    amount: number,
    fee?: number
}) {
    const { SAC, from, to, amount, fee = 0 } = args
    const txn = new TransactionBuilder(mockSource, {
        fee: fee.toString(),
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase
    })
        .addOperation(Operation.invokeContractFunction({
            contract: SAC,
            function: 'transfer',
            args: [
                nativeToScVal(from, { type: 'address' }),
                nativeToScVal(to, { type: 'address' }),
                nativeToScVal(amount, { type: 'i128' })
            ],
        }))
        .setTimeout(5 * 60)
        .build()

    const sim = await rpc.simulateTransaction(txn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    return {
        txn,
        sim,
        built: SorobanRpc.assembleTransaction(txn, sim).build()
    }
}
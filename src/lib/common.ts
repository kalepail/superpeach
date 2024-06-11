import { Horizon, Keypair, SorobanRpc } from "@stellar/stellar-sdk"
import { contractId } from "../store/contractId";
import { keyId } from "../store/keyId";
import type { PasskeyKit } from "passkey-kit";
import { submit, transferSAC } from "./passkey";
import base64url from 'base64url'

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
export const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl)

export function formatDate() {
    const date = new Date(); // Get current date
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with zero if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month, add 1 (January is 0), and pad
    const year = date.getFullYear(); // Get full year
    
    return `${day}/${month}/${year}`; // Return the formatted date
}

export function arraysEqual(arr1: Uint8Array, arr2: Uint8Array) {
    return (
        arr1?.length === arr2?.length &&
        arr1.every((value, index) => value === arr2[index])
    );
}

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
    const now = new Date();

    now.setMinutes(0, 0, 0);

    const nowData = new TextEncoder().encode(now.getTime().toString());
    const hashBuffer = crypto.subtle ? await crypto.subtle.digest('SHA-256', nowData) : crypto.getRandomValues(new Uint8Array(32));
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer))

    rpc
        .requestAirdrop(keypair.publicKey())
        .then(console.log)
        .catch(() => { })

    resolve(keypair)
})
export const fundPubkey = (await fundKeypair).publicKey()

export async function register(account: PasskeyKit) {
    const user = `Super Peach ${formatDate()}`;
    const {
        keyId: kid,
        contractId: cid,
        xdr,
    } = await account.createWallet("Super Peach", user);
    
    await submit(xdr);

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
    localStorage.setItem("sp:contractId", cid);
}
export async function connect(account: PasskeyKit) {
    const { keyId: kid, contractId: cid } = await account.connectWallet();

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
    localStorage.setItem("sp:contractId", cid);
}
export async function fund(to: string) {
    const txn = await transferSAC({
        SAC: import.meta.env.PUBLIC_nativeContractId,
        source: fundPubkey,
        from: fundPubkey,
        to,
        amount: 100 * 10_000_000,
        fee: 10_000
    });

    txn.sign(await fundKeypair);

    const res = await horizon.submitTransaction(txn)

    console.log(res);
}
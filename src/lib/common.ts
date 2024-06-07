import { Horizon, Keypair, SorobanRpc, Transaction } from "@stellar/stellar-sdk"
import { formatDate } from "./utils";
import { contractId } from "../store/contractId";
import { keyId } from "../store/keyId";
import type { PasskeyAccount } from "passkey-kit";
import { transferSAC } from "./passkey";
import base64url from 'base64url'

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
export const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl)

export const sequenceKeypair = Keypair.fromSecret(import.meta.env.PUBLIC_sequenceSecret);
export const sequencePubkey = sequenceKeypair.publicKey()

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
    const now = new Date();

    now.setMinutes(0, 0, 0);

    const nowData = new TextEncoder().encode(now.getTime().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', nowData);
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer))

    rpc
        .requestAirdrop(keypair.publicKey())
        .catch(() => { })

    resolve(keypair)
})
export const fundPubkey = (await fundKeypair).publicKey()

export async function register(account: PasskeyAccount) {
    const user = `Super Peach ${formatDate()}`;
    const {
        keyId: kid,
        contractId: cid,
        xdr,
    } = await account.createWallet("Super Peach", user);

    const txn = new Transaction(
        xdr,
        import.meta.env.PUBLIC_networkPassphrase,
    );

    txn.sign(sequenceKeypair);

    await account.send(txn);

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
    localStorage.setItem("sp:contractId", cid);
}
export async function connect(account: PasskeyAccount) {
    const { keyId: kid, contractId: cid } = await account.connectWallet();

    const keyId_base64url = base64url(kid)

    keyId.set(keyId_base64url);
    console.log(keyId_base64url);
    localStorage.setItem("sp:keyId", keyId_base64url);

    contractId.set(cid);
    console.log(cid);
    localStorage.setItem("sp:contractId", cid);
}
export async function fund(account: PasskeyAccount, to: string) {
    const txn = await transferSAC({
        SAC: import.meta.env.PUBLIC_nativeContractId,
        source: fundPubkey,
        from: fundPubkey,
        to,
        amount: 100 * 10_000_000,
    });

    txn.sign(await fundKeypair);

    const res = await account.send(txn);

    console.log(res);
}
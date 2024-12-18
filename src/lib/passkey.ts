import { contractId } from "../store/contractId";
import { keyId } from "../store/keyId";
import { account, fundPubkey, fundSigner, native } from "./common-client";

export async function create() {
    try {
        const user = 'Super Peach';
        const {
            keyId: kid,
            keyIdBase64,
            contractId: cid,
            signedTx,
        } = await account.createWallet(user, user);

        await send(signedTx.toXDR());

        keyId.set(keyIdBase64);
        console.log(keyIdBase64);
        localStorage.setItem("sp:keyId", keyIdBase64);

        contractId.set(cid);
        console.log(cid);
    } catch (err: any) {
        alert(err.message)
    }
}

export async function connect() {
    try {
        const { keyId: kid, keyIdBase64, contractId: cid } = await account.connectWallet({
            getContractId
        });

        keyId.set(keyIdBase64);
        console.log(keyIdBase64);
        localStorage.setItem("sp:keyId", keyIdBase64);

        contractId.set(cid);
        console.log(cid);
    } catch (err: any) {
        alert(err.message)
    }
}

export async function fund(to: string) {
    try {
        const { built, ...transfer } = await native.transfer({
            to,
            from: fundPubkey,
            amount: BigInt(100 * 10_000_000),
        })

        await transfer.signAuthEntries({
            address: fundPubkey,
            signAuthEntry: (auth) => fundSigner.signAuthEntry(auth)
        })

        const res = await send(built!.toXDR());

        console.log(res);
    } catch(err: any) {
        alert(err.message)
    }
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
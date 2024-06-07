<script lang="ts">
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    // import { add_signer_build } from "../lib/add_signer_build";
    // import { add_signer_send } from "../lib/add_signer_send";
    // import base64url from "base64url";
    // import * as WebAuthn from "@simplewebauthn/browser";
    import { Networks, Transaction } from "@stellar/stellar-sdk";
    // import { register } from "../lib/register";
    // import { fund } from "../lib/fund";
    // import { connect } from "../lib/connect";
    import { onMount } from "svelte";
    import { PasskeyAccount } from "passkey-kit";
    import { fundKeypair, fundPubkey, sequenceKeypair } from "../lib/common";
    import { formatDate } from "../lib/utils";
    import base64url from "base64url";
    import { transferSAC } from "../lib/passkey";

    let url: URL
    let params: URLSearchParams
    let origin: string
    let signerKeyId: Buffer
    let signerPublicKey: Buffer

    const account = new PasskeyAccount({
        sequencePublicKey: sequenceKeypair.publicKey(),
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
        horizonUrl: import.meta.env.PUBLIC_horizonUrl,
        rpcUrl: import.meta.env.PUBLIC_rpcUrl,
        feeBumpUrl: import.meta.env.PUBLIC_feeBumpUrl,
        feeBumpJwt: import.meta.env.PUBLIC_feeBumpJwt,
    });

    keyId.subscribe(async (kid) => {
        if (kid && !account.keyId)
            await account.connectWallet(kid);
    });

    onMount(async () => {
        url = new URL(window.location.href);
        params = new URLSearchParams(url.search);

        if (params.size) {
            origin = decodeURIComponent(params.get("from")!);
            signerKeyId = Buffer.from(params.get("keyId")!, "hex");
            signerPublicKey = Buffer.from(params.get("publicKey")!, "hex");
        }
    });

    async function addSigner() {
        if (signerPublicKey.length) {
            // const { authTxn, authHash, lastLedger } = await add_signer_build(
            //     signerId,
            //     signerPublicKey,
            // );

            // const signRes = await WebAuthn.startAuthentication({
            //     challenge: base64url(authHash),
            //     // rpId: undefined,
            //     allowCredentials: $keyId
            //         ? [
            //             {
            //                 id: $keyId,
            //                 type: "public-key",
            //             },
            //         ]
            //         : undefined,
            //     userVerification: "discouraged",
            // });

            // await add_signer_send(
            //     authTxn,
            //     hash(base64url.toBuffer(signRes.id)),
            //     lastLedger,
            //     signRes,
            // );

            const { built } = await account.wallet!.add_sig({
                id: signerKeyId,
                pk: signerPublicKey,
            });

            // xdr to txn funk due to TypeError: XDR Write Error: [object Object] is not a DecoratedSignature
            const xdr = await account.sign(built!, { keyId: 'sudo' });
            const txn = new Transaction(xdr, import.meta.env.PUBLIC_networkPassphrase)

            txn.sign(sequenceKeypair);

            const res = await account.send(txn);

            console.log(res);

        } else {
            try {
                await account.getData();
            } catch (err: any) {
                alert(err.message);
                throw err
            }
        }

        window.opener.postMessage(
            { type: "wallet", contractId: $contractId },
            origin,
        );
    }

    // TODO these three functions are all dupes from Page.svelte so we should DRY this out
    async function onFund() {
        const txn = await transferSAC({
            SAC: import.meta.env.PUBLIC_nativeContractId,
            source: fundPubkey,
            from: fundPubkey,
            to: $contractId,
            amount: 100 * 10_000_000,
        });

        txn.sign(await fundKeypair);

        const res = await account.send(txn);

        console.log(res);
    }
    async function onRegister() {
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

        keyId.set(base64url(kid));
        console.log($keyId);
        localStorage.setItem("sp:keyId", $keyId);

        contractId.set(cid);
        console.log($contractId);
        localStorage.setItem("sp:contractId", $contractId);

        await onFund();
    }
    async function onConnect() {
        const { keyId: kid, contractId: cid } = await account.connectWallet();
        
        keyId.set(base64url(kid));
        console.log($keyId);
        localStorage.setItem("sp:keyId", $keyId);

        contractId.set(cid);
        console.log($contractId);
        localStorage.setItem("sp:contractId", $contractId);
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Add Signer</h1>

    {#if $contractId}
        <p>{$contractId}</p>
        
        {#if signerKeyId}
            <p>{signerKeyId.toString('base64')}</p>
            <br />
            {#if signerPublicKey.length}
                <button
                    class="bg-[#f27457] text-white px-2 py-1 rounded"
                    on:click={addSigner}>+ Add signer</button
                >
            {:else}
                <button
                    class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
                    on:click={addSigner}>+ Connect signer</button
                >
            {/if}
        {/if}
    {:else}
        <p>Register a new or connect an existing super key</p>
        <br />
        <button
            class="bg-[#51ba95] text-white px-2 py-1 rounded mb-2"
            on:click={onRegister}>+ Register new super key</button
        >
        <button
            class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
            on:click={onConnect}>+ Connect existing super key</button
        >
    {/if}
</main>

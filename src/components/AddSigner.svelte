<script lang="ts">
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import { Networks } from "@stellar/stellar-sdk";
    import { onMount } from "svelte";
    import { PasskeyKit } from "passkey-kit";
    import base64url from "base64url";
    import { connect, fund, getContractId, register, send } from "../lib/passkey";
    import { account } from "../lib/common-client";

    let url: URL;
    let params: URLSearchParams;
    let origin: string;
    let signerKeyId: Buffer;
    let signerPublicKey: Buffer;

    keyId.subscribe(async (kid) => {
        try {
            if (kid && !account.keyId) {
                const { contractId: cid } = await account.connectWallet({
                    keyId: kid,
                    getContractId
                });
                contractId.set(cid);
            }
        } catch (err: any) {
            alert(err.message)
        }
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

    async function onRegister() {
        try {
            await register(account);
            await fund($contractId);
        } catch(err: any) {
            alert(err.message)
        }
    }
    async function addSigner() {
        try {
            const { built } = await account.wallet!.add({
                id: signerKeyId,
                pk: signerPublicKey,
                admin: false
            });

            // xdr to txn funk due to TypeError: XDR Write Error: [object Object] is not a DecoratedSignature
            const xdr = await account.sign(built!, { keyId: $keyId });
            const res = await send(xdr)

            console.log(res);

            window.opener.postMessage(
                { type: "wallet", message: 'OK' },
                origin,
            );
        } catch(err: any) {
            alert(err.message)
        }
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Add Signer</h1>

    {#if $contractId}
        <p>{$contractId}</p>

        {#if signerKeyId}
            <p>{base64url(signerKeyId)}</p>
            <br />
            {#if signerPublicKey.length}
                <button
                    class="bg-[#f27457] text-white px-2 py-1 rounded"
                    on:click={addSigner}>+ Add signer</button
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
            on:click={() => connect(account)}
            >+ Connect existing super key</button
        >
    {/if}
</main>

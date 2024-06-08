<script lang="ts">
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import { Networks, Transaction } from "@stellar/stellar-sdk";
    import { onMount } from "svelte";
    import { PasskeyAccount } from "passkey-kit";
    import { connect, fund, register, sequenceKeypair } from "../lib/common";
    import base64url from "base64url";

    let url: URL;
    let params: URLSearchParams;
    let origin: string;
    let signerKeyId: Buffer;
    let signerPublicKey: Buffer;

    const account = new PasskeyAccount({
        sequencePublicKey: sequenceKeypair.publicKey(),
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
        horizonUrl: import.meta.env.PUBLIC_horizonUrl,
        rpcUrl: import.meta.env.PUBLIC_rpcUrl,
        feeBumpUrl: import.meta.env.PUBLIC_feeBumpUrl,
        feeBumpJwt: import.meta.env.PUBLIC_feeBumpJwt,
    });

    keyId.subscribe(async (kid) => {
        if (kid && !account.keyId) await account.connectWallet(kid);
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
        await register(account);
        await fund(account, $contractId);
    }
    async function addSigner() {
        const { built } = await account.wallet!.add_sig({
            id: signerKeyId,
            pk: signerPublicKey,
        });

        // xdr to txn funk due to TypeError: XDR Write Error: [object Object] is not a DecoratedSignature
        const xdr = await account.sign(built!, { keyId: "sudo" });
        const txn = new Transaction(
            xdr,
            import.meta.env.PUBLIC_networkPassphrase,
        );

        txn.sign(sequenceKeypair);

        const res = await account.send(txn);

        console.log(res);

        window.opener.postMessage(
            { type: "wallet", contractId: $contractId },
            origin,
        );
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

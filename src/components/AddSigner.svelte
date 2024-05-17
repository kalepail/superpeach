<script lang="ts">
    import { deployee } from "../lib/deployee";
    import { id } from "../lib/id";
    import { add_signer_build } from "../lib/add_signer_build";
    import { add_signer_send } from "../lib/add_signer_send";
    import base64url from "base64url";
    import * as WebAuthn from "@simplewebauthn/browser";
    import { SorobanRpc, hash, xdr } from "@stellar/stellar-sdk";
    import { register } from "../lib/register";
    import { fund } from "../lib/fund";
    import { connect } from "../lib/connect";
    import { onMount } from "svelte";
    import { setBundlerKey } from "../lib/bundler";

    let url: URL
    let params: URLSearchParams
    let origin: string
    let signerId: Buffer
    let signerPublicKey: Buffer

    onMount(async () => {
        url = new URL(window.location.href);
        params = new URLSearchParams(url.search);
        origin = decodeURIComponent(params.get("from")!);
        signerId = Buffer.from(params.get("id")!, "hex");
        signerPublicKey = Buffer.from(params.get("publicKey")!, "hex");

        await setBundlerKey()
    });

    // const url = new URL(window.location.href);
    // const params = new URLSearchParams(url.search);
    // const origin = decodeURIComponent(params.get("from")!);
    // const signerId = Buffer.from(params.get("id")!, "hex");
    // const signerPublicKey = Buffer.from(params.get("publicKey")!, "hex");

    async function add_signer() {
        if (signerPublicKey.length) {
            const { authTxn, authHash, lastLedger } = await add_signer_build(
                signerId,
                signerPublicKey,
            );

            const signRes = await WebAuthn.startAuthentication({
                challenge: base64url(authHash),
                // rpId: undefined,
                allowCredentials: $id
                    ? [
                        {
                            id: $id,
                            type: "public-key",
                        },
                    ]
                    : undefined,
                userVerification: "discouraged",
            });

            await add_signer_send(
                authTxn,
                hash(base64url.toBuffer(signRes.id)),
                lastLedger,
                signRes,
            );
        } else {
            const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

            try {
                await rpc.getContractData($deployee, xdr.ScVal.scvBytes(signerId))
            } catch (err: any) {
                alert(err.message);
                throw err
            }
        }

        window.opener.postMessage(
            { type: "wallet", deployee: $deployee },
            origin,
        );
    }
    async function onRegister() {
        deployee.set(await register());
        console.log($deployee);
        localStorage.setItem("sp:deployee", $deployee);
        await fund();
    }
    async function onConnect() {
        deployee.set(await connect());
        console.log($deployee);
        localStorage.setItem("sp:deployee", $deployee);
        await fund();
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Add Signer</h1>

    {#if $deployee && signerId}
        <p>{$deployee}</p>
        <p>{signerId.toString('base64')}</p>
        <br />

        {#if signerPublicKey.length}
            <button
                class="bg-indigo-600 text-white px-2 py-1 rounded"
                on:click={add_signer}>+ Add signer</button
            >
        {:else}
            <button
                class="bg-slate-600 text-white px-2 py-1 rounded mb-2"
                on:click={add_signer}>+ Connect signer</button
            >
        {/if}
    {:else}
        <p>Register a new or connect an existing super key</p>
        <br />
        <button
            class="bg-indigo-600 text-white px-2 py-1 rounded mb-2"
            on:click={onRegister}>+ Register new super key</button
        >
        <button
            class="bg-slate-600 text-white px-2 py-1 rounded mb-2"
            on:click={onConnect}>+ Connect existing super key</button
        >
    {/if}
</main>

<script lang="ts">
    import { connect } from "../lib/connect";
    import { register } from "../lib/register";
    import { deployee } from "../lib/deployee";
    import { fund } from "../lib/fund";
    import { list_sigs } from "../lib/list_sigs";
    import { onMount } from "svelte";
    import { get_balance } from "../lib/get_balance";
    import base64url from "base64url";
    import { hash } from "@stellar/stellar-sdk";
    import { id } from "../lib/id";
    import * as WebAuthn from "@simplewebauthn/browser";
    import { remove_sig_build } from "../lib/remove_sig_build";
    import { remove_sig_send } from "../lib/remove_sig_send";

    let sigs: string[] = [];
    let balance: number = 0;

    $: idParsed = hash(base64url.toBuffer($id)).toString("base64")

    onMount(async () => {
        await onGetBalance();
        await onListSigs();
    });

    async function onGetBalance() {
        balance = await get_balance();
    }
    async function onListSigs() {
        sigs = await list_sigs();
    }
    async function onRegister() {
        deployee.set(await register());
        console.log($deployee);
        localStorage.setItem("sp:deployee", $deployee);
        await fund();
        await onGetBalance();
        await onListSigs();
    }
    async function onConnect() {
        deployee.set(await connect());
        console.log($deployee);
        localStorage.setItem("sp:deployee", $deployee);
        await fund();
        await onGetBalance();
        await onListSigs();
    }
    async function onRemoveSig(id: string) {
        const { authTxn, authHash, lastLedger } = await remove_sig_build(Buffer.from(id, 'base64'));

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

        await remove_sig_send(
            authTxn,
            Buffer.from(idParsed, 'base64'),
            lastLedger,
            signRes,
        );

        await onListSigs();
    }
    async function logout() {
        localStorage.removeItem("sp:id");
        localStorage.removeItem("sp:bundler");
        localStorage.removeItem("sp:deployee");
        window.location.reload();
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2 flex items-center">
        Super Peach
        <button
            class="text-xs uppercase bg-slate-600 rounded text-white px-2 py-1 ml-2"
            on:click={logout}>Reset</button
        >
    </h1>

    {#if $deployee && $id}
        <p>{$deployee}</p>
        <p>{idParsed}</p>
        <br />
        <p>
            Balance {balance} XLM
            <button
                class="text-xs uppercase bg-slate-600 rounded text-white px-2 py-1"
                on:click={onGetBalance}>Refresh</button
            >
        </p>
        <br />
        <p>
            Signers
            <button
                class="text-xs uppercase bg-slate-600 rounded text-white px-2 py-1"
                on:click={onListSigs}>Refresh</button
            >
        </p>
        <ul>
            {#each sigs as sig}
                <li>
                    {sig}
                    {#if sig !== idParsed}
                        <button
                            class="text-xs uppercase bg-rose-600 rounded text-white px-2 py-1"
                            on:click={() => onRemoveSig(sig)}>Remove</button
                        >
                    {/if}
                </li>
            {/each}
        </ul>
        <br />
    {/if}

    {#if !$deployee}
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

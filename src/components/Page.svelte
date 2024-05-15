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

    let sigs: string[] = [];
    let balance: number = 0;

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
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Super Peach</h1>

    {#if $deployee && $id}
        <p>{$deployee}</p>
        <p>{hash(base64url.toBuffer($id)).toString("base64")}</p>
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
                <li>{sig}</li>
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

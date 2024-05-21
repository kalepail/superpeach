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
    import { setBundlerKey } from "../lib/bundler";

    let sigs: string[] = [];
    let balance: number = 0;
    let idParsed: string;

    id.subscribe(async (val) => {
        idParsed = hash(base64url.toBuffer(val)).toString("base64")
    })

    onMount(async () => {
        await setBundlerKey()
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
            Buffer.from(idParsed!, 'base64'),
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

<main class="flex flex-col lg:flex-row">
    <div class="flex flex-col items-start py-2 px-5 flex-shrink-0 border-[#424257] order-1 lg:min-w-[600px] lg:w-1/2 lg:border-r-2 lg:order-0">
        <h1 class="mb-2 flex items-center">
            <span class="text-[56px] font-black">Super Peach</span>
            <button
                class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1 ml-5"
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
                    class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1"
                    on:click={onGetBalance}>Refresh</button
                >
            </p>
            <br />
            <p>
                Signers
                <button
                    class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1"
                    on:click={onListSigs}>Refresh</button
                >
            </p>
            <ul>
                {#each sigs as sig}
                    <li>
                        {sig}
                        {#if sig !== idParsed}
                            <button
                                class="text-xs uppercase bg-[#ee494e] rounded text-white px-2 py-1"
                                on:click={() => onRemoveSig(sig)}>Remove</button
                            >
                        {/if}
                    </li>
                {/each}
            </ul>
            <br />
            <p>Sites</p>
            {#if import.meta.env.DEV}
                <ul>
                    <li><a class="text-[#ccaff8] underline" target="_blank" rel="noopener noreferrer" href="http://localhost:4322/">localhost:4322</a></li>
                    <li><a class="text-[#ccaff8] underline" target="_blank" rel="noopener noreferrer" href="http://localhost:4323/">localhost:4323</a></li>
                </ul>
            {:else}
                <ul>
                    <li><a class="text-[#ccaff8] underline" target="_blank" rel="noopener noreferrer" href="https://minipeach-a.pages.dev/">minipeach-a.pages.dev</a></li>
                    <li><a class="text-[#ccaff8] underline" target="_blank" rel="noopener noreferrer" href="https://minipeach-b.pages.dev/">minipeach-b.pages.dev</a></li>
                </ul>
            {/if}
        {/if}
    
        {#if !$deployee}
            <button
                class="bg-[#51ba95] text-white px-2 py-1 rounded mb-2"
                on:click={onRegister}>+ Register new super key</button
            >
            <button
                class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
                on:click={onConnect}>+ Connect existing super key</button
            >
        {/if}
    </div>
    
    <div class="h-[128px] w-full bg-[url('/meta.webp')] bg-no-repeat bg-center order-0 lg:order-1 lg:h-dvh">
        <!-- <img src="/meta.webp"> -->
    </div>
</main>

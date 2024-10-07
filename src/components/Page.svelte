<script lang="ts">
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import {
        connect,
        fund,
        create,
        send,
        getContractId,
        getSigners,
    } from "../lib/passkey";
    import { account, native } from "../lib/common-client";
    import Loader from "./Loader.svelte";
    import { SignerKey } from "passkey-kit";

    let loaders = new Map();
    let balance: string = "0";
    let signers: {
		kind: string;
		key: string;
		val: string;
		limits: string;
		expired?: boolean;
	}[] = [];

    keyId.subscribe(async (kid) => {
        try {
            if (kid && !account.keyId) {
                const { contractId: cid } = await account.connectWallet({
                    keyId: kid,
                    getContractId,
                });
                contractId.set(cid);
                await onGetBalance();
                await onGetSigners();
            }
        } catch (err: any) {
            alert(err.message);
        }
    });

    async function onCreate() {
        loaders.set("create", true);
        loaders = loaders;

        try {
            await create();
            await fund($contractId);

            await onGetBalance();
            await onGetSigners();
        } finally {
            loaders.delete("create");
            loaders = loaders;
        }
    }
    async function onConnect() {
        loaders.set("connect", true);
        loaders = loaders;

        try {
            await connect();

            await onGetBalance();
            await onGetSigners();
        } finally {
            loaders.delete("connect");
            loaders = loaders;
        }
    }
    async function onFund() {
        loaders.set("fund", true);
        loaders = loaders;

        try {
            await fund($contractId);
            await onGetBalance();
        } finally {
            loaders.delete("fund");
            loaders = loaders;
        }
    }
    async function onGetBalance() {
        loaders.set("balance", true);
        loaders = loaders;

        try {
            const { result } = await native.balance({ id: $contractId });

            balance = result.toString();
            console.log(balance);
        } finally {
            loaders.delete("balance");
            loaders = loaders;
        }
    }
    async function onGetSigners() {
        loaders.set("signers", true);
        loaders = loaders;

        try {
            signers = await getSigners($contractId);
            console.log(signers);
        } finally {
            loaders.delete("signers");
            loaders = loaders;
        }
    }
    async function onRemoveSignature(signer: string) {
        loaders.set(signer, true);
        loaders = loaders;

        try {
            const at = await account.remove(SignerKey.Secp256r1(signer)) 
            await account.sign(at, { keyId: $keyId });
            const res = await send(at.built!.toXDR());

            console.log(res);

            await onGetSigners();
        } catch (err: any) {
            alert(err.message);
        } finally {
            loaders.delete(signer);
            loaders = loaders;
        }
    }
    async function logout() {
        localStorage.removeItem("sp:keyId");
        window.location.reload();
    }
</script>

<main class="flex flex-col lg:flex-row">
    <div class="p-2 order-1 lg:w-1/2 lg:order-0">
        <table class="table-fixed mb-2">
            <thead>
                <tr>
                    <th>
                        <img src="/favicon_2.webp" width="28" />
                    </th>
                    <th class="px-2">Super Peach</th>
                    {#if $keyId}
                        <td>
                            <button
                                class="bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={logout}>Reset</button
                            >
                        </td>
                    {/if}
                </tr>
            </thead>
        </table>

        {#if $contractId && $keyId}
            <table class="mb-2">
                <tbody class="[&>tr>td]:px-2">
                    <tr>
                        <td class="bg-black/10">Contract:</td>
                        <td>
                            <a
                                class="underline text-[#0000ff]"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://stellar.expert/explorer/testnet/contract/${$contractId}`}
                            >
                                {$contractId.substring(
                                    0,
                                    6,
                                )}...{$contractId.substring(
                                    $contractId.length - 6,
                                )}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="bg-black/10">Key: </td>
                        <td
                            >{$keyId.substring(0, 6)}...{$keyId.substring(
                                $keyId.length - 6,
                            )}</td
                        >
                    </tr>
                </tbody>
            </table>

            <table class="mb-2">
                <tbody>
                    <tr>
                        <td class="px-2 bg-black/10">Balance:</td>
                        <td class="px-2"
                            >{parseFloat(
                                (Number(balance) / 10_000_000).toFixed(7),
                            )} XLM</td
                        >
                        <td>
                            <button
                                class="flex items-center justify-center bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={onFund}
                                >Fund {#if loaders.get("fund")}<Loader
                                        class="ml-2"
                                    />{/if}</button
                            >
                        </td>
                        <td>
                            <button
                                class="flex items-center justify-center bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={onGetBalance}
                                >Refresh {#if loaders.get("balance")}<Loader
                                        class="ml-2"
                                    />{/if}</button
                            >
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="mb-2">
                <tbody>
                    <tr>
                        <td class="px-2 bg-black/10">Signers:</td>
                        <td>
                            <button
                                class="flex items-center justify-center bg-black text-white px-2 py-1 uppercase text-sm w-full"
                                on:click={onGetSigners}
                                >Refresh{#if loaders.get("signers")}<Loader
                                        class="ml-2"
                                    />{/if}</button
                            >
                        </td>
                    </tr>

                    {#each signers as { key }}
                        <tr>
                            <td colspan=1 class="px-2"
                                >{key.substring(0, 6)}...{key.substring(
                                    key.length - 6,
                                )}</td
                            >

                            <td>
                                <button
                                    class="flex items-center justify-center bg-black text-white px-2 py-1 uppercase text-sm w-full"
                                    on:click={() => onRemoveSignature(key)}
                                    >Remove {#if loaders.get(key)}<Loader
                                            class="ml-2"
                                        />{/if}</button
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <table class="mb-2">
                <tbody>
                    <tr>
                        <td>
                            <button
                                class="flex items-center justify-center bg-black text-white px-2 py-1 uppercase text-sm w-full"
                                on:click={onCreate}
                                >+ Create new wallet {#if loaders.get("create")}<Loader
                                        class="ml-2"
                                    />{/if}</button
                            >
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button
                                class="flex items-center justify-center text-black px-2 py-1 uppercase text-sm w-full"
                                on:click={onConnect}
                                >+ Connect existing wallet {#if loaders.get("connect")}<Loader
                                        class="ml-2"
                                    />{/if}</button
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        {/if}

        <table>
            <thead>
                <tr>
                    <td class="px-2 bg-black/10">Demo Apps:</td>
                </tr>
            </thead>
            <tbody class="[&>tr>td]:px-2">
                {#if import.meta.env.DEV}
                    <tr>
                        <td>
                            <a
                                class="text-[#0000ff] underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="http://localhost:4322/">localhost:4322</a
                            >
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a
                                class="text-[#0000ff] underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="http://localhost:4323/">localhost:4323</a
                            >
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td>
                            <a
                                class="text-[#0000ff] underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://minipeach-a.vercel.app/"
                                >minipeach-a.vercel.app</a
                            >
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a
                                class="text-[#0000ff] underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://minipeach-b.vercel.app/"
                                >minipeach-b.vercel.app</a
                            >
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>

    <div
        class="h-[128px] w-full bg-[url('/meta.webp')] bg-no-repeat bg-center bg-cover order-0 lg:order-1 lg:h-dvh"
    ></div>
</main>

<style>
    table,
    th,
    td {
        border: 1px solid black;
        border-collapse: collapse;
    }
</style>

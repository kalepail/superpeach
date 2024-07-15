<script lang="ts">
    import { contractId } from "../store/contractId";
    import base64url from "base64url";
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

    let balance: string = "0";
    let signers: {
        id: string;
        pk: string;
        admin: boolean;
        expired?: boolean | undefined;
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
        await create();
        await fund($contractId);

        await onGetBalance();
        await onGetSigners();
    }
    async function onConnect() {
        await connect();

        await onGetBalance();
        await onGetSigners();
    }
    async function onFund() {
        await fund($contractId);
        await onGetBalance();
    }
    async function onGetBalance() {
        const { result } = await native.balance({ id: $contractId });

        balance = result.toString();
        console.log(balance);
    }
    async function onGetSigners() {
        signers = await getSigners($contractId);
        console.log(signers);
    }
    async function onRemoveSignature(signer: string) {
        try {
            const { built } = await account.wallet!.remove({
                id: base64url.toBuffer(signer),
            });

            const xdr = await account.sign(built!, { keyId: $keyId });
            const res = await send(xdr);

            console.log(res);

            await onGetSigners();
        } catch (err: any) {
            alert(err.message);
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
                        <td>Contract:</td>
                        <td
                            >{$contractId.substring(
                                0,
                                6,
                            )}...{$contractId.substring(
                                $contractId.length - 6,
                            )}</td
                        >
                    </tr>
                    <tr>
                        <td>Key: </td>
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
                        <td class="px-2">Balance:</td>
                        <td class="px-2"
                            >{parseFloat(
                                (Number(balance) / 10_000_000).toFixed(7),
                            )} XLM</td
                        >
                        <td>
                            <button
                                class="bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={onFund}>Fund</button
                            >
                        </td>
                        <td>
                            <button
                                class="bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={onGetBalance}>Refresh</button
                            >
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="mb-2">
                <tbody>
                    <tr>
                        <td class="px-2">Signers:</td>
                        <td>
                            <button
                                class="bg-black text-white px-2 py-1 uppercase text-sm"
                                on:click={onGetSigners}>Refresh</button
                            >
                        </td>
                    </tr>

                    {#each signers as { id, admin }}
                        <tr>
                            <td colspan={admin ? 2 : 1} class="px-2"
                                >{id.substring(0, 6)}...{id.substring(
                                    id.length - 6,
                                )}</td
                            >

                            {#if !admin}
                                <td>
                                    <button
                                        class="bg-black text-white px-2 py-1 uppercase text-sm w-full"
                                        on:click={() => onRemoveSignature(id)}
                                        >Remove</button
                                    >
                                </td>
                            {/if}
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
                                class="bg-black text-white px-2 py-1 uppercase text-sm w-full"
                                on:click={onCreate}>+ Create new wallet</button
                            >
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button
                                class="text-black px-2 py-1 uppercase text-sm w-full"
                                on:click={onConnect}
                                >+ Connect existing wallet</button
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        {/if}

        <table>
            <tbody class="[&>tr>td]:px-2">
                <tr>
                    <td>Sites:</td>
                </tr>
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

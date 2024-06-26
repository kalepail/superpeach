<script lang="ts">
    import { contractId } from "../store/contractId";
    import base64url from "base64url";
    import { Networks } from "@stellar/stellar-sdk";
    import { keyId } from "../store/keyId";
    import { getBalance, connect, fund, register, send } from "../lib/passkey";
    import { arraysEqual } from "../lib/common";
    import { PasskeyKit } from "passkey-kit";

    let walletData: Map<string, any> = new Map();
    let balance: string = "0";

    const account = new PasskeyKit({
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
        rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    });

    keyId.subscribe(async (kid) => {
        if (kid && !account.keyId) {
            const { contractId: cid } = await account.connectWallet(kid);
            contractId.set(cid);
            await onGetBalance();
            await onGetData();
        }
    });

    async function onRegister() {
        await register(account);
        await fund($contractId);

        await onGetBalance();
        await onGetData();
    }
    async function onConnect() {
        await connect(account);

        await onGetBalance();
        await onGetData();
    }
    async function onFund() {
        await fund($contractId);
        await onGetBalance();
    }
    async function onGetBalance() {
        balance = await getBalance($contractId);
    }
    async function onGetData() {
        walletData = await account.getData();
    }
    async function onRemoveSignature(signer: Uint8Array) {
        const { built } = await account.wallet!.rm_sig({
            id: Buffer.from(signer),
        });

        const xdr = await account.sign(built!, { keyId: "sudo" });
        const res = await send(xdr);

        console.log(res);

        await onGetData();
    }
    async function logout() {
        localStorage.removeItem("sp:keyId");
        window.location.reload();
    }
</script>

<main class="flex flex-col lg:flex-row">
    <div
        class="flex flex-col items-start py-2 px-5 flex-shrink-0 border-[#424257] order-1 lg:min-w-[600px] lg:w-1/2 lg:border-r-2 lg:order-0"
    >
        <h1 class="mb-2 flex items-center">
            <span class="text-[56px] font-black">Super Peach</span>
            <button
                class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1 ml-5"
                on:click={logout}>Reset</button
            >
        </h1>

        {#if $contractId && $keyId}
            <p>{$contractId}</p>
            <p>{$keyId}</p>
            <br />
            <p>
                Balance {parseFloat((Number(balance) / 10_000_000).toFixed(7))} XLM

                <button
                    class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1"
                    on:click={onFund}>Fund</button
                >
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
                    on:click={onGetData}>Refresh</button
                >
            </p>
            <ul>
                {#each walletData.size ? walletData.get("sigs") : [] as signer}
                    <li>
                        {base64url(signer)}

                        {#if walletData.size && !arraysEqual(signer, walletData.get("sudo_sig"))}
                            <button
                                class="text-xs uppercase bg-[#ee494e] rounded text-white px-2 py-1"
                                on:click={() => onRemoveSignature(signer)}
                                >Remove</button
                            >
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <button
                class="bg-[#51ba95] text-white px-2 py-1 rounded mb-2"
                on:click={onRegister}>+ Register new super key</button
            >
            <button
                class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
                on:click={onConnect}>+ Connect existing super key</button
            >
        {/if}

        <br />
        <p>Sites</p>
        {#if import.meta.env.DEV}
            <ul>
                <li>
                    <a
                        class="text-[#ccaff8] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="http://localhost:4322/">localhost:4322</a
                    >
                </li>
                <li>
                    <a
                        class="text-[#ccaff8] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="http://localhost:4323/">localhost:4323</a
                    >
                </li>
            </ul>
        {:else}
            <ul>
                <li>
                    <a
                        class="text-[#ccaff8] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://minipeach-a.vercel.app/"
                        >minipeach-a.vercel.app</a
                    >
                </li>
                <li>
                    <a
                        class="text-[#ccaff8] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://minipeach-b.vercel.app/"
                        >minipeach-b.vercel.app</a
                    >
                </li>
            </ul>
        {/if}
    </div>

    <div
        class="h-[128px] w-full bg-[url('/meta.webp')] bg-no-repeat bg-center bg-cover order-0 lg:order-1 lg:h-dvh"
    ></div>
</main>

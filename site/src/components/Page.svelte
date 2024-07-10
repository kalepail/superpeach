<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import base64url from "base64url";
    import { Networks } from "@stellar/stellar-sdk";
    import { PasskeyKit } from "passkey-kit";
    import { getContractId, send, transferSAC } from "../lib/passkey";
    import { formatDate } from "../lib/common";

    // Register new passkey
    // Forward that key to super peach (both the id and the pk)
    // Send contract address back if successfully added

    // TODO so many `connectWallet` calls. Why?!

    let popup: Window | null;

    const account = new PasskeyKit({
        rpcUrl: import.meta.env.PUBLIC_rpcUrl,
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
        factoryContractId: import.meta.env.PUBLIC_factoryContractId,
    });

    const to = import.meta.env.PUBLIC_superpeachUrl;
    const from = location.origin;

    keyId.subscribe(async (kid) => {
        if (kid && !account.keyId) {
            const { contractId: cid } = await account.connectWallet({
                keyId: kid,
                getContractId
            });
            contractId.set(cid);
        }
    });

    contractId.subscribe(async (cid) => {
        if (cid && $keyId && !account.keyId)
            await account.connectWallet({
                keyId: $keyId,
                getContractId
        });
    });

    onDestroy(() => {
        window.removeEventListener("message", messenger);
    });

    onMount(async () => {
        window.addEventListener("message", messenger);
    });

    function messenger(event: MessageEvent<any>) {
        if (event.origin !== to) return;

        if (event.data.type === "wallet") {
            // Now that we've got a contractId it's safe to connect the wallet
            account.connectWallet({
                keyId: $keyId,
                getContractId
            });

            contractId.set(event.data.contractId);
            console.log(event.data.contractId);

            popup?.close();
        }
    }

    async function connect(type?: "signin") {
        let kid: Buffer | undefined
        let publicKey: Buffer | undefined

        try {
            if (type === "signin") {
                const wallet = await account.connectWallet({
                    getContractId
                });

                kid = wallet.keyId

                contractId.set(wallet.contractId);
                console.log(wallet.contractId);
            } else {
                const key = await account.createKey("Super Peach", `${import.meta.env.PUBLIC_name} ${formatDate()}`)

                kid = key.keyId
                publicKey = key.publicKey
            }
        } catch(err: any) {
            return alert(err.message)
        }

        const keyId_base64url = base64url.encode(kid!);

        keyId.set(keyId_base64url);
        console.log(keyId_base64url);
        localStorage.setItem("sp:keyId", keyId_base64url);

        // Successfully signed in, no need to forward anything to Super Peach
        if ($keyId && $contractId)
            return;

        if (!kid || !publicKey) 
            return alert("Something went wrong")

        const w = 400;
        const h = 500;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;

        const windowFeatures = `width=${w},height=${h},left=${left},top=${top},resizable=no,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`;

        // TODO should probably pass id and public key through postmessage vs the url
        popup = window.open(
            `${to}/add-signer?from=${encodeURIComponent(from)}&keyId=${kid.toString("hex")}&publicKey=${publicKey.toString("hex")}`,
            "Super Peach",
            windowFeatures,
        );

        if (!popup) {
            alert("Popup was blocked by the browser.");
        } else {
            popup.focus();
        }
    }
    async function transfer() {
        try {
            const { built } = await transferSAC({
                SAC: import.meta.env.PUBLIC_nativeContractId,
                from: $contractId,
                to: import.meta.env.PUBLIC_factoryContractId,
                amount: 10_000_000
            });

            const xdr = await account.sign(built, { keyId: $keyId });
            const res = await send(xdr)

            console.log(res);

            alert("✅ Transfer complete");
        } catch (err: any) {
            alert(err.message)
        }
    }
    async function logout() {
        localStorage.removeItem("sp:keyId");
        window.location.reload();
    }
</script>

<main class="flex flex-col items-start py-2 px-5">
    <h1 class="mb-2 flex items-center">
        <span class="text-[56px] font-black">{import.meta.env.PUBLIC_name}</span>
        <button
            class="text-xs uppercase bg-[#566b9b] rounded text-white px-2 py-1 ml-5"
            on:click={logout}>Reset</button
        >
    </h1>

    {#if $contractId && $keyId}
        <p>{$contractId}</p>
        <p>{$keyId}</p>
        <br />
        <button
            class="bg-[#51ba95] text-white px-2 py-1 rounded"
            on:click={transfer}>Transfer 1 XLM</button
        >
    {:else}
        <button
            class="bg-[#51ba95] text-white px-2 py-1 rounded mb-2"
            on:click|trusted={() => connect()}>+ Register new signer</button
        >
        <button
            class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
            on:click|trusted={() => connect("signin")}
            >+ Connect existing signer</button
        >
    {/if}
</main>

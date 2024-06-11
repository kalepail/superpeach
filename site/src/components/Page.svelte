<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import base64url from "base64url";
    import { Networks } from "@stellar/stellar-sdk";
    import { formatDate } from "../lib/utils";
    import { PasskeyKit } from "passkey-kit";
    import { submit, transferSAC } from "../lib/passkey";

    // Register new passkey
    // Forward that key to super peach (both the id and the pk)
    // Send contract address back if successfully added

    let popup: Window | null;

    const account = new PasskeyKit({
        sequencePublicKey: import.meta.env.PUBLIC_sequencePublickey,
        networkPassphrase: import.meta.env.PUBLIC_networkPassphrase as Networks,
        horizonUrl: import.meta.env.PUBLIC_horizonUrl,
        rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    });

    const to = import.meta.env.PUBLIC_superpeachUrl;
    const from = location.origin;

    onDestroy(() => {
        window.removeEventListener("message", messenger);
    });

    onMount(() => {
        window.addEventListener("message", messenger);
    });

    function messenger(event: MessageEvent<any>) {
        if (event.origin !== to) return;

        if (event.data.type === "wallet") {
            contractId.set(event.data.contractId);
            console.log(event.data.contractId);
            localStorage.setItem("sp:contractId", event.data.contractId);

            popup?.close();
        }
    }

    async function openPage(type?: "signin") {
        let kid: Buffer | undefined
        let publicKey: Buffer | undefined

        try {
            if (type === "signin") {
                const wallet = await account.connectWallet();

                kid = wallet.keyId

                contractId.set(wallet.contractId);
                console.log(wallet.contractId);
                localStorage.setItem("sp:contractId", $contractId);
            } else {
                const key = await account.createKey("Super Peach", `${import.meta.env.PUBLIC_name} ${formatDate()}`)

                kid = key.keyId
                publicKey = key.publicKey
            }
        } catch(err: any) {
            alert(err.message)
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
        const built = await transferSAC({
			SAC: import.meta.env.PUBLIC_nativeContractId,
			source: import.meta.env.PUBLIC_sequencePublickey,
			from: $contractId,
			to: account.factory.options.contractId,
			amount: 10_000_000
		});

		const xdr = await account.sign(built, { keyId: $keyId });
        const res = await submit(xdr)

		console.log(res);

        alert("✅ Transfer complete");
    }
    async function logout() {
        localStorage.removeItem("sp:keyId");
        localStorage.removeItem("sp:contractId");
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
    {/if}

    {#if $contractId}
        <button
            class="bg-[#51ba95] text-white px-2 py-1 rounded"
            on:click={transfer}>Transfer 1 XLM</button
        >
    {:else}
        <button
            class="bg-[#51ba95] text-white px-2 py-1 rounded mb-2"
            on:click|trusted={() => openPage()}>+ Register new signer</button
        >
        <button
            class="bg-[#566b9b] text-white px-2 py-1 rounded mb-2"
            on:click|trusted={() => openPage("signin")}
            >+ Connect existing signer</button
        >
    {/if}
</main>

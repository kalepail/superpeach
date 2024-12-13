<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { contractId } from "../store/contractId";
    import { keyId } from "../store/keyId";
    import base64url from "base64url";
    import { getContractId, send } from "../lib/passkey";
    import { account, mockPubkey, native } from "../lib/common-client";

    // Register new passkey
    // Forward that key to super peach (both the id and the pk)
    // Send success back if successfully added

    let popup: Window | null;

    keyId.subscribe(async (kid) => {
        try {
            if (kid && !account.keyId) {
                const { contractId: cid } = await account.connectWallet({
                    keyId: kid,
                    getContractId
                });
                contractId.set(cid);
            }
        } catch (err: any) {
            alert(err.message)
        }
    });

    onDestroy(() => {
        window.removeEventListener("message", messenger);
    });

    onMount(async () => {
        window.addEventListener("message", messenger);
    });

    async function messenger(event: MessageEvent<any>) {
        try {
            if (
                event.data.name === "superpeach" 
                && event.data.message === 'OK'
                && event.origin === import.meta.env.PUBLIC_superpeachUrl
            ) {
                popup?.close();
                
                console.log(event);

                const { contractId: cid } = await account.connectWallet({
                    keyId: $keyId,
                    getContractId
                });

                contractId.set(cid);
                console.log(cid);
            }
        } catch (err: any) {
            alert(err.message)
        }
    }

    async function connect(type?: "signin") {
        try {
            let kid: Buffer;
            let kidIdBase64: string;

            if (type === "signin") {
                const wallet = await account.connectWallet({
                    getContractId
                });

                contractId.set(wallet.contractId);
                console.log(wallet.contractId);

                kid = wallet.keyId;
                kidIdBase64 = wallet.keyIdBase64;
            } else {
                const wallet = await account.createKey("Super Peach", import.meta.env.PUBLIC_name)

                kid = wallet.keyId;
                kidIdBase64 = wallet.keyIdBase64;

                const w = 400;
                const h = 500;
                const left = window.screenX + (window.outerWidth - w) / 2;
                const top = window.screenY + (window.outerHeight - h) / 2;

                const windowFeatures = `width=${w},height=${h},left=${left},top=${top},resizable=no,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`;

                // TODO should probably pass id and public key through postmessage vs the url
                popup = window.open(
                    `${import.meta.env.PUBLIC_superpeachUrl}/add-signer?from=${encodeURIComponent(location.origin)}&keyId=${base64url(kid)}&publicKey=${base64url(wallet.publicKey)}`,
                    "Super Peach",
                    windowFeatures,
                );

                if (!popup) {
                    alert("Popup was blocked by the browser.");
                } else {
                    popup.focus();
                }
            }

            keyId.set(kidIdBase64);
            console.log(kidIdBase64);
            localStorage.setItem("sp:keyId", kidIdBase64);
        } catch(err: any) {
            return alert(err.message)
        }
    }
    async function transfer() {
        try {
            const at = await native.transfer({
                to: mockPubkey,
                from: $contractId,
                amount: BigInt(10_000_000),
            });

            await account.sign(at, { keyId: $keyId });
            const res = await send(at.built!.toXDR());

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

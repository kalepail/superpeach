<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { deployee } from "../lib/deployee";
    import { id } from "../lib/id";
    import { register } from "../lib/register";
    import { transfer_build } from "../lib/transfer_build";
    import { transfer_send } from "../lib/transfer_send";
    import * as WebAuthn from "@simplewebauthn/browser";
    import base64url from "base64url";
    import { hash } from "@stellar/stellar-sdk";

    // Register new passkey
    // Forward that key to super peach (both the id and the pk)
    // Send contract address back if successfully added

    let popup: Window | null;

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
            deployee.set(event.data.deployee);
            console.log($deployee);
            localStorage.setItem("sp:deployee", $deployee);
            popup?.close();
        }
    }

    async function openPage() {
        const reg = await register();

        const w = 400;
        const h = 500;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;

        const windowFeatures = `width=${w},height=${h},left=${left},top=${top},resizable=no,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`;
        
        popup = window.open(
            `${to}/add-signer?from=${encodeURIComponent(from)}&id=${reg.id.toString("hex")}&publicKey=${reg.publicKey.toString("hex")}`,
            "PopupWindow",
            windowFeatures,
        ); // TODO should probably pass id and public key through postmessage vs the url

        if (!popup) {
            alert("Popup was blocked by the browser.");
        } else {
            popup.focus();
        }
    }

    async function transfer() {
        const { authTxn, authHash, lastLedger } = await transfer_build();

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

        await transfer_send(authTxn, hash(base64url.toBuffer($id)), lastLedger, signRes);

        alert("✅ Transfer complete");
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Site B</h1>
    <h2>{$deployee}</h2>
    <br />
    {#if $deployee}
        <button
            class="bg-indigo-600 text-white px-2 py-1 rounded"
            on:click={transfer}>Transfer 1 XLM</button
        >
    {:else}
        <button
            class="bg-indigo-600 text-white px-2 py-1 rounded"
            on:click={openPage}>+ Create signer</button
        >
    {/if}
</main>

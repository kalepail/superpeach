<script lang="ts">
    import { deployee } from "../lib/deployee";
    import { id } from "../lib/id";
    import { add_signer_build } from "../lib/add_signer_build";
    import { add_signer_send } from "../lib/add_signer_send";
    import base64url from "base64url";
    import * as WebAuthn from "@simplewebauthn/browser";
    import { hash } from "@stellar/stellar-sdk";

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const origin = decodeURIComponent(params.get("from")!);
    const signerId = Buffer.from(params.get("id")!, "hex");
    const signerPublicKey = Buffer.from(params.get("publicKey")!, "hex");

    async function add_signer() {
        const { authTxn, authHash, lastLedger } = await add_signer_build(
            signerId,
            signerPublicKey,
        );

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

        await add_signer_send(
            authTxn,
            hash(base64url.toBuffer(signRes.id)),
            lastLedger,
            signRes,
        );

        window.opener.postMessage(
            { type: "wallet", deployee: $deployee },
            origin,
        );
    }
</script>

<main class="flex flex-col items-start p-2">
    <h1 class="text-2xl mb-2">Add Signer</h1>
    <p>{$deployee}</p>
    <p>{$id}</p>
    <p>{origin}</p>
    <p>{signerId.toString("hex")}</p>
    <p>{signerPublicKey.toString("hex")}</p>
    <br />
    <button
        class="bg-indigo-600 text-white px-2 py-1 rounded"
        on:click={add_signer}>+ Add signer</button
    >
</main>

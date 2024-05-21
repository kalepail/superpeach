import base64url from "base64url";
import * as WebAuthn from '@simplewebauthn/browser';
import { getPublicKeys } from './webauthn'
import { id } from "./id";

export async function register() {
    const user = `Mini Peach A ${formatDate()}`

    const res = await WebAuthn.startRegistration({
        challenge: base64url("createchallenge"),
        rp: {
            // id: undefined,
            name: "Super Peach",
        },
        user: {
            id: base64url(user),
            name: user,
            displayName: user,
        },
        authenticatorSelection: {
            requireResidentKey: false,
            residentKey: "preferred",
            userVerification: "discouraged",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        attestation: "none",
    });

    id.set(res.id)
    localStorage.setItem("sp:id", res.id);

    return getPublicKeys(res)
}

function formatDate() {
    const date = new Date(); // Get current date
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with zero if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month, add 1 (January is 0), and pad
    const year = date.getFullYear(); // Get full year
    return `${day}/${month}/${year}`; // Return the formatted date
}
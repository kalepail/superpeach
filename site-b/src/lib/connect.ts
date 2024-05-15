import base64url from "base64url";
import * as WebAuthn from '@simplewebauthn/browser';
import { getPublicKeys } from './webauthn'
import { id } from "./id";

export async function connect() {
    const res = await WebAuthn.startAuthentication({
        challenge: base64url("createchallenge"),
        // rpId: undefined,
        userVerification: "discouraged",
    });

    id.set(res.id)
    localStorage.setItem("sp:id", res.id);

    // as-is signin cannot retrieve a public-key so we can only derive the contract address we cannot actually deploy the abstract account
    return getPublicKeys(res);
}
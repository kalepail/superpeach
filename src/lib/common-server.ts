import { PasskeyServer } from "passkey-kit";

export const account = new PasskeyServer({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    launchtubeUrl: import.meta.env.PUBLIC_launchtubeUrl,
    launchtubeJwt: import.meta.env.PRIVATE_launchtubeJwt,
    mercuryUrl: import.meta.env.PUBLIC_mercuryUrl,
    mercuryEmail: import.meta.env.PRIVATE_mercuryEmail,
    mercuryPassword: import.meta.env.PRIVATE_mercuryPassword,
});
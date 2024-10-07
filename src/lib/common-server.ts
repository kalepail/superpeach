import { PasskeyServer } from "passkey-kit";

export function account(env: ImportMetaEnv) {
    return new PasskeyServer({
        rpcUrl: env.PUBLIC_rpcUrl,
        launchtubeUrl: env.PUBLIC_launchtubeUrl,
        launchtubeJwt: env.PRIVATE_launchtubeJwt,
        mercuryUrl: env.PUBLIC_mercuryUrl,
        mercuryJwt: env.PRIVATE_mercuryJwt,
    })
}
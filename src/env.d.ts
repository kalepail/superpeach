/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_rpcUrl: string;
    readonly PUBLIC_launchtubeUrl: string;

    readonly PRIVATE_launchtubeJwt: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_factoryContractId: string;
    readonly PUBLIC_rpcUrl: string;

    readonly PUBLIC_superpeachUrl: string;
    readonly PUBLIC_name: string;
    readonly PUBLIC_style: string;

    readonly PRIVATE_launchtubeJwt: string
    readonly PRIVATE_mercuryJwt: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
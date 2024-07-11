/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_factoryContractId: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_rpcUrl: string;
    readonly PUBLIC_launchtubeUrl: string;
    readonly PUBLIC_mercuryUrl: string;
    
    readonly PRIVATE_launchtubeJwt: string
    readonly PRIVATE_mercuryEmail: string
    readonly PRIVATE_mercuryPassword: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
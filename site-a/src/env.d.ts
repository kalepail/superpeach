/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_factoryContractId: string;
    readonly PUBLIC_rpcUrl: string;
    readonly PUBLIC_horizonUrl: string;
    readonly PUBLIC_superpeachUrl: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
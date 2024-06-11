/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_rpcUrl: string;
    readonly PUBLIC_horizonUrl: string;
    readonly PUBLIC_feeBumpUrl: string;
    readonly PUBLIC_sequencePublickey: string;

    readonly PRIVATE_sequenceSecret: string;
    readonly PRIVATE_feeBumpJwt: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
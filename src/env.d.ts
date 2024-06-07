/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_networkPassphrase: string;
    readonly PUBLIC_nativeContractId: string;
    readonly PUBLIC_rpcUrl: string;
    readonly PUBLIC_horizonUrl: string;
    readonly PUBLIC_fundSecret: string;
    readonly PUBLIC_sequenceSecret: string;
    readonly PUBLIC_feeBumpUrl: string;
    readonly PUBLIC_feeBumpJwt: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
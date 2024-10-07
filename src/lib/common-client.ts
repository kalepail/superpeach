import { Account, Keypair, SorobanRpc, StrKey } from "@stellar/stellar-sdk/minimal"
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Buffer } from "buffer";
import { PasskeyKit, SACClient } from "passkey-kit";

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32))
export const mockSource = new Account(mockPubkey, '0')

export const account = new PasskeyKit({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase,
    factoryContractId: import.meta.env.PUBLIC_factoryContractId,
});

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
    const now = new Date();

    now.setMinutes(0, 0, 0);

    const nowData = new TextEncoder().encode(now.getTime().toString());
    const hashBuffer = crypto.subtle ? await crypto.subtle.digest('SHA-256', nowData) : crypto.getRandomValues(new Uint8Array(32));
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer))

    rpc
        .requestAirdrop(keypair.publicKey())
        .then(console.log)
        .catch(() => { })

    resolve(keypair)
})
export const fundPubkey = (await fundKeypair).publicKey()
export const fundSigner = basicNodeSigner(await fundKeypair, import.meta.env.PUBLIC_networkPassphrase)

export const sac = new SACClient({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase,
});
export const native = sac.getSACClient(import.meta.env.PUBLIC_nativeContractId)
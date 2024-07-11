import { Account, Keypair, SorobanRpc } from "@stellar/stellar-sdk"
import { Buffer } from "buffer";
import { PasskeyKit } from "passkey-kit";

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

export const mockKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32)) // NOTE this isn't the actual zero address
export const mockPubkey = mockKeypair.publicKey()
export const mockSource = new Account(mockPubkey, '0')

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

export const account = new PasskeyKit({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase,
    factoryContractId: import.meta.env.PUBLIC_factoryContractId,
});
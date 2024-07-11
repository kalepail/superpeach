import { Account, SorobanRpc, StrKey } from "@stellar/stellar-sdk"
import { Buffer } from "buffer";
import { PasskeyKit } from "passkey-kit";

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32))
export const mockSource = new Account(mockPubkey, '0')

export const account = new PasskeyKit({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase,
    factoryContractId: import.meta.env.PUBLIC_factoryContractId,
});
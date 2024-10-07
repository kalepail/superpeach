import { Account, SorobanRpc, StrKey } from "@stellar/stellar-sdk/minimal"
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

export const sac = new SACClient({
    rpcUrl: import.meta.env.PUBLIC_rpcUrl,
    networkPassphrase: import.meta.env.PUBLIC_networkPassphrase,
});
export const native = sac.getSACClient(import.meta.env.PUBLIC_nativeContractId)
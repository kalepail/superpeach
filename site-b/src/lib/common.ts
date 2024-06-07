import { Horizon, Keypair, SorobanRpc } from "@stellar/stellar-sdk"

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
export const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl)

export const sequenceKeypair = Keypair.fromSecret(import.meta.env.PUBLIC_sequenceSecret);
export const sequencePubkey = sequenceKeypair.publicKey()
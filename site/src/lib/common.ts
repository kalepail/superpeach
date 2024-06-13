import { Account, Keypair, SorobanRpc } from "@stellar/stellar-sdk"
import { Buffer } from "buffer";

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);

export const mockKeypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32)) // NOTE this isn't the actual zero address
export const mockPubkey = mockKeypair.publicKey()
export const mockSource = new Account(mockPubkey, '0')

export function formatDate() {
    const date = new Date(); // Get current date
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with zero if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month, add 1 (January is 0), and pad
    const year = date.getFullYear(); // Get full year
    
    return `${day}/${month}/${year}`; // Return the formatted date
}
import { Horizon, SorobanRpc } from "@stellar/stellar-sdk"

export const rpc = new SorobanRpc.Server(import.meta.env.PUBLIC_rpcUrl);
export const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl)

export function formatDate() {
    const date = new Date(); // Get current date
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with zero if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month, add 1 (January is 0), and pad
    const year = date.getFullYear(); // Get full year
    
    return `${day}/${month}/${year}`; // Return the formatted date
}
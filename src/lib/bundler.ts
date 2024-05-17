import { Horizon, Keypair } from "@stellar/stellar-sdk";
import { writable, type Writable } from 'svelte/store';

export const bundlerKey: Writable<Keypair> = writable();

export async function setBundlerKey() {
    if (localStorage.hasOwnProperty("sp:bundler")) {
        bundlerKey.set(Keypair.fromSecret(
            localStorage.getItem("sp:bundler")!,
        ));
    } else {
        const keypair = Keypair.random()
        bundlerKey.set(keypair);
    
        localStorage.setItem("sp:bundler", keypair.secret());
    
        const horizon = new Horizon.Server(import.meta.env.PUBLIC_horizonUrl);
        
        await horizon.friendbot(keypair.publicKey()).call();
    }
}
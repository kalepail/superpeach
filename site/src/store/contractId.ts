import { writable, type Writable } from 'svelte/store';

export const contractId: Writable<string> = writable();

if (localStorage.hasOwnProperty("sp:contractId")) {
    contractId.set(localStorage.getItem("sp:contractId")!);
}
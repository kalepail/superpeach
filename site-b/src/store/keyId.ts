import { writable, type Writable } from 'svelte/store';

export const keyId: Writable<string> = writable();

if (localStorage.hasOwnProperty("sp:keyId")) {
    keyId.set(localStorage.getItem("sp:keyId")!);
}
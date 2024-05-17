import { writable, type Writable } from 'svelte/store';

export const deployee: Writable<string> = writable();

if (localStorage.hasOwnProperty("sp:deployee")) {
    deployee.set(localStorage.getItem("sp:deployee")!);
}
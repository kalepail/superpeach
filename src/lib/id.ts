import { writable, type Writable } from 'svelte/store';

export const id: Writable<string> = writable();

if (localStorage.hasOwnProperty("sp:id")) {
    id.set(localStorage.getItem("sp:id")!);
}
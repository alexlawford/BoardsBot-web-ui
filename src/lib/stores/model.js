import { writable } from "svelte/store";

export const panel = writable({
    layers: [{
        type: 'background',
        description: 'A plain white room',
    }]
})

export const state = writable({
    selected: 0,
    over: -1,
    dragging: -1
})
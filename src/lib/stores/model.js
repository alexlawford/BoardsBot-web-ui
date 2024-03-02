import { writable } from "svelte/store";

export const panel = writable({
    layers: [{
        type: 'object',
        description: 'a handgun',
    }]
})
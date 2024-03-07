import { writable } from "svelte/store";

export const panel = writable({
    layers: [{
        type: 'background',
        description: 'A plain white room',
        colour: '#F3F3F3'
    }],
    aspect: 0
})

export const state = writable({
    selected: 0,
    modal: false,
    over: -1,
    dragging: -1,
    pallete: ['#0072b2', '#e69f00', '#56b4e9', '#009e73', '#f0e442'],
    tool: 'move'
})
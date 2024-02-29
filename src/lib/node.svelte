<script>
import { Circle } from 'svelte-konva'
import { createEventDispatcher } from 'svelte';

export let children = []
export let loc = []
export let id
export let ds

const dispatch = createEventDispatcher()

function handleDragStart() {
    dispatch('activate', {})
}

</script>

<Circle
    config={{
        id: id,
        x: loc[0] + 256,
        y: loc[1] + 80,
        radius: 4,
        fill: '#000',
        draggable: true,
    }}
    on:dragstart={ds}
/>

{#each children as child}
    <svelte:self children={child.children} loc={child.loc} id={child.id} ds={ds}/>
{/each}

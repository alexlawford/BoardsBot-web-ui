<script>
import { panel } from '$lib/stores/model.js';

let settings = {
    placeholder : 'Add a description'
}

let state = {
    selected : 0,
    over: -1,
    dragging: -1
}

let events = {
    addObject : () => {
        $panel.layers.push({type: 'object', description: ''})        
        $panel = $panel
    },
    addFigure : () => {
        $panel.layers.push({type: 'figure', description: ''})
        $panel = $panel
    },
    selectLayer : (i) => {
        state.selected = i
    },
    dragStart : (layerIndex) => {
        state.dragging = layerIndex
    },
    dragOver : (e, layerIndex) => {
        e.preventDefault()
        state.over = layerIndex
    },
    dragLeave : () => {
         state.over = -1
    },
    drop : (e, layerIndex) => {
        e.preventDefault()
        if(layerIndex != state.dragging) {
            const layer = $panel.layers[state.dragging]
            $panel.layers.splice(state.dragging, 1)
            $panel.layers.splice(layerIndex, 0, layer)
            state.selected = layerIndex
            $panel = $panel
        }
        state.over = -1
    }
}
</script>
<section class="w-60 rounded-xl bg-slate-800 overflow-hidden">
    <div class="border-b border-slate-900">
        <h1 class="my-4 text-white text-center">Layers</h1>
    </div>
    <div>
        {#each $panel.layers as layer, layerIndex}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div draggable="true"
                 class="{state.over == layerIndex ? 'bg-slate-700' : ''}"
                 on:dragstart={() => events.dragStart(layerIndex)}
                 on:dragover={(e) => events.dragOver(e, layerIndex)}
                 on:dragleave={events.dragLeave}
                 on:drop={(e) => events.drop(e, layerIndex)}
            >
            {#if state.selected == layerIndex}
                <div class="p-2 bg-slate-600 w-60 flex block {state.over == layerIndex ? 'opacity-25' : ''}">
                    <div class='p-1 bg-slate-400 my-1 rounded-lg'>
                        <img src="/icon-{layer.type}-layer.png" alt="{layer.type} icon" class="w-8 h-8 flex-none" />
                    </div>
                    <input bind:value={layer.description} placeholder="{settings.placeholder}"
                            class="text-left leading-10 border border-slate-800 ml-2 w-44 h-10 my-1 px-1 rounded text-sm bg-slate-900 text-white"
                    />
                </div>
                {:else}
                <button class="p-2 w-60 flex block" on:click={() => events.selectLayer(layerIndex)}>
                    <div class='p-1 bg-slate-400 my-1 rounded-lg'>
                        <img src="/icon-{layer.type}-layer.png" alt="{layer.type} icon" class="w-8 h-8 flex-none" />
                    </div>
                    <p class="text-left leading-10 border border-slate-700 ml-2 w-44 h-10 my-1 text-slate-400 px-1 rounded text-sm truncate">{layer.description ? layer.description : settings.placeholder}</p>
                </button>
                {/if}
            </div>
        {/each}
    </div>
    <div class="border-t border-slate-900 grid gap-2 grid-cols-2 p-2">
        {#if $panel.layers.length < 5}
            <button class="h-12 leading-12 bg-slate-600 rounded-lg text-sm text-white hover:bg-slate-500" on:click={events.addObject}>Add Object</button>
            <button class="h-12 leading-12 bg-slate-600 rounded-lg text-sm text-white hover:bg-slate-500" on:click={events.addFigure}>Add Figure</button>
        {/if}
    </div>
</section>
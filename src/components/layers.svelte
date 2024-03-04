<script>
import { panel, state } from '$lib/stores/model.js';
import { prop, figure } from '$lib/structures.js'

let settings = {
    placeholder : 'Add a description'
}

$: layers = $panel.layers.slice().reverse()
$: selected = layers.length - $state.selected - 1

let events = {
    addProp : () => {
        $state.selected = $panel.layers.push(prop([293, 148])) - 1
        $panel = $panel
    },
    addFigure : () => {
        $state.selected = $panel.layers.push(figure([325, 74])) - 1
        $panel = $panel
    },
    selectLayer : (i) => {
        $state.selected = layers.length - i - 1
    },
    dragStart : (layerIndex) => {
        $state.dragging = layerIndex
    },
    dragOver : (e, layerIndex) => {
        e.preventDefault()
        $state.over = layerIndex
    },
    dragLeave : () => {
        $state.over = -1
    },
    drop : (e, layerIndex) => {
        e.preventDefault()
        if(layerIndex != $state.dragging && layerIndex != layers.length - 1) {
            const layer = layers[$state.dragging]
            layers.splice($state.dragging, 1)
            layers.splice(layerIndex, 0, layer)
            $state.selected = layers.length - layerIndex - 1
            $panel.layers = layers.slice().reverse()
            $panel = $panel
        }
        $state.over = -1
    }, 
    deleteLayer: () => {
        if($state.selected != 0) {
            $panel.layers.splice($state.selected, 1)
            $panel = $panel
        }
    }
}

</script>
<section>
    <div class="border-b">
        <h1 class="margin-y text-center strong">Layers</h1>
    </div>
    <div class="w-240">
        {#each layers as layer, layerIndex}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div draggable="true"
                 class="icon-grid border-b {selected == layerIndex ? 'bg-sky' : ''} {$state.over == layerIndex ? 'bg-sky' : ''}"
                 on:dragstart={() => events.dragStart(layerIndex)}
                 on:dragover={(e) => events.dragOver(e, layerIndex)}
                 on:dragleave={events.dragLeave}
                 on:drop={(e) => events.drop(e, layerIndex)}
            >
            {#if selected == layerIndex}
                <div class="icon-grid-icon"><img src="/icon-{layer.type}-layer.svg" alt="type: {layer.type} (icon)"/></div>
                <div class="rest">
                    <input bind:value={$panel.layers[layers.length - layerIndex - 1].description} placeholder="{settings.placeholder}"
                            class="block"
                            on:keyup={events.linkLayerModel}
                    />
                </div>
            {:else}
                <div class="icon-grid-icon"><img class="icon-grid-icon" src="/icon-{layer.type}-layer.svg" alt="type: {layer.type} (icon)"/></div>
                <button class="rest" on:click={() => events.selectLayer(layerIndex)}>
                    {#if layer.description}
                        <p class="truncate">{layer.description}</p>
                    {:else}
                        <p class="text-light">{settings.placeholder}</p>
                    {/if}
                </button>
            {/if}
            </div>
        {/each}
    </div>
    <div class="margin-y two-grid">
        {#if $panel.layers.length < 5}
            <button class="button" on:click={events.addProp}>+ Object</button>
            <button class="button" on:click={events.addFigure}>+ Figure</button>
        {/if}
    </div>
    <div class="margin-y text-center">
        <button class="underline" on:click={events.deleteLayer} ><img src="/icon-trash.svg" alt="trash icon" class="tiny"/>Delete Layer</button>
    </div>
</section>

<style>
.border-b {
    border-bottom: 1px solid #BBB;
}

.margin-y {
    margin-top: 12px;
    margin-bottom: 12px;
}

.text-center {
    text-align: center;
}

.strong {
    font-weight: 700;
}

.icon-grid {
    display: grid;
    grid-template-columns: 36px 1fr;
    grid-template-areas: 'icon rest';
    padding: 6px 0;
}

.icon-grid > .icon-grid-icon {
    grid-area: icon;
    line-height: 24px;
    text-align: center;
}

.icon-grid > .rest {
    grid-area: rest;
}

.icon-grid-icon > img {
    height: 16px;
    vertical-align: -3px;
    display: inline-block;
}

.rest > * {
    width: 195px;
}

.bg-sky {
    background-color: rgb(198, 226, 255);
}

.text-light {
    color: #999;
}

.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.block {
    display: block;
}

.w-240 {
    width: 239px;
}

.two-grid {
    display: grid;
    padding: 0 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 12px;
}

.underline {
    text-decoration: underline;
}

.tiny {
    width: 16px;
    vertical-align: -3px;
    margin-right: 4px;
}
</style>
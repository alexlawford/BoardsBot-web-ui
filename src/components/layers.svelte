<script>
import { panel, state } from '$lib/stores/model.js'
import { prop, figure } from '$lib/structures.js'
import { aspectRatios } from '$lib/settings.js'

let settings = {
    placeholder : 'Add a description'
}

let events = {
    addProp : () => {
        let colour = $state.pallete.shift()
        $state.selected = $panel.layers.push(prop([224, 224], colour)) - 1 // TO DO -- move into state
        $panel = $panel
    },
    addFigure : () => {
        let colour = $state.pallete.shift()
        $state.selected = $panel.layers.push(figure([256, 150], colour)) - 1 // TO DO -- move into state
        $panel = $panel
    },
    selectLayer : (i) => {
        $state.selected = i
        if($panel.layers[i].type != 'prop') {
            $state.tool = 'move'
        }
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
        if(layerIndex != $state.dragging && $state.dragging != 0 && layerIndex != 0) {
            let layer = $panel.layers.splice($state.dragging, 1)[0]
            $panel.layers.splice(layerIndex, 0, layer)
            $state.selected = layerIndex
            $panel = $panel
        }
        $state.over = -1
    }, 
    deleteLayer: () => {
        if($state.selected != 0) {
            let target = $state.selected
            $state.selected = 0
            let deleted = $panel.layers.splice(target, 1)[0]
            $state.pallete.push(deleted.colour)
            $panel = $panel
        }
    },
    changeAspect: () => {
        if($panel.aspect > 3) {
            $panel.aspect = 0
        } else {
            $panel.aspect++
        }
        $panel = $panel
    }
}

</script>
<section>
    <div class="border-b">
        <h1 class="margin-y text-center strong">Layers</h1>
    </div>
    <div class="w-240 flex-row-reverse">
        {#each $panel.layers as layer, layerIndex}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div draggable="true"
                 class="icon-grid border-b {$state.selected == layerIndex ? 'bg-sky' : ''} {$state.over == layerIndex ? 'bg-sky' : ''}"
                 on:dragstart={() => events.dragStart(layerIndex)}
                 on:dragover={(e) => events.dragOver(e, layerIndex)}
                 on:dragleave={events.dragLeave}
                 on:drop={(e) => events.drop(e, layerIndex)}
            >
            {#if $state.selected == layerIndex}
                <div class="icon-grid-icon" style="background-color: {layer.colour};"><img src="/icon-{layer.type}-layer.svg" alt="type: {layer.type} (icon)"/></div>
                <div class="rest">
                    <input bind:value={$panel.layers[layerIndex].description} placeholder="{settings.placeholder}"
                            class="block"
                            on:keyup={events.linkLayerModel}
                    />
                </div>
            {:else}
                <div class="icon-grid-icon" style="background-color: {layer.colour};"><img class="icon-grid-icon" src="/icon-{layer.type}-layer.svg" alt="type: {layer.type} (icon)"/></div>
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
    <div class="margin-y three-grid">
        {#if $panel.layers.length < 6}
            <button class="button" on:click={events.addProp}><img src="/add-prop.svg" alt="add prop icon" /></button>
            <button class="button" on:click={events.addFigure}><img src="/add-figure.svg" alt="add figure icon" /></button>
        {/if}
        <button class="button" on:click={events.deleteLayer}><img src="/trash.svg" alt="trash icon" /></button>
    </div>
    <div class="margin-y one-two-grid border-y">
        <button class="button" on:click={events.changeAspect}><img src="/monitor.svg" alt="trash icon" /></button><p class="tall">{aspectRatios[$panel.aspect].name}</p>
    </div>
</section>

<style>
.border-b {
    border-bottom: 1px solid #BBB;
}

.border-y {
    border-top: 1px solid #BBB;
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
    grid-template-columns: 48px 1fr;
    grid-template-areas: 'icon rest';
    padding: 6px 0;
}

.icon-grid > .icon-grid-icon {
    border-radius: 12px;
    width: 24px;
    margin-left: 12px;
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
    width: 183px;
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

.three-grid {
    display: grid;
    padding: 0 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 12px;
}

.one-two-grid {
    display: grid;
    padding: 12px;
    grid-template-columns: 64px 1fr;
    column-gap: 12px;
}

.tall {
    padding: 11px 0;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 11px;

}

.flex-row-reverse {
    display: flex;
    flex-direction: column-reverse;
}
</style>
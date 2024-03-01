<script>
import { onMount } from 'svelte'

let panel;
let panelStage;

onMount(async () => {
    panel = (await import('$lib/panel.svelte')).default
})

function addFigure() {
    panelStage.addFigure()
}

function scale(by) {
    panelStage.scale(by)
}

function render() {
    panelStage.render()
}
</script>

<h1>Welcome to BoardsBot</h1>

<div class="temp">
    <svelte:component this={panel} bind:konvaCanvas={panelStage} />
</div>

<p><button on:click={addFigure}>Add Figure</button></p>
<p><button on:click={() => scale(0.1)}>+ Scale</button></p>
<p><button on:click={() => scale(-0.1)}>- Scale</button></p>
<p><button on:click={render}> Render</button></p>

<style>
    .temp {
        border: 1px solid #000;
        width: 768px;
    }
</style>
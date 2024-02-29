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

</script>

<h1>Welcome to BoardsBot</h1>

<div class="temp">
    <svelte:component this={panel} bind:konvaCanvas={panelStage} />
</div>

<p><button on:click={addFigure}>Add Figure</button></p>

<style>
    .temp {
        border: 1px solid #000;
        width:512px;
    }
</style>
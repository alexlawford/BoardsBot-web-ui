<script>
import { onMount } from 'svelte'

let panel
let panelStage
let characterInfo

onMount(async () => {
    panel = (await import('$lib/panel.svelte')).default
})

function addFigure() {
    panelStage.addFigure()
}

function addProp() {
    panelStage.addProp()
}

function scale(by) {
    panelStage.scale(by)
}

let mask;

async function render() {
    const {control_image, mask_image} = await panelStage.render()

    const res = await fetch('/api/newimg/', {
            method: 'POST',
            headers: {
                'Accept': '*/*'
            },
            body: JSON.stringify({
                prompt: characterInfo,
                control_image: control_image,
                mask_image: mask_image
            }) 
    })
    const body = await res.json()
    console.log(body)
}
</script>

<h1>Welcome to BoardsBot</h1>

<div class="temp">
    <svelte:component this={panel} bind:konvaCanvas={panelStage} />
</div>

<p><button on:click={addFigure}>Add Figure</button></p>
<p><button on:click={addProp}>Add Prop</button></p>
<p><button on:click={() => scale(0.1)}>+ Scale</button></p>
<p><button on:click={() => scale(-0.1)}>- Scale</button></p>
<p><button on:click={render}> Render</button></p>
<p><input type="text" bind:value={characterInfo} placeholder="describe the character"/></p>

{#if mask}
<p><img src="{mask}" alt="mask"/></p>
{/if}

<style>
    .temp {
        border: 1px solid #000;
        width: 768px;
    }
</style>
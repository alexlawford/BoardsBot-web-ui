<script>
import { onMount } from 'svelte'

let responseText
let requestSent
let taskId
let taskResponse
let imgUrl
let panelCanvas
let panelCanvasStage
let characterInfo

onMount(async () => {
    panelCanvas = (await import('$lib/newPanelCanvas.svelte')).default
})

let last // TEMP
let noFigures = true // TEMP

function addFigure() {
    last = panelCanvasStage.addFigure()
    noFigures = false // TEMP
}

function scaleFigure(by) {
    return panelCanvasStage.scaleFigure(last, by)
}

function checkStatus() {
    console.log('To do')
    // ""/api/newimg?task=" + task
}

async function sendRequest() {
    const img = panelCanvasStage.render()
    const res = await fetch('/api/newimg/', {
            method: 'POST',
            headers: {
                'Accept': '*/*'
            },
            body: JSON.stringify({
                img: img
            }) 
    })
    const body = await res.json()
    console.log(body)
}

</script>

<h1>Welcome to BoardsBot</h1>
{#if requestSent}
    {#if responseText}
        <p>{responseText} <button on:click={checkStatus}>Check task status</button></p>
    {:else}
        <p>Sending request to beams.cloud...</p>
    {/if}
    {#if taskResponse}
        <p>{taskResponse}</p>
    {/if}
{:else}
    <p><button on:click={sendRequest}>Send request</button></p>
{/if}
{#if imgUrl}
    <p><img src="{imgUrl}" alt="The AI generated result"/></p>
{/if}

<div class="temp">
    <svelte:component this={panelCanvas} bind:konvaCanvas={panelCanvasStage} />
</div>
{#if noFigures}
<p><button on:click={addFigure}>Add Figure</button></p>
{/if}
<p><button on:click={() => scaleFigure(0.1)}>Scale +</button></p>
<p><button on:click={() => scaleFigure(-0.1)}>Scale -</button></p>
<p><input type="text" bind:value={characterInfo} placeholder="describe the character"/></p>

<style>
    .temp {
        border: 1px solid #000;
        width:512px;
    }
</style>
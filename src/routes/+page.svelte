<script>
import { onMount } from 'svelte';

let responseText;
let requestSent;
let taskId;
let taskResponse;
let imgUrl;

function sendRequest() {
    requestSent = true;
    let img = panelCanvasStage.render();

    fetch("https://sqwi2.apps.beam.cloud", {
        "method": "POST",
        "headers": {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Authorization": "*********************", // TO DO
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            img: img
        }) 
    })
    .then(response => response.text())
    .then(text => {
        taskId = JSON.parse(text)['task_id'];
        responseText = "Beam.cloud responded with Task ID " + taskId;
    })
    .catch(err => console.error(err));
}

function checkStatus() {
    taskResponse = "Checking...";
    fetch("https://api.beam.cloud/v1/task/" + taskId + "/status/", {
    "method": "GET",
    "headers": {
        "Authorization": "*********************", // TO DO
         "Content-Type": "application/json"
    },
    })
    .then(response => response.text())
    .then(text => {
        let parsedResponse = JSON.parse(text);
        taskResponse = "Status is: " + parsedResponse['status'];
        console.log(text);
        if(parsedResponse['status'] == 'COMPLETE') {
            imgUrl = parsedResponse['outputs']['./output.png']['url'];
        }
    })
    .catch(err => console.error(err));
}

let panelCanvas;
let panelCanvasStage;

onMount(async () => {
    panelCanvas = (await import('$lib/newPanelCanvas.svelte')).default;
})

function addHead() {
    panelCanvasStage.addHead();
}

function addtos() {
    panelCanvasStage.addToS();
}

function addtot() {
    panelCanvasStage.addToT();
}

function takes() {
    panelCanvasStage.takeS();
}

function taket() {
    panelCanvasStage.takeT();
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

<div>
    <svelte:component this={panelCanvas} bind:konvaCanvas={panelCanvasStage} />
</div>
<p><button on:click={addHead}>Add Head</button></p>
<p><button on:click={addtot}>t+</button></p>
<p><button on:click={addtos}>s+</button></p>
<p><button on:click={taket}>t-</button></p>
<p><button on:click={takes}>s-</button></p>

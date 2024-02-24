<script>

let responseText;
let requestSent;
let taskId;
let taskResponse;

function sendRequest() {
    requestSent = true;

    fetch("https://sqwi2.apps.beam.cloud", {
    "method": "POST",
    "headers": {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Authorization": "Basic YjEyMTJjOTI5NGJlZWUyYjY1MmEyYTkxNzVkMmQwNTU6YzFhZGU0YWY5M2YxNjFlNTcyZDM4MGMxMjA4M2JlZjc=",
        "Content-Type": "application/json"
    },
    "body": JSON.stringify({})
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
        "Authorization": "Basic YjEyMTJjOTI5NGJlZWUyYjY1MmEyYTkxNzVkMmQwNTU6YzFhZGU0YWY5M2YxNjFlNTcyZDM4MGMxMjA4M2JlZjc=",
        "Content-Type": "application/json"
    },
    })
    .then(response => response.text())
    .then(text => {
        let status = JSON.parse(test)['status'];
        taskResponse = "Status is: " + status;
    })
    .catch(err => console.error(err));
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
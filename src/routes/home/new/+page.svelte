<script>
import Layers from '$components/layers.svelte';
import Tools from '$components/tools.svelte';
import Modal from '$components/modal.svelte';
import { panel, state } from '$lib/stores/model.js';

import { onMount } from 'svelte'

let panelOb
let panelStage

onMount(async () => {
    panelOb = (await import('$components/panel.svelte')).default
})

const render = async () => {  

    const missingDescriptions = $panel.layers.find((layer) => {
        return layer.description == ''
    })

    if(missingDescriptions != undefined) {
        return $state.modal = "Please give a description for all layers."
    }    

    const missingScribbles = $panel.layers.find((layer) => {
        return layer.type == 'prop' && layer.scribbles.length == 0
    })

    if(missingScribbles != undefined) {
        return $state.modal = "Please make sure you've sketched every prop."
    } 

    const sketch = await panelStage.render()

    const res = await fetch('/api/newimg/', {
        method: 'POST',
        headers: {
            'Accept': '*/*'
        },
        body: JSON.stringify({layers: sketch})
    })
    const body = await res.json()
    console.log(body)
}

</script>

<div class="wrapper">
    <header class="header">
    </header>
    <aside class="left-sidebar"><Tools /></aside>
    <main class="main-content"><svelte:component this={panelOb} bind:konvaCanvas={panelStage} /></main>
    <section class="right-sidebar">
        <Layers />
        <div class="text-center padding-x">
            <button class="button w-full margin-x" on:click={render}>Render</button>
        </div>
    </section>
</div>
<div class="apology">
    <h1>Sorry about this...</h1>
    <p>Currently, BoardsBot is only designed for screens of at least 1024px wide &mdash; either have a go at <strong>resizing your browser window</strong>
        or else you could <strong>try a different device.</strong>
    <p>We are working hard on versions of BoardsBot for all platforms, though, so check back in soon!</p>
</div>
{#if $state.modal}
    <Modal />
{/if}
<style>
.apology {
    max-width: 720px;
    padding: 12px;
    margin: 0 auto;
}
.apology h1, .apology strong {
    font-weight: 700;
}
.apology h1 {
    font-size: 32px;
    line-height: 48px;
    margin: 24px 0;
}
.apology p, .apology strong {
    font-size: 16px;
    color: #333333;
}
.apology p {
    margin-bottom: 24px;
}
.text-center {
    text-align: center;
}
.w-full {
    width: 100%;
}
.padding-x {
    padding-left: 12px;
    padding-right: 12px;
}
.wrapper {
    display: none;
}

.wrapper > .header {
    grid-area:header;
    background-color: #333333;
}

.wrapper > .main-content {
    grid-area:main-content;
    display: grid;
	  place-content: center;
    background-color: #AAAAAA;
    border-bottom: 1px solid #BBB;
}
.wrapper > .left-sidebar {
    grid-area:left-sidebar;
}
.wrapper > .right-sidebar {
    grid-area:right-sidebar;
}

@media (min-width:1023px) {
    .apology {
        display: none;
    }
    .wrapper {
        /* fallback height */
        min-height:100vh;

        /* new small viewport height for modern browsers */
        min-height:100svh;

        display:grid;
        grid-template-columns: 72px 1fr 240px;
        grid-template-rows: 48px 1fr;
        grid-template-areas:
            'header header header'
            'left-sidebar main-content right-sidebar';
    }
    .wrapper > .main-content {
      border-bottom: none;
    }
    .wrapper > .right-sidebar {
        border-left: 1px solid #999;
    }
    .wrapper > .left-sidebar {
        border-right: 1px solid #999;
    }
}
</style>
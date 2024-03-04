<script>
import Layers from '$components/layers.svelte';

import { onMount } from 'svelte'

let panel
let panelStage

onMount(async () => {
    panel = (await import('$components/panel.svelte')).default
})

</script>

<div class="wrapper">
  <header class="header"></header>
  <aside class="left-sidebar"></aside>
  <main class="main-content"><svelte:component this={panel} bind:konvaCanvas={panelStage} /></main>
  <section class="right-sidebar"><Layers /></section>
</div>

<style>
.wrapper {
  display:grid;
  grid-template-rows: 48px 1fr 48px 1fr;
  grid-template-areas:
    'header'
    'main-content'
    'left-sidebar'
    'right-sidebar';
  
  /* fallback height */
  min-height:100vh;

  /* new small viewport height for modern browsers */
  min-height:100svh;
}

.wrapper > .header {
    grid-area:header;
    background-color: #333333;
}
.wrapper > .main-content {
    grid-area:main-content;
    display: grid;
	  place-content: center;
    background-color: #EEEEEE;
    border-bottom: 1px solid #BBB;
}
.wrapper > .left-sidebar {
    grid-area:left-sidebar;
}
.wrapper > .right-sidebar {
    grid-area:right-sidebar;
}

@media (min-width:1024px) {
    .wrapper {
        grid-template-columns: 48px 1fr 240px;
        grid-template-rows: 48px 1fr;
        grid-template-areas:
            'header header header'
            'left-sidebar main-content right-sidebar';
    }
    .wrapper > .main-content {
      border-bottom: none;
    }
    .wrapper > .right-sidebar {
        border-left: 1px solid #BBB;
    }
    .wrapper > .left-sidebar {
        border-right: 1px solid #BBB;
    }
}
</style>
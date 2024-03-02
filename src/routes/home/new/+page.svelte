<script>
import Layers from '$components/layers.svelte';

import { onMount } from 'svelte'

let panel
let panelStage

onMount(async () => {
    panel = (await import('$components/panel.svelte')).default
})

</script>
<div class="h-lvh flex items-center justify-between">
  <div class="w-60">
    <h1 class="text-white">(TOOLS GO HERE)</h1>
  </div>
  <div class="border border-slate-900 aspect-video bg-slate-400">
    <svelte:component this={panel} bind:konvaCanvas={panelStage} />
  </div>
  <div class="p-4">
    <Layers />
  </div>
</div>
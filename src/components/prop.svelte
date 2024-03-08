<script>
    import { Circle, Line, Group } from 'svelte-konva'
    import { state } from '$lib/stores/model.js'

    export let layer

    export let layerIndex

    export let events

    export let rendering

    export let mask

</script>

<!--  - - - - Scribbles/Sketches - - - -  -->
<Group config={{
    clipFunc: (c) => {
        c.beginPath()
        c.moveTo(layer.pos[0] + layer.points[0][0], layer.pos[1] + layer.points[0][1])
        c.lineTo(layer.pos[0] + layer.points[1][0], layer.pos[1] + layer.points[1][1])
        c.lineTo(layer.pos[0] + layer.points[2][0], layer.pos[1] + layer.points[2][1])
        c.lineTo(layer.pos[0] + layer.points[3][0], layer.pos[1] + layer.points[3][1])
        c.closePath()
    }
}}>
    {#each layer.scribbles as scribble, scribbleIndex}
        <Line
            config={{
                stroke: rendering ? '#FFF' : layer.colour,
                strokeWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
                points: scribble,
                x: layer.pos[0],
                y: layer.pos[1],
                visible: ! mask,
            }}
            on:click={
                () => events.clickScribble(layerIndex, scribbleIndex)
            }
        />
    {/each}
</Group>

<!--  - - - - Sketch Borders - - - -  -->
<Line
    config={{
        closed: true,
        stroke: mask ? '#FFF' : layer.colour,
        strokeWidth: mask ? 10 : 2,
        fill: mask ? '#FFF' : 'rgba(255,255,255,0.0)',
        fillEnabled:  $state.tool != 'erase',
        points: layer.points.flat(),
        draggable: $state.selected == layerIndex && $state.tool == 'move',
        x: layer.pos[0],
        y: layer.pos[1],
        tension: 0.05,
        visible: mask || (layerIndex == $state.selected && ! rendering),
        dash: [5, 5],
        dashEnabled: ! mask
    }}
    on:dragmove={
        (e) => events.dragMoveProp(e, layerIndex)
    }
    on:mousedown={
        (e) => events.propMouseDown(e, layerIndex)
    }
    on:mousemove={
        (e) => events.propMouseMove(e, layerIndex)
    }
/>

<!--  - - - - Sketch Border Corner Points - - - -  -->
{#each layer.points as point, pointIndex}
    <Circle
        config={{
            radius: 6,
            fill: '#FFF',
            x: layer.pos[0] + point[0],
            y: layer.pos[1] + point[1],
            stroke: '#38BDF8',
            strokeWidth: 1,
            visible: layerIndex == $state.selected && ! rendering && ! mask,
            draggable: true
        }}
        on:dragmove={
            (e) => events.dragMovePropPoint(e, layerIndex, pointIndex)
        }
    />
{/each}
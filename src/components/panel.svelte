<script>
    import { tick } from 'svelte'
    import { Stage, Layer, Circle, Line, Rect, Group } from 'svelte-konva'
    import { vec } from '$lib/vector.js'
    import { rotateX, rotateY } from '$lib/head.js'
    import { openpose } from '$lib/openpose.js'
    import { panel, state } from '$lib/stores/model.js'
    import { aspectRatios } from '$lib/settings.js'
    import Prop from '$components/prop.svelte'
    import Figure from '$components/figure.svelte'

const events = {
    jointDistances : [],
    previousPosition : false,
    initialHeadPosition : [],
    propPointDistances : [],
    lastLine : false,
    painting : false,
    
    dragStartJoint : (layerIndex, jointIndex) => {        
        events.jointDistances = openpose.relations[jointIndex].map(childIndex => {
            return {
                i: childIndex,
                dist: vec.sub($panel.layers[layerIndex].points[childIndex],
                              $panel.layers[layerIndex].points[jointIndex])
            }
        })
    },
    dragMoveJoint : (e, layerIndex, jointIndex) => {
        let loc = [e.detail.target.x(), e.detail.target.y(), 0]

        $panel.layers[layerIndex].points[jointIndex] = loc

        events.jointDistances.forEach((child) => {
          $panel.layers[layerIndex].points[child.i] = vec.sum(loc, child.dist)
        })
        $panel = $panel
    },
    dragStartHead : (layerIndex) => {
        events.initialHeadPosition = $panel.layers[layerIndex].points[18]
    },
    dragMoveHead : (layerIndex) => {
        $panel.layers[layerIndex].points[18] = events.initialHeadPosition

        let pos = stage.getPointerPosition()
        let speed = 0.05

        if(events.previousPosition) {
            if(pos.x > events.previousPosition.x) {
                rotateY($panel.layers[layerIndex], speed)
            }
            if(pos.x < events.previousPosition.x) {
                rotateY($panel.layers[layerIndex], -1 * speed)
            }
            if(pos.y > events.previousPosition.y) {
                rotateX($panel.layers[layerIndex], -1 * speed)
            }
            if(pos.y < events.previousPosition.y) {
                rotateX($panel.layers[layerIndex], speed)
            }
            $panel = $panel
        }
        events.previousPosition = pos
    },
    dragEndHead : () => {
        events.previousPosition = false
    },
    dragMovePropPoint : (e, propIndex, pointIndex) => {
        $panel.layers[propIndex].points[pointIndex] = vec.sub([e.detail.target.x(), e.detail.target.y()], $panel.layers[propIndex].pos)
        $panel = $panel
    },
    dragMoveProp : (e, propIndex) => {
        $panel.layers[propIndex].pos = [e.detail.target.x(), e.detail.target.y()]
        $panel = $panel
    },
    propMouseDown : (e, propIndex) => {
        if($state.tool == 'draw') {
            const pointer = stage.getPointerPosition()
            const pos = vec.sub([pointer.x, pointer.y], $panel.layers[propIndex].pos)
            events.painting = true
            events.lastLine = $panel.layers[propIndex].scribbles.push(pos) - 1
        }
    },
    propMouseMove : (e, propIndex) => {
        if($state.tool == 'draw' && events.painting) {
            e.preventDefault()
            const pointer = stage.getPointerPosition()
            const pos = vec.sub([pointer.x, pointer.y], $panel.layers[propIndex].pos)
            const lastLine = $panel.layers[propIndex].scribbles[events.lastLine]
            $panel.layers[propIndex].scribbles[events.lastLine] = [...pos, ...lastLine]
        }
    },
    stageMouseUp : () => {
        events.painting = false
    },
    clickScribble : (layerIndex, scribbleIndex) => {
        console.log(scribbleIndex)
        if($state.tool == 'erase' && $state.selected == layerIndex) {
            $panel.layers[layerIndex].scribbles.splice(scribbleIndex, 1)
            $panel = $panel
        }
    }
}

let stage

let mask = false

let rendering = false

let renderLayer = -1

export const konvaCanvas = {
    render: async () => {

        let sketch = []
        let controlImage
        let maskImage

        rendering = true

        for(renderLayer = 1; renderLayer < $panel.layers.length; renderLayer++) {
            await tick()
            controlImage = stage.toDataURL({pixelRatio: 1})
            mask = true
            await tick()
            maskImage = stage.toDataURL({pixelRatio: 1})
            mask = false
            sketch.push({
                control: controlImage,
                mask: maskImage,
                prompt: $panel.layers[renderLayer].description,
                type: $panel.layers[renderLayer].type
            })
        }

        rendering = false

        return sketch
    }
}
</script>
<div class="border">
    <Stage config={{width: 512, height: 512}} bind:handle={stage} on:mouseup={events.stageMouseUp}>
        <Layer>
            <Group config={{
                clip: {
                    x: 0,
                    y: rendering || mask ? 512 : (512 - aspectRatios[$panel.aspect].height) / 2,
                    width: 512,
                    height: rendering || mask ? 512 : aspectRatios[$panel.aspect].height
                }
            }}>
                <Group>
                    <Rect
                        config={{
                            x: 0,
                            y: 0,
                            width: 512,
                            height: 512,
                            fill: rendering ? '#000' : '#FFF',
                        }}
                    />
                </Group>
                {#each $panel.layers as layer, layerIndex}
                    <Group 
                        config={{
                            visible: ! rendering || renderLayer == layerIndex
                        }}
                    >
                        {#if layer.type == 'figure'}
                            <Figure
                                layer={layer}
                                layerIndex={layerIndex}
                                events={events}
                                rendering={rendering}
                                mask={mask}
                            />
                        {:else if layer.type == 'prop'}
                            <Prop 
                                layer={layer}
                                layerIndex={layerIndex}
                                events={events}
                                rendering={rendering}
                                mask={mask}
                            />
                        {/if}
                    </Group>
                {/each}
            </Group>
        </Layer>
    </Stage>
</div>

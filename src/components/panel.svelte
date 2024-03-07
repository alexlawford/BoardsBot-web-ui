<script>
    import { tick } from 'svelte'
    import { Stage, Layer, Circle, Line, Rect } from 'svelte-konva'
    import { vec } from '$lib/vector.js'
    import { openpose } from '$lib/openpose.js'
    import { panel, state } from '$lib/stores/model.js'

const update = {
   rotateX : (f, theta) => {
        $panel.layers[f].headRotation[1] += theta

        let was = $panel.layers[f].headRotation[0]

        update.rotateY(f, -1 * was)

        for(let j of [0, 14, 15, 16, 17]) {             
            $panel.layers[f].points[j] = vec.sum(
                vec.rotate(
                    'x',
                    vec.sub($panel.layers[f].points[j], $panel.layers[f].points[18]),
                    theta
                ),
                $panel.layers[f].points[18]
            )
        }
        update.rotateY(f, was)
    },
    rotateY : (f, theta) => {                     
        $panel.layers[f].headRotation[0] += theta

        for(let j of [0, 14, 15, 16, 17]) {
            $panel.layers[f].points[j] = vec.sum(
                vec.rotate(
                    'y',
                    vec.sub($panel.layers[f].points[j], $panel.layers[f].points[18]),
                    theta
                ),
                $panel.layers[f].points[18]
            )
        }
        $panel = $panel
    }
}

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
        let speed = 0.03

        if(events.previousPosition) {
            if(pos.x > events.previousPosition.x) {
                update.rotateY(layerIndex, speed)
            }
            if(pos.x < events.previousPosition.x) {
                update.rotateY(layerIndex, -1 * speed)
            }
            if(pos.y > events.previousPosition.y) {
                update.rotateX(layerIndex, -1 * speed)
            }
            if(pos.y < events.previousPosition.y) {
                update.rotateX(layerIndex, speed)
            }
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
                prompt: $panel.layers[renderLayer].description
            })
        }

        rendering = false

        return sketch
    }
}
</script>
<div class="border bg-white">
    <Stage config={{width: 512, height: 512}} bind:handle={stage} on:mouseup={events.stageMouseUp}>
        <Layer>
            <Rect
                config={{
                    x: 0,
                    y: 0,
                    width: 512,
                    height: 512,
                    fill: '#000',
                    visible: rendering
                }}
            />
        </Layer>
        {#each $panel.layers as layer, layerIndex}
        <Layer 
            config={{
                visible: ! rendering || renderLayer == layerIndex
            }}
        >
            {#if layer.type == 'figure'}
                <!--  - - - - HEAD - - - -  -->
                <Circle
                    config={{
                        x: layer.points[18][0],
                        y: layer.points[18][1],
                        fill: mask ? '#FFF' : layer.colour,
                        radius: mask ? layer.scale * 40 : layer.scale * 25,
                        draggable: true, 
                        visible: mask || ! rendering
                    }}
                    on:dragstart={
                        () => events.dragStartHead(layerIndex)
                    }
                    on:dragmove={
                        () => events.dragMoveHead(layerIndex)
                    }
                    on:dragend={events.dragEndHead}
                />
                <!--  - - - - Arms & Shoulders (Drawing + Mask) - - - -  -->
                <Line 
                    config={{
                        points: [
                                    layer.points[4][0],
                                    layer.points[4][1],
                                    layer.points[3][0],
                                    layer.points[3][1],
                                    layer.points[2][0],
                                    layer.points[2][1],
                                    layer.points[1][0],
                                    layer.points[1][1],
                                    layer.points[5][0],
                                    layer.points[5][1],
                                    layer.points[6][0],
                                    layer.points[6][1],
                                    layer.points[7][0],
                                    layer.points[7][1],
                        ],
                        stroke: mask ? '#FFF' : layer.colour,
                        strokeWidth: mask ? 40 * layer.scale : 24 * layer.scale,
                        lineCap: 'round',
                        lineJoin: 'round',
                        tension: 0.3,
                        visible: ! rendering || rendering && mask
                    }}
                />
                <!--  - - - - Right Leg (Drawing + Mask) - - - -  -->
                <Line 
                    config={{
                        points: [
                                layer.points[8][0],
                                layer.points[8][1],
                                layer.points[9][0],
                                layer.points[9][1],
                                layer.points[10][0],
                                layer.points[10][1],
                        ],
                        stroke: mask ? '#FFF' : layer.colour,
                        strokeWidth: mask ? 40 * layer.scale : 24 * layer.scale,
                        lineCap: 'round',
                        lineJoin: 'round',
                        tension: 0.3,
                        visible: ! rendering || rendering && mask
                    }}
                />
                <!--  - - - - Left Leg (Drawing + Mask) - - - -  -->
                <Line 
                    config={{
                        points: [
                                layer.points[11][0],
                                layer.points[11][1],
                                layer.points[12][0],
                                layer.points[12][1],
                                layer.points[13][0],
                                layer.points[13][1],
                        ],
                        stroke: mask ? '#FFF' : layer.colour,
                        strokeWidth: mask ? 40 * layer.scale : 24 * layer.scale,
                        lineCap: 'round',
                        lineJoin: 'round',
                        tension: 0.3,
                        visible: ! rendering || rendering && mask
                    }}
                />
                <!--  - - - - Body (Drawing + Mask) - - - -  -->
                <Line 
                    config={{
                        points: [
                                layer.points[2][0],
                                layer.points[2][1],
                                layer.points[5][0],
                                layer.points[5][1],
                                layer.points[11][0],
                                layer.points[11][1],
                                layer.points[8][0],
                                layer.points[8][1],
                        ],
                        stroke: mask ? '#FFF' : layer.colour,
                        strokeWidth: mask ? 40 * layer.scale : 24 * layer.scale,
                        lineCap: 'round',
                        lineJoin: 'round',
                        tension: 0,
                        fill: mask ? '#FFF' : layer.colour,
                        visible: ! rendering || rendering && mask,
                        closed: true
                    }}
                />
                <!--  - - - - Bones - - - -  -->
                {#each openpose.bones as b, boneIndex}
                    <Line 
                        config={{ 
                            points: [layer.points[b[0]][0], layer.points[b[0]][1], layer.points[b[1]][0], layer.points[b[1]][1]],
                            stroke: openpose.colours.bones[boneIndex], 
                            strokeWidth: 6,
                            lineCap: 'round', 
                            visible: rendering && ! mask
                        }}
                    />
                {/each}
                <!--  - - - - Joints - - - -  -->
                {#each layer.points as joint, jointIndex}
                    <Circle
                        config={{
                            x: joint[0],
                            y: joint[1],
                            radius: ([14, 15].includes(jointIndex) && ! rendering) ? 2 * layer.scale: 4,
                            fill: rendering ? openpose.colours.joints[jointIndex] : '#FFF',
                            stroke: '#38BDF8',
                            strokeWidth: rendering || [14, 15].includes(jointIndex) ? 0 : 1,
                            draggable: ! [0, 14, 15, 16, 17].includes(jointIndex),
                            visible: ! mask && (rendering || (layerIndex == $state.selected && ! [0, 16, 17].includes(jointIndex)) || [14, 15].includes(jointIndex))
                        }}
                        on:dragstart={
                            () => events.dragStartJoint(layerIndex, jointIndex)
                        }
                        on:dragmove={
                            (e) => events.dragMoveJoint(e, layerIndex, jointIndex)
                        }
                    />
                {/each}
            {:else if layer.type == 'prop'}
                {#each layer.scribbles as scribble}
                    <!--  - - - - Scribbles/Sketches - - - -  -->
                    <Line
                        config={{
                            stroke: rendering ? '#FFF' : layer.colour,
                            strokeWidth: 4,
                            lineCap: 'round',
                            lineJoin: 'round',
                            points: scribble,
                            x: layer.pos[0],
                            y: layer.pos[1],
                            visible: ! mask
                        }}
                    />
                {/each}
                <!--  - - - - Sketch Borders - - - -  -->
                <Line
                    config={{
                        closed: true,
                        stroke: mask ? '#FFF' : layer.colour,
                        strokeWidth: mask ? 10 : 2,
                        fill: mask ? '#FFF' : 'rgba(255,255,255,0.0)',
                        points: layer.points.flat(),
                        draggable: $state.selected == layerIndex && $state.tool != 'draw',
                        x: layer.pos[0],
                        y: layer.pos[1],
                        tension: 0.05,
                        visible: mask || (layerIndex == $state.selected && ! rendering),
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
                            radius: 5,
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
            {/if}
        </Layer>
        {/each}
    </Stage>
</div>

<style>
.border {
    border: 1px solid #BBB;
}

.bg-white {
    background-color: #FFF;
}
</style>
<script>
    import { Circle, Line } from 'svelte-konva'
    import { state } from '$lib/stores/model.js'
    import { openpose } from '$lib/openpose.js'

    export let layer

    export let layerIndex

    export let events

    export let rendering

    export let mask

</script>
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
     fill: mask ? '#FFF' : (layer.points[2][0] < layer.points[5][0] ? layer.colour: '#000'),
     visible: ! rendering || rendering && mask,
     closed: true,
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
         radius: ([14, 15].includes(jointIndex) && ! rendering) ? 3 * layer.scale: 6,
         fill: rendering ? openpose.colours.joints[jointIndex] : '#FFF',
         stroke: [14, 15].includes(jointIndex) ? '#000' : '#38BDF8',
         strokeWidth: rendering ? 0 : 1,
         opacity: rendering || ([14, 15].includes(jointIndex) &&  joint[2] > 0) ? 1.0 : 0.75,
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
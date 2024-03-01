<script>
import { tick } from 'svelte'
import { Stage, Layer, Circle, Line, Rect } from 'svelte-konva'
import { vec } from '$lib/vector.js'
import { openpose } from '$lib/openpose.js'

// Structures
const prop = () => {
    return {
        points: [[0, 0], [64, 0], [64, 64], [0, 64]], 
        pos: [0, 0]
    }
}

const figure = () => {
    return {
        joints: [
            [0, -27, 27],      // 0 Nose
            [0, 0, 0],         // 1 Neck
            [-34, 3, 0],       // 2 Right Shoulder
            [-65, 58, 0],      // 3 Right Elbow
            [-105, 93, 0],     // 4 Right Wrist
            [34, 3, 0],        // 5 Left Shoulder
            [65, 58, 0],       // 6 Left Elbow
            [105, 93, 0],      // 7 Left Wrist
            [-18, 98, 0],      // 8 Right Hip
            [-20, 203, 0],     // 9 Right Knee
            [-22, 300, 0],     // 10 Right Ankle
            [18, 98, 0],       // 11 Left Hip
            [20, 203, 0],      // 12 Left Knee
            [22, 300, 0],      // 13 Left Ankle
            [-11, -38, 26],    // 14 Right Eye
            [11, -38, 26],     // 15 Left Eye
            [-26, -35, 10],    // 16 Right Ear
            [26, -35, 10],     // 17 Left Ear
            [0, -38, 0]        // -- Additional -- Head Positioning
        ],
        headRotation: [0, 0],
        scale: 1
    }
}

// Model
let model = {
    figures : [],
    props: []
}

// Update
const update = {
    addProp : () => {
        let p = prop()
        // positioning on canvas
        p.pos = [320, 184]
        model.props.push(p)
        model = model
    },
    addFigure : () => {
        let f = figure()
        // positioning on canvas
        f.joints = f.joints.map(j => vec.sum(j, [384, 100]))
        model.figures.push(f)
        model = model
    },
    rotateX : (f, theta) => {
        model.figures[f].headRotation[1] += theta

        let was = model.figures[f].headRotation[0]

        update.rotateY(f, -1 * was)

        for(let j of [0, 14, 15, 16, 17]) {             
            model.figures[f].joints[j] = vec.sum(
                vec.rotate(
                    'x',
                    vec.sub(model.figures[f].joints[j], model.figures[f].joints[18]),
                    theta
                ),
                model.figures[f].joints[18]
            )
        }

        update.rotateY(f, was)
    },
    rotateY : (f, theta) => {                     
        model.figures[f].headRotation[0] += theta

        for(let j of [0, 14, 15, 16, 17]) {
            model.figures[f].joints[j] = vec.sum(
                vec.rotate(
                    'y',
                    vec.sub(model.figures[f].joints[j], model.figures[f].joints[18]),
                    theta
                ),
                model.figures[f].joints[18]
            )
        }
    },
    // TO DO *** !!!
    // TO DO -- selecting which figure
    // TO DO *** !!!
    scale : (factor, figureIndex = 0) => {
        let origin = model.figures[figureIndex].joints[1]

        model.figures[figureIndex].joints.forEach((j, index) => {
            if(j != 1) {
                let distance = vec.sub(j, origin)
                model.figures[figureIndex].joints[index] = vec.sum(j, vec.mult(distance, [factor, factor, factor]))
            }
        })

        model.figures[figureIndex].scale *= 1 + factor
    }
}

// Events
const evs = {
    jointDistances : [],
    previousPosition : false,
    initialHeadPosition : [],
    propPointDistances : [],

    dragStartJoint : (figureIndex, jointIndex) => {
        evs.jointDistances = openpose.relations[jointIndex].map(childIndex => {
            return {
                i: childIndex,
                dist: vec.sub(model.figures[figureIndex].joints[childIndex],
                              model.figures[figureIndex].joints[jointIndex])
            }
        })
    },
    dragMoveJoint : (e, figureIndex, jointIndex) => {
        let loc = [e.detail.target.x(), e.detail.target.y(), 0]

        model.figures[figureIndex].joints[jointIndex] = loc

        evs.jointDistances.forEach((child) => {
          model.figures[figureIndex].joints[child.i] = vec.sum(loc, child.dist)
        })
    },
    dragStartHead : (figureIndex) => {
        evs.initialHeadPosition = model.figures[figureIndex].joints[18]
    },
    dragMoveHead : (figureIndex) => {
        model.figures[figureIndex].joints[18] = evs.initialHeadPosition

        let pos = stage.getPointerPosition()
        let speed = 0.03

        if(evs.previousPosition) {
            if(pos.x > evs.previousPosition.x) {
                update.rotateY(figureIndex, speed)
            }
            if(pos.x < evs.previousPosition.x) {
                update.rotateY(figureIndex, -1 * speed)
            }
            if(pos.y > evs.previousPosition.y) {
                update.rotateX(figureIndex, -1 * speed)
            }
            if(pos.y < evs.previousPosition.y) {
                update.rotateX(figureIndex, speed)
            }
        }
        evs.previousPosition = pos
    },
    dragEndHead : () => {
        evs.previousPosition = false
    },
    dragMovePropPoint : (e, propIndex, pointIndex) => {
        model.props[propIndex].points[pointIndex] = vec.sub([e.detail.target.x(), e.detail.target.y()], model.props[propIndex].pos)
    },
    dragMoveProp : (e, propIndex) => {
        model.props[propIndex].pos = [e.detail.target.x(), e.detail.target.y()]
    }
}

// Export
let stage

let mask = false

let rendering = false

export const konvaCanvas = {
    addFigure: () => {
        update.addFigure()
    },
    addProp: () => {
        update.addProp()
    },
    scale: (by) => {
        update.scale(by)
    },
    render: async () => {
        rendering = true
        await tick()
        const control_image = stage.toDataURL({
            pixelRatio: 1
        })
        mask = true
        await tick()
        const mask_image = stage.toDataURL({
            pixelRatio: 1
        })
        rendering = false
        mask = false
        return {
            control_image: control_image,
            mask_image: mask_image
        }
    }
}
</script>
<Stage config={{width: 768, height: 432}} bind:handle={stage}>
    <Layer>
        <Rect
            config={{
                x: 0,
                y: 0,
                width: 768,
                height: 432,
                fill: '#000',
                visible: rendering
            }}
        />
    </Layer>
    <Layer>
        {#each model.figures as figure, figureIndex}
            <Circle
                config={{
                    x: figure.joints[18][0],
                    y: figure.joints[18][1],
                    stroke: '#000000',
                    fill: '#FFFFFF',
                    strokeWidth: 3,
                    radius: mask ? figure.scale * 40 : figure.scale * 28,
                    draggable: true, 
                    visible: mask || ! rendering
                }}
                on:dragstart={
                    () => evs.dragStartHead(figureIndex)
                }
                on:dragmove={
                    () => evs.dragMoveHead(figureIndex)
                }
                on:dragend={evs.dragEndHead}
            />
            {#each openpose.bones as b, boneIndex}
                <Line 
                    config={{ 
                        points: [figure.joints[b[0]][0], figure.joints[b[0]][1], figure.joints[b[1]][0], figure.joints[b[1]][1]],
                        stroke: mask ? '#fff' : rendering ? openpose.colours.bones[boneIndex] : "#000", 
                        strokeWidth: mask ? figure.scale * 40 : 4,
                        lineCap: 'round'
                    }}
                />
            {/each}
            {#each figure.joints as joint, jointIndex}
                <Circle
                    config={{
                        x: joint[0],
                        y: joint[1],
                        radius: 4,
                        fill: rendering ? openpose.colours.joints[jointIndex] : '#000',
                        draggable: ! [0, 14, 15, 16, 17].includes(jointIndex),
                        visible: ! mask
                    }}
                    on:dragstart={
                        () => evs.dragStartJoint(figureIndex, jointIndex)
                    }
                    on:dragmove={
                        (e) => evs.dragMoveJoint(e, figureIndex, jointIndex)
                    }
                />
            {/each}
        {/each}
    </Layer>
    <Layer>
        {#each model.props as prop, propIndex}
            <Line
                config={{
                    closed: true,
                    fill: '#ddd',
                    stroke: '#000',
                    strokeWidth: 4,
                    points: prop.points.flat(),
                    draggable: true,
                    x: prop.pos[0],
                    y: prop.pos[1]
                }}
                on:dragmove={
                    (e) => evs.dragMoveProp(e, propIndex)
                }
            />
            {#each prop.points as point, pointIndex}
                <Circle
                    config={{
                        radius: 8,
                        fill: '#000',
                        x: prop.pos[0] + point[0],
                        y: prop.pos[1] + point[1],
                        draggable: true
                    }}
                    on:dragmove={
                        (e) => evs.dragMovePropPoint(e, propIndex, pointIndex)
                    }
                />
            {/each}
        {/each}
    </Layer>
</Stage>


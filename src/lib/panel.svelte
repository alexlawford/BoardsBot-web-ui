<script>
import { Stage, Layer, Circle, Line, Rect } from 'svelte-konva'
    import { scale } from 'svelte/transition';

// Structures
const figure = () => {
    return {
        joints: [
            [0, -27, 27],   // 0 Nose
            [0, 0],         // 1 Neck
            [-34, 3],       // 2 Right Shoulder
            [-65, 58],      // 3 Right Elbow
            [-105, 93],     // 4 Right Wrist
            [34, 3],        // 5 Left Shoulder
            [65, 58],       // 6 Left Elbow
            [105, 93],      // 7 Left Wrist
            [-18, 98],      // 8 Right Hip
            [-20, 203],     // 9 Right Knee
            [-22, 300],     // 10 Right Ankle
            [18, 98],       // 11 Left Hip
            [20, 203],      // 12 Left Knee
            [22, 300],      // 13 Left Ankle
            [-11, -38, 26], // 14 Right Eye
            [11, -38, 26],  // 15 Left Eye
            [-26, -35, 10], // 16 Right Ear
            [26, -35, 10],  // 17 Left Ear
            [0, -38]        // -- Additional -- Head Positioning
        ],
        head_rotation: [0, 0],
        scale: 1
    }
}

const relations = [
    [],                  // 0
    [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // 1
    [3, 4],              // 2
    [4],                 // 3
    [],                  // 4
    [6, 7],              // 5
    [7],                 // 6
    [],                  // 7
    [9, 10],             // 8
    [10],                // 9
    [],                  // 10
    [12, 13],            // 11
    [13],                // 12
    [],                  // 13
    [],                  // 14
    [],                  // 15
    [],                  // 16
    [],                  // 17
    [0, 14, 15, 16, 17]  // -- Additional -- Head Positioning
]

const bones = [
    [1, 2],     // Right Shoulderblade
    [1, 5],     // Left Shoulderblade
    [2, 3],     // Right Arm
    [3, 4],     // Right Forearm
    [5, 6],     // Left Arm
    [6, 7],     // Left Forearm
    [1, 8],     // Right Torso
    [8, 9],     // Right Upper Leg
    [9, 10],    // Right Lower Leg
    [1, 11],    // Left Torso
    [11, 12],   // Left Upper Leg
    [12, 13],   // Left Lower Leg
    [1, 0],     // Head
    [0, 14],    // Right Eyebrow
    [14, 16],   // Right Ear
    [0, 15],    // Left Eyebrow
    [15, 17]    // Left Ear
]

// Model
let model = {
    figures : []
}

// Update
function rotateX (point, theta) {
    return [
        point[0],
        point[1] * Math.cos(theta) - point[2] * Math.sin(theta),
        point[2] * Math.cos(theta) + point[1] * Math.sin(theta)
    ]
}

function rotateY (point, theta) {
    return [
        point[0] * Math.cos(theta) + point[2] * Math.sin(theta),
        point[1],
        point[2] * Math.cos(theta) - point[0] * Math.sin(theta)
    ]
}

const vec2 = {
    sum : (a, b) => {
        return [
            a[0] + b[0],
            a[1] + b[1],
            a[2]
        ]
    },
    sub : (a, b) => {
        return [
            a[0] - b[0],
            a[1] - b[1],
            a[2]
        ]
    }
}
const update = {
    addfigure : () => {
        let f = figure()
        // positioning on canvas
        f.joints = f.joints.map(j => vec2.sum(j, [384, 100]))
        model.figures.push(f)
        model = model
    },
    rotate_x : (f, theta) => {
        model.figures[f].head_rotation[1] += theta

        let was = model.figures[f].head_rotation[0]

        update.rotate_y(f, -1 * was)

        for(let j of [0, 14, 15, 16, 17]) {             
            model.figures[f].joints[j] = vec2.sum(
                rotateX(
                    vec2.sub(model.figures[f].joints[j], model.figures[f].joints[18]),
                    theta
                ),
                model.figures[f].joints[18]
            )
        }

        update.rotate_y(f, was)
    },
    rotate_y : (f, theta) => {                     
        model.figures[f].head_rotation[0] += theta

        for(let j of [0, 14, 15, 16, 17]) {
            model.figures[f].joints[j] = vec2.sum(
                rotateY(
                    vec2.sub(model.figures[f].joints[j], model.figures[f].joints[18]),
                    theta
                ),
                model.figures[f].joints[18]
            )
        }
    },
    // TO DO *** !!!
    // TO DO -- selecting which figure
    // TO DO *** !!!
    scale : (factor, figure_index = 0) => {
       
        let ox = model.figures[figure_index].joints[1][0]
        let oy = model.figures[figure_index].joints[1][1]

        model.figures[figure_index].joints.forEach((j, index) => {
            if(j != 1) {
                let x = j[0]
                let y = j[1]
                let dx = x - ox 
                let dy = y - oy
                model.figures[figure_index].joints[index][0] = x + (dx * factor)
                model.figures[figure_index].joints[index][1] = y + (dy * factor)
            }
        })

        model.figures[figure_index].scale *= 1 + factor
    }
}

// Events
let dists;

const evs = {
    dists : [],
    dragstart : (figure_index, joint_index) => {

        const children = relations[joint_index]
        let x = model.figures[figure_index].joints[joint_index][0]
        let y = model.figures[figure_index].joints[joint_index][1]
        evs.dists = []

        children.forEach((child_index) => {
            evs.dists.push({
                i : child_index,
                x_dist : model.figures[figure_index].joints[child_index][0] - x,
                y_dist : model.figures[figure_index].joints[child_index][1] - y
            })
        })
    },
    dragmove : (e, figure_index, joint_index) => {

        let x = e.detail.target.x()
        let y = e.detail.target.y()

        model.figures[figure_index].joints[joint_index][0] = x
        model.figures[figure_index].joints[joint_index][1] = y

         evs.dists.forEach((child) => {
             model.figures[figure_index].joints[child.i][0] = x + child.x_dist
             model.figures[figure_index].joints[child.i][1] = y + child.y_dist
         })
    },
    was_pos : false,
    init_head_pos : [],
    draghead_start : (figure_index) => {
        evs.init_head_pos = model.figures[figure_index].joints[18]
    },
    draghead : (figure_index) => {
        model.figures[figure_index].joints[18] = evs.init_head_pos

        let pos = stage.getPointerPosition()
        let speed = 0.03

        if(evs.was_pos) {
            if(pos.x > evs.was_pos.x) {
                update.rotate_y(figure_index, speed)
            }
            if(pos.x < evs.was_pos.x) {
                update.rotate_y(figure_index, -1 * speed)
            }
            if(pos.y > evs.was_pos.y) {
                update.rotate_x(figure_index, -1 * speed)
            }
            if(pos.y < evs.was_pos.y) {
                update.rotate_x(figure_index, speed)
            }
        }

        evs.was_pos = pos
    },
    draghead_end : () => {
        evs.was_pos = false
    }
}

// Export
let stage
 
let colours = {
    joints: [
        '#FF0000',
        '#FF5500',
        '#FFAA00',
        '#FFFF00',
        '#AAFF00',
        '#55FF00',
        '#00FF00',
        '#00FF55',
        '#00FFAA',
        '#00FFFF',
        '#00AAFF',
        '#0055FF',
        '#0000FF',
        '#5500FF',
        '#AA00FF',
        '#FF00FF',
        '#FF00AA',
        '#FF0055'
    ],
    bones: [
        '#990000',
        '#993300',
        '#996600',
        '#999900',
        '#669900',
        '#339900',
        '#009900',
        '#009933',
        '#009966',
        '#009999',
        '#006699',
        '#003399',
        '#000099',
        '#330099',
        '#660099',
        '#990099',
        '#990066'
    ]
}

let mask = false

let rendering = false

export const konvaCanvas = {
    addFigure: () => {
        update.addfigure()
    },
    scale: (by) => {
        update.scale(by)
    },
    render: () => {
        rendering = true
   //   mask = true
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
        {#each model.figures as figure, figure_index}
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
                    () => evs.draghead_start(figure_index)
                }
                on:dragmove={
                    () => evs.draghead(figure_index)
                }
                on:dragend={evs.draghead_end}
            />
            {#each bones as b, b_index}
                <Line 
                    config={{ 
                        points: [figure.joints[b[0]][0], figure.joints[b[0]][1], figure.joints[b[1]][0], figure.joints[b[1]][1]],
                        stroke: mask ? '#fff' : rendering ? colours.bones[b_index] : "#000", 
                        strokeWidth: mask ? figure.scale * 40 : 4,
                        lineCap: 'round'
                    }}
                />
            {/each}
            {#each figure.joints as joint, joint_index}
                <Circle
                    config={{
                        x: joint[0],
                        y: joint[1],
                        radius: 4,
                        fill: rendering ? colours.joints[joint_index] : '#000',
                        draggable: ! [0, 14, 15, 16, 17].includes(joint_index),
                        visible: ! mask
                    }}
                    on:dragstart={
                        () => evs.dragstart(figure_index, joint_index)
                    }
                    on:dragmove={
                        (e) => evs.dragmove(e, figure_index, joint_index)
                    }
                />
            {/each}
        {/each}
    </Layer>
</Stage>


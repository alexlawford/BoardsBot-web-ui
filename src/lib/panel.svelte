<script>
import { Stage, Layer, Circle, Line } from 'svelte-konva'

// Structures
const figure = () => {
    return {
        joints: [
            [0, -27, 27],   // 0 Nose
            [0, 0],         // 1 Neck
            [-30, 3],       // 2 Right Shoulder
            [-65, 58],      // 3 Right Elbow
            [-105, 93],     // 4 Right Wrist
            [30, 3],        // 5 Left Shoulder
            [65, 58],       // 6 Left Elbow
            [105, 93],      // 7 Left Wrist
            [-18, 98],      // 8 Right Hip
            [-20, 193],     // 9 Right Knee
            [-22, 288],     // 10 Right Ankle
            [18, 98],       // 11 Left Hip
            [20, 193],      // 12 Left Knee
            [22, 288],      // 13 Left Ankle
            [-11, -38, 26], // 14 Right Eye
            [11, -38, 26],  // 15 Left Eye
            [-26, -35, 10], // 16 Right Ear
            [26, -35, 10],  // 17 Left Ear
            [0, -38]        // -- Additional -- Head Positioning
        ],
        head_rotation: [0, 0]
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
    [16],                // 14
    [17],                // 15
    [],                  // 16
    [],                  // 17
    [0, 14, 15, 16, 17] // -- Additional -- Head Positioning
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

const update = (message, args = {}) => {

    const methods = {
        addfigure : () => {
            model.figures.push(figure())
            return model
        },
        rotate_x : ({figure_index, theta}) => {
            let ox = model.figures[figure_index].joints[18][0]
            let oy = model.figures[figure_index].joints[18][1]

            let was = model.figures[figure_index].head_rotation[0]
            model.figures[figure_index].head_rotation[1] += theta

            methods.rotate_y({figure_index: figure_index, theta: -1 * was})

            for(let j of [0, 14, 15, 16, 17]) {                
                model.figures[figure_index].joints[j][0] -= ox
                model.figures[figure_index].joints[j][1] -= oy
                model.figures[figure_index].joints[j] = rotateX(model.figures[figure_index].joints[j], theta)
                model.figures[figure_index].joints[j][0] += ox
                model.figures[figure_index].joints[j][1] += oy
            }

            return methods.rotate_y({figure_index: figure_index, theta: was})
        },
        rotate_y : ({figure_index, theta}) => {                     
            model.figures[figure_index].head_rotation[0] += theta

            let ox = model.figures[figure_index].joints[18][0]
            let oy = model.figures[figure_index].joints[18][1]

            for(let j of [0, 14, 15, 16, 17]) {
                model.figures[figure_index].joints[j][0] -= ox
                model.figures[figure_index].joints[j][1] -= oy
                model.figures[figure_index].joints[j] = rotateY(model.figures[figure_index].joints[j], theta)
                model.figures[figure_index].joints[j][0] += ox
                model.figures[figure_index].joints[j][1] += oy
            }
            return model
        }, 
    }

    if(message in methods) {
        model = methods[message](args)
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
                update('rotate_y', {figure_index: figure_index, theta: speed})
            }
            if(pos.x < evs.was_pos.x) {
                update('rotate_y', {figure_index: figure_index, theta: -1 * speed})
            }
            if(pos.y > evs.was_pos.y) {
                update('rotate_x', {figure_index: figure_index, theta: -1 * speed})
            }
            if(pos.y < evs.was_pos.y) {
                update('rotate_x', {figure_index: figure_index, theta: speed})
            }
        }

        evs.was_pos = pos
    },
    draghead_end : () => {
        evs.was_pos = false
    }
}

// Export
let stage;

export const konvaCanvas = {
    addFigure: () => {
        update('addfigure')
    }
}

</script>
<Stage config={{width: 512, height: 512}} bind:handle={stage}>
    <Layer>
    </Layer>
    <Layer>
    </Layer>
    <Layer>
        {#each model.figures as figure, figure_index}
            <Circle
                config={{
                    x: figure.joints[18][0],
                    y: figure.joints[18][1],
                    stroke: "#000",
                    strokeWidth: 3,
                    radius: 28, // TO DO
                    draggable: true
                }}
                on:dragstart={
                    () => evs.draghead_start(figure_index)
                }
                on:dragmove={
                    () => evs.draghead(figure_index)
                }
                on:dragend={evs.draghead_end}
            />
            {#each bones as b}
                <Line 
                    config={{ // 
                        points: [figure.joints[b[0]][0], figure.joints[b[0]][1], figure.joints[b[1]][0], figure.joints[b[1]][1]],
                        stroke: "#000", 
                        strokeWidth: 3
                    }}
                />
            {/each}
            {#each figure.joints as joint, joint_index}
                <Circle
                    config={{
                        x: joint[0],
                        y: joint[1],
                        radius: 4,
                        fill: '#000',
                        draggable: ! [0, 13, 14, 15, 16, 17].includes(joint_index),
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


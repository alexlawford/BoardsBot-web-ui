<script>
import { Stage, Layer } from 'svelte-konva'
import Node from "$lib/node.svelte";

// Structures
const figure = () => {
    return {
        id: 'neck',
        loc: [0, 0, 0],
        children: [
            {
                id: 'nose',
                loc: [0, -27, 26],
                children: [
                    {
                        id: 'r_eye',
                        loc: [-11, -38, 26],   
                        children: [
                            {
                                id: 'r_ear',
                                loc: [-26, -42, 10], 
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'l_eye',
                        loc: [11, -38, 26], 
                        children: [
                            {
                                id: 'l_ear',
                                loc: [26, -42, 10],
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 'r_shoulder',
                loc: [-30, 3, 0],
                children: [
                    {
                        id: 'r_elbow',
                        loc: [-65, 58, 0],
                        children: [
                            {
                                id: 'r_wrist',
                                loc: [-105, 93, 0],
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 'l_shoulder',
                loc: [30, 3, 0],
                children: [
                    {
                        id: 'l_elbow',
                        loc: [65, 58, 0],
                        children: [
                            {
                                id: 'l_wrist',
                                loc: [105, 93, 0],
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 'r_hip',
                loc: [-18, 98, 0],
                children: [
                    {
                        id: 'r_knee',
                        loc: [-20, 193, 0],
                        children: [
                            {
                                id: 'r_ankle',
                                loc: [-22, 288, 0],
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 'l_hip',
                loc: [18, 98, 0],
                children: [
                    {
                        id: 'l_knee',
                        loc: [20, 193, 0],
                        children: [
                            {
                                id: 'l_ankle',
                                loc: [22, 288, 0],
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

// Model
let model = {
    figures: []
}

const on = (node, id, callback) => {
    if(node.id == id) {
        return callback(node)
    }
    for(child of node.children) {
        const result = on(child, id, callback)
        if(result != null) {
            return result
        }
    }
    return null
}

// Update
const update = (message, args = {}) => {

    const methods = {
        addfigure : () => {
            model.figures.push(figure())
            return model
        }
    }

    if(message in methods) {
        model = methods[message](args)
    }

}

// Events
// LATER -- PASS IN INDEX OF FIGURES
const ds = (e) => {
    const id = e.detail.target.id()
    on(model.figures[0].children, id, (parent) => {
        // recursively build list of affected children, temporarily (?)
        // attatch it to this node in the model
    })
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
        {#each model.figures as neck}
            <Node children={neck.children} loc={neck.loc} id={neck.id} ds={ds} />
        {/each}
    </Layer>
</Stage>
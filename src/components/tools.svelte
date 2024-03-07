<script>
import { panel, state } from '$lib/stores/model.js';
import { vec } from '$lib/vector.js'

const center = function(points) {
    let a = [0, 0]
    for(let point of points) {
        a = vec.sum(a, point)
    }
    return vec.mult(a, [0.25, 0.25])
}

const events = {
    scale : (factor) => {
        const target = $panel.layers[$state.selected]
        if(target.type != 'background') {
            const origin = target.type == 'figure' ? target.points[1] : center(target.points)
            target.points.forEach((point, index) => {
                if(target.type == 'figure' && index == 1) {
                    return
                }
                const distance = vec.sub(point, origin)
                target.points[index] = vec.sum(point, vec.mult(distance, [factor, factor, factor]))
            })
            if(target.type == 'prop') {
                target.scribbles.forEach((scribble, scribbleIndex) => {
                    scribble.forEach((point, pointIndex) => {
                        let d
                        if(pointIndex%2 == 0) { // is 'x' point
                            d = point - origin[0]
                        } else {
                            d = point - origin[1]
                        }
                        target.scribbles[scribbleIndex][pointIndex] = point + d * factor
                    })
                })
            }
            if(target.type == 'figure') {
                target.scale *= 1 + factor
            }
            $panel = $panel
        }
    }, 
    center : () => {
        const target = $panel.layers[$state.selected]
        if(target.type == 'prop') {
            target.pos = [224, 224]  // TO DO -- move into state
        } else if(target.type == 'figure') {
            const center = target.points[1]
            const origin = [256, 150, 0] // TO DO -- move into state
            target.points.forEach((point, index) => {
                target.points[index] = vec.sum(origin, vec.sub(point, center))
            })
        }
        $panel = $panel
    },
    toolDraw : () => {
        if($panel.layers[$state.selected].type == 'prop') {
            $state.tool = 'draw'
        }
    },
    toolErase : () => {
        if($panel.layers[$state.selected].type == 'prop') {
            $state.tool = 'erase'
        }
    },
    toolMove : () => {
        $state.tool = 'move'
    }
}
</script>
<div class="p-12">
    <button class="button w-full {$state.tool == 'move' ? 'selected' : ''}" on:click={events.toolMove}><img src="/move.svg" alt="pointer tool" /></button>
    <button class="button w-full" on:click={() => events.scale(0.1)}><img src="/zoom-in.svg" alt="zoom in tool" /></button>
    <button class="button w-full" on:click={() => events.scale(-0.1)}><img src="/zoom-out.svg" alt="zoom out tool" /></button>
    <button class="button w-full" on:click={events.center}><img src="/crosshair.svg" alt="center tool" /></button>
    <button class="button w-full {$panel.layers[$state.selected].type == 'prop' ? '' : 'greyed-out'} {$state.tool == 'draw' ? 'selected' : ''}" on:click={events.toolDraw}><img src="/pen-tool.svg" alt="pen tool" /></button>
    <button class="button w-full {$panel.layers[$state.selected].type == 'prop' ? '' : 'greyed-out'} {$state.tool == 'erase' ? 'selected' : ''}" on:click={events.toolErase}><img src="/eraser.svg" alt="eraser tool" /></button>
</div>
<style>
.w-full {
    width: 100%;
}
.p-12 {
    padding: 12px;
}
button {
    margin-bottom: 12px;
}
.selected {
    background-color: #333;
}
.greyed-out {
    color: #999;
}
.greyed-out:hover {
    background: #CCC;
}
.greyed-out img {
    filter: invert(50%);
}
.selected img {
    filter: invert()
}
</style>
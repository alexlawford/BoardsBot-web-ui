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
        $state.tool = 'draw'
    },
    toolMove : () => {
        $state.tool = 'move'
    }
}
</script>
<div class="p-12">
    <button class="button w-full" on:click={() => events.scale(0.1)}>+</button>
    <button class="button w-full" on:click={() => events.scale(-0.1)}>-</button>
    <button class="button w-full" on:click={events.center}>0,0</button>
    <button class="button w-full {$state.tool == 'draw' ? 'selected' : ''}" on:click={events.toolDraw}>Draw</button>
    <button class="button w-full {$state.tool == 'move' ? 'selected' : ''}" on:click={events.toolMove}>Move</button>
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
    color: #fff;
}
</style>
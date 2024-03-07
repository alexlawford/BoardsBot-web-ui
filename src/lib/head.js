import { vec } from '$lib/vector.js'

export const rotateX = (figure, theta) => {
    figure.headRotation[1] += theta

    let was = figure.headRotation[0]

    rotateY(figure, -1 * was)

    for(let j of [0, 14, 15, 16, 17]) {             
        figure.points[j] = vec.sum(
            vec.rotate(
                'x',
                vec.sub(figure.points[j], figure.points[18]),
                theta
            ),
            figure.points[18]
        )
    }
    rotateY(figure, was)
}

export const rotateY = (figure, theta) => {                     
    figure.headRotation[0] += theta

    for(let j of [0, 14, 15, 16, 17]) {
        figure.points[j] = vec.sum(
            vec.rotate(
                'y',
                vec.sub(figure.points[j], figure.points[18]),
                theta
            ),
            figure.points[18]
        )
    }
}
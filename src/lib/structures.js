import { vec } from '$lib/vector.js'

export const prop = (offset, colour) => {
    return {
        type: 'prop',
        description: '',
        points: [[0, 0], [64, 0], [64, 64], [0, 64]], 
        pos: offset,
        colour: colour,
        scribbles: []
    }
}

export const figure = (offset, colour) => {

    const points = [
        [0, -33, 23],      // 0 Nose
        [0, 0, 0],         // 1 Neck
        [-30, 3, 0],       // 2 Right Shoulder
        [-65, 58, 0],      // 3 Right Elbow
        [-105, 93, 0],     // 4 Right Wrist
        [30, 3, 0],        // 5 Left Shoulder
        [65, 58, 0],       // 6 Left Elbow
        [105, 93, 0],      // 7 Left Wrist
        [-18, 98, 0],      // 8 Right Hip
        [-20, 190, 0],     // 9 Right Knee
        [-22, 270, 0],     // 10 Right Ankle
        [18, 98, 0],       // 11 Left Hip
        [20, 190, 0],      // 12 Left Knee
        [22, 270, 0],      // 13 Left Ankle
        [-10, -43, 22],    // 14 Right Eye
        [10, -43, 22],     // 15 Left Eye
        [-23, -40, 9],     // 16 Right Ear
        [23, -40, 9],      // 17 Left Ear
        [0, -43, 0]        // -- Additional -- Head Positioning
    ]

    return {
        type: 'figure',
        description: '',
        points: points.map(j => vec.sum(j, offset)),
        headRotation: [0, 0],
        scale: 1, 
        colour: colour
    }
}
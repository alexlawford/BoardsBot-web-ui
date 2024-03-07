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

const colours = {
    joints: [
        '#FF0000', // 0
        '#FF5500', // 1
        '#FFAA00', // 2
        '#FFFF00', // 3
        '#AAFF00', // 4
        '#55FF00', // 5
        '#00FF00', // 6
        '#00FF55', // 7
        '#00FFAA', // 8
        '#00FFFF', // 9
        '#00AAFF', // 10
        '#0055FF', // 11
        '#0000FF', // 12
        '#5500FF', // 13
        '#AA00FF', // 14
        '#FF00FF', // 15
        '#FF00AA', // 16
        '#FF0055', // 17
        'rgba(0,0,0,0)' // 18 -- head position joint is transparent hack
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

export const openpose = {
    relations: relations,
    bones: bones,
    colours: colours
}
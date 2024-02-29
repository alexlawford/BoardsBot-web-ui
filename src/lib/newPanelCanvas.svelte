<script>
    import Konva from 'konva'
    import { Stage, Layer } from 'svelte-konva'

    // - - - - - - - - - - - - - - - PAGE ELEMENTS & SETTINGS - - - - - - - - - - - - //
    let stage
    let layers = {}

    // Settings
    let height = 512
    let width = 512
    let root = {x: 256, y: 80}
    let turnspeed = 0.04
    let dimensions = {
        'joint' : 4,
        'limb' : 3,
        'eye' : 3,
        'head' : 28
    }

    // - - - - - - - - - - - - - - - 3D ROTATION - - - - - - - - - - - - //
    function rotateX (point, theta) {
        return {
            x: point.x,
            y: point.y * Math.cos(theta) - point.z * Math.sin(theta),
            z: point.z * Math.cos(theta) + point.y * Math.sin(theta)
        }
    }

    function rotateY (point, theta) {
        return {
            x: point.x * Math.cos(theta) + point.z * Math.sin(theta),
            y: point.y,
            z: point.z * Math.cos(theta) - point.x * Math.sin(theta)
        }
    }

    function rotateAllX (head, theta) {
        let was = head.yaw
        head.pitch += theta

        head = rotateAllY(head, -1 * head.yaw)

        for(let i = 0; i < head.points.length; i++) {
            head.points[i] = rotateX(head.points[i], theta)
        } 

        return rotateAllY(head, was)
    }

    function rotateAllY (head, theta) {
        head.yaw += theta

        for(let i = 0; i < head.points.length; i++) {
            head.points[i] = rotateY(head.points[i], theta)
        }

        return head
    }
    
    // - - - - - - - - - - - - - - - HELPERS - - - - - - - - - - - - //
    // Children
    function children(arr, acc = []) {
        if(arr.length == 0) {
            return acc
        }
        let child = {joint: arr.shift(), xDist: 0, yDist: 0}
        return children(arr, [...acc, ...[child], ...child.joint.children])
    }

    // Joint Helper
    function joint(x, y, c, colour) {
        return {
            shape: new Konva.Circle({
                radius: dimensions.joint,
                x: root.x + x,
                y: root.y + y,
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 2,
                opacity: 1.0,
                draggable: true
            }),
            children: children(c),
            limbs: [],
            colour
        }
    }

    // Limb Helper
    function limb(root, tip, colour, visible = true) {
        let l = {
            shape: new Konva.Line({
                points: [0, 0, 0, 0],
                stroke: '#000',
                strokeWidth: dimensions.limb,
                lineCap: 'round',
                visible: visible
            }),
            joints: [root, tip],
            colour: colour
        }
        l.joints.forEach((j) => {
            j.limbs.push(l)
        })
        return l
    }

    function headPoints(r) {
        return [
            {x: -1 * r * Math.sin(0.4), y: 0, z: r * Math.cos(0.4)}, // r_eye
            {x: r * Math.sin(0.4), y: 0, z: r * Math.cos(0.4)}, // l_eye
            {x: 0, y: r * Math.sin(0.4), z: r * Math.cos(0.4)}, // nose
            {x: -1 * r * Math.sin(1.2), y: 0, z: r * Math.cos(1.2)}, // r_ear
            {x: r * Math.sin(1.2), y: 0, z: r * Math.cos(1.2)}, // l_eear
         ]
    }

    // - - - - - - - - - - - - - - - HEAD - - - - - - - - - - - - //
    function makeHead() {
        let points = headPoints(dimensions.head)

        let r_eye = new Konva.Circle({
            x: 0,
            y: 0,
            radius: dimensions.eye,
            fill: '#000'
        })

        let l_eye = new Konva.Circle({
            x: 0,
            y: 0,
            radius: dimensions.eye,
            fill: '#000'
        })

        let nose = new Konva.Circle({
            x: 0,
            y: 0,
            radius: 1,
            fill: '#aaa'
        })

        let r_ear = new Konva.Circle({
            x: 0,
            y: 0,
            radius: 1,
            fill: '#aaa'
        })

        let l_ear = new Konva.Circle({
            x: 0,
            y: 0,
            radius: 1,
            fill: '#aaa'
        })

        let head = new Konva.Circle({
            x: 0,
            y: 0,
            radius: dimensions.head,
            fill: '#fff',
            strokeWidth: dimensions.limb,
            stroke: '#000',
            draggable: true
        })

        return {
            points: points,
            r_eye: r_eye,
            l_eye: l_eye,
            head: head,
            nose: nose,
            l_ear: l_ear,
            r_ear: r_ear,
            yaw: 0,
            pitch: 0,
            radius: dimensions.head,
            isHead: true
        }
    }

    // - - - - - - - - - - - - - - - MAKE FIGURE - - - - - - - - - - - - //

    // Make Figure
    function makeFigure() {
        // - - - - - JOINTS
        // Legs
        let r_ankle = joint(- 22, 320, [], '#00AAFF')
        let r_knee = joint(-20, 225, [r_ankle], '#00FFFF')
        let r_hip = joint(-18, 130, [r_knee], '#00FFAA')

        let l_ankle = joint(22, 320, [], '#5500FF')
        let l_knee = joint(20, 225, [l_ankle], '#0000FF')
        let l_hip = joint(18, 130, [l_knee], '#0055FF')

        // Arms
        let r_wrist = joint(-105, 125, [], '#AAFF00')
        let r_elbow = joint(-65, 90, [r_wrist], '#FFFF00')
        let r_shoulder = joint(-30, 35, [r_elbow], '#FFAA00')

        let l_wrist = joint(105, 125, [], '#00FF55')
        let l_elbow = joint(65, 90, [l_wrist], '#00FF00')
        let l_shoulder = joint(30, 35, [l_elbow], '#55FF00')

        // Spine
        let crown = joint(0, -50, [], false)
        let neck = joint(0, 32, [r_shoulder, l_shoulder, r_hip, l_hip, crown], '#FF5500')

        // - - - - - LIMBS
        let r_lower_leg = limb(r_knee, r_ankle, '#009966')
        let r__upper_leg = limb(r_hip, r_knee, '#009933')
        let r_torso = limb(neck, r_hip, '#009900', false)
        let r_forearm = limb(r_elbow, r_wrist, '#999900')
        let r_arm = limb(r_shoulder, r_elbow, '#996600')
        let r_shoulderblade = limb(neck, r_shoulder, '#990000', false)

        let l_lower_leg = limb(l_knee, l_ankle, '#003399')
        let l_upper_leg = limb(l_hip, l_knee, '#006699')
        let l_torso = limb(neck, l_hip, '#009999', false)
        let l_forearm = limb(l_elbow, l_wrist, '#339900')
        let l_arm = limb(l_shoulder, l_elbow, '#669900')
        let l_shoulderblade = limb(neck, l_shoulder, '#993300', false)

        // - - - - - HEAD
        let head = makeHead()
        head.joints = [crown, neck]

        crown.limbs.push(head)
        neck.limbs.push(head)

        // - - - - - BODY
        let body = {
            shape: new Konva.Line({
                closed: true,
                fill: '#666',
                stroke: '#000',
                strokeWidth: dimensions.limb,
                points: [0, 0, 1, 1, 2, 2, 3, 3],
                opacity: 0.8
             }),
             joints: [l_shoulder, r_shoulder, r_hip, l_hip]
        }

        // Seems like an anti-pattern somehow...
        l_shoulder.body = body
        r_shoulder.body = body
        l_hip.body = body
        r_hip.body = body

        return {
            joints: [neck, crown, l_shoulder, r_shoulder, l_hip, r_hip, l_elbow, l_wrist, r_elbow, r_wrist, l_knee, l_ankle, r_knee, r_ankle],
            limbs: [l_shoulderblade, l_arm, l_forearm, l_torso, l_upper_leg, l_lower_leg, r_shoulderblade, r_arm, r_forearm, r_torso, r__upper_leg, r_lower_leg],
            head: head,
            body: body,
            scale: 1
        }
    }

    // - - - - - - - - - - - - - - - INTERACTIONS - - - - - - - - - - - - //
    // Positioning
    function positionLimb(l) {
        if('isHead' in l) {
            positionHead(l)
        } else {
            let x1 = l.joints[0].shape.x()
            let y1 = l.joints[0].shape.y()
            let x2 = l.joints[1].shape.x()
            let y2 = l.joints[1].shape.y()
            l.shape.points([x1, y1, x2, y2])
        }
    }

    function positionHead(head) {
        let ox = (head.joints[0].shape.x() + head.joints[1].shape.x()) / 2
        let oy = (head.joints[0].shape.y() + head.joints[1].shape.y()) / 2

        head.head.x(ox)
        head.head.y(oy)

        head.r_eye.x(head.points[0].x + ox)
        head.r_eye.y(head.points[0].y + oy)

        head.l_eye.x(head.points[1].x + ox)
        head.l_eye.y(head.points[1].y + oy)

        head.nose.x(head.points[2].x + ox)
        head.nose.y(head.points[2].y + oy)

        head.r_ear.x(head.points[3].x + ox)
        head.r_ear.y(head.points[3].y + oy)

        head.l_ear.x(head.points[4].x + ox)
        head.l_ear.y(head.points[4].y + oy)

        // Eyes go transparent if they're on the
        // other side of the head
        let opacityR = head.points[0].z < 0 ? 0.25 : 1
        let opacityL = head.points[1].z < 0 ? 0.25 : 1

        head.r_eye.opacity(opacityR)
        head.l_eye.opacity(opacityL)
    }

    function positionBody(body) {
        let shoulders = {
            l: {
                x: body.joints[0].shape.x(),
                y: body.joints[0].shape.y()
            },
            r: {
                x: body.joints[1].shape.x(),
                y: body.joints[1].shape.y()
            }
        }

        body.shape.points([
            shoulders.l.x,
            shoulders.l.y,
            shoulders.r.x,
            shoulders.r.y,
            body.joints[2].shape.x(),
            body.joints[2].shape.y(),
            body.joints[3].shape.x(),
            body.joints[3].shape.y()
        ]) 

        // turn on fill when shoulders indicate
        // the figure has their back to us
        body.shape.fillEnabled(shoulders.l.x < shoulders.r.x)
    }

    // Drag interactions
    function dragStart(joint) {
        let x = joint.shape.x()
        let y = joint.shape.y()

        // get relative distace between this joint and any child joints
        joint.children.forEach((child, index) => {
            joint.children[index].xDist = child.joint.shape.x() - x
            joint.children[index].yDist = child.joint.shape.y() - y
        })
    }

    function dragMove(joint, checkRel = true) {
        let x = joint.shape.x()
        let y = joint.shape.y()

        // Reposition child joints
        joint.children.forEach((child) => {
            if(checkRel) {
                child.joint.shape.x(x + child.xDist)
                child.joint.shape.y(y + child.yDist)
            }

            child.joint.limbs.forEach((l) => {
                positionLimb(l)
            })

            if('body' in child.joint) {
                positionBody(child.joint.body)
            }
        })

        // redraw affected limbs/head
        joint.limbs.forEach((l) => {
            positionLimb(l)
        })

        if('body' in joint) {
            positionBody(joint.body)
        }
    }

    let wasPos

    function dragHead(head, neck) {

        let pos = stage.getPointerPosition()

        if(wasPos) {
            if(pos.x > wasPos.x) {
                head = rotateAllY(head, turnspeed)
            }
            if(pos.x < wasPos.x) {
                head = rotateAllY(head, -1 * turnspeed)
            }
            if(pos.y > wasPos.y) {
                head = rotateAllX(head, -1 * turnspeed)
            }
            if(pos.y < wasPos.y) {
                head = rotateAllX(head, turnspeed)
            }
        }

        wasPos = pos
        positionHead(head, neck)
    }

    let figures = []

    // - - - - - - - - - - - - - - - RENDERING - - - - - - - - - - - - //
    function colourise(figure) {
        figure.joints.forEach(joint => {
            if(joint.colour) {
                joint.shape.fill(joint.colour)
                joint.shape.strokeWidth(0)
            } else {
                joint.shape.visible(false)
            }
        })
        figure.limbs.forEach(limb => {
            limb.shape.stroke(limb.colour)
            limb.shape.visible(true)
        })
        figure.body.shape.visible(false)

        figure.head.head.visible(false)

        figure.head.r_eye.fill('#AA00FF')
        figure.head.l_eye.fill('#FF00FF')
        figure.head.r_eye.radius(dimensions.joint)
        figure.head.l_eye.radius(dimensions.joint)
        figure.head.l_ear.radius(dimensions.joint)
        figure.head.r_ear.radius(dimensions.joint)
        figure.head.nose.radius(dimensions.joint)
        figure.head.l_ear.fill('#FF0055')
        figure.head.r_ear.fill('#FF00AA')
        figure.head.nose.fill('#FF0000')

        // head bones
        figure.head.r_ear_bone = new Konva.Line({
            stroke: '#660099',
            strokeWidth: dimensions.limb,
            points: [figure.head.r_eye.x(), figure.head.r_eye.y(), figure.head.r_ear.x(), figure.head.r_ear.y()]
        })

        figure.head.l_ear_bone = new Konva.Line({
            stroke: '#990066',
            strokeWidth: dimensions.limb,
            points: [figure.head.l_eye.x(), figure.head.l_eye.y(), figure.head.l_ear.x(), figure.head.l_ear.y()]
        })

        figure.head.r_eyebrow = new Konva.Line({
            stroke: '#990099',
            strokeWidth: dimensions.limb,
            points: [figure.head.r_eye.x(), figure.head.r_eye.y(), figure.head.nose.x(), figure.head.nose.y()]
        })

        figure.head.l_eyebrow = new Konva.Line({
            stroke: '#990099',
            strokeWidth: dimensions.limb,
            points: [figure.head.l_eye.x(), figure.head.l_eye.y(), figure.head.nose.x(), figure.head.nose.y()]
        })
        
        figure.head.bone = new Konva.Line({
            stroke: '#000099',
            strokeWidth: dimensions.limb,
            points: [figure.head.nose.x(), figure.head.nose.y(), figure.joints[0].shape.x(), figure.joints[0].shape.y()]
        })

        layers.limbs.add(figure.head.r_ear_bone)
        layers.limbs.add(figure.head.l_ear_bone)
        layers.limbs.add(figure.head.r_eyebrow)
        layers.limbs.add(figure.head.l_eyebrow)
        layers.limbs.add(figure.head.bone)
    }

    // - - - - - - - - - - - - - - - EXPORT - - - - - - - - - - - - //
    export const konvaCanvas = {
        addFigure: () => {
            let id = figures.push(makeFigure()) - 1

            figures[id].joints.forEach(x => {
                x.shape.on('dragstart', () => dragStart(x))
                x.shape.on('dragmove', () => dragMove(x))
                layers.joints.add(x.shape)
            })

            figures[id].limbs.forEach(l => {
                positionLimb(l)
                layers.limbs.add(l.shape)
            })

            positionHead(figures[id].head, figures[id].joints[1])

            figures[id].head.head.on('dragmove', () => dragHead(figures[id].head, figures[id].joints[1]))

            layers.joints.add(figures[id].head.head)
            layers.joints.add(figures[id].head.r_eye)
            layers.joints.add(figures[id].head.l_eye)
            layers.joints.add(figures[id].head.nose)
            layers.joints.add(figures[id].head.r_ear)
            layers.joints.add(figures[id].head.l_ear)

            positionBody(figures[id].body)

            layers.limbs.add(figures[id].body.shape)

            return id
        },

        scaleFigure: (id, scaleFactor) => {
            let origin = {
                x: figures[id].joints[0].shape.x(), // nose
                y: figures[id].joints[0].shape.y()
            }

            figures[id].joints.forEach((j, index) => {
                // neck comes first, this is the center from which we scale
                if(index != 0) {
                    let x = j.shape.x()
                    let y = j.shape.y()
                    let dX = x - origin.x
                    let dY = y - origin.y
                    j.shape.x(x + (dX * scaleFactor))
                    j.shape.y(y + (dY * scaleFactor))
                }
            })

            figures[id].head.radius *= 1 + scaleFactor
            figures[id].head.head.radius(figures[id].head.radius)
            figures[id].head.points = headPoints(figures[id].head.radius)

            let yaw = figures[id].head.yaw
            let pitch = figures[id].head.pitch

            figures[id].head.yaw = 0
            figures[id].head.pitch = 0

            rotateAllX(figures[id].head, pitch)
            rotateAllY(figures[id].head, yaw)

            dragMove(figures[id].joints[0], false)

            figures[id].scale += (figures[id].scale * scaleFactor)
        },


        render: () => {
            figures.forEach(figure => {
                colourise(figure)
            })
            let bg = new Konva.Rect({
                width: width,
                height: height,
                fill: '#000'
            })
            layers.background.add(bg)
            return stage.toDataURL({
                    pixelRatio: 2
            })
        }
    }

</script>
<Stage config={{width: 512, height: 512}} bind:handle={stage}>
    <Layer bind:handle={layers.background}>
    </Layer>
    <Layer bind:handle={layers.limbs}>
    </Layer>
    <Layer bind:handle={layers.joints}>
    </Layer>
</Stage>
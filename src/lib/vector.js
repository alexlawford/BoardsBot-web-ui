export const vec = {
    sum : (a, b) => {
        return vec.run(a, b, (x, y) => x + y)
    },
    sub : (a, b) => {
        return vec.run(a, b, (x, y) => x - y)
    },
    mult : (a, b) => {
        return vec.run(a, b, (x, y) => x * y)
    },
    run : (a, b, op) => {
        let c = a.slice(0)
        for(let i = 0; i < b.length && i < a.length; i++) {
            c[i] = op(a[i], b[i])
        }
        return c
    },
    rotate : (axis, point, theta) => {                
        if(axis == 'x') {
            return [
                point[0],
                point[1] * Math.cos(theta) - point[2] * Math.sin(theta),
                point[2] * Math.cos(theta) + point[1] * Math.sin(theta)
            ]
        } else {
            return [
                point[0] * Math.cos(theta) + point[2] * Math.sin(theta),
                point[1],
                point[2] * Math.cos(theta) - point[0] * Math.sin(theta)
            ]
        }
    }
}
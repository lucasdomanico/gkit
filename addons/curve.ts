const $range = (start:number, stop?:number, step?:number):number[] => {
    if(stop === undefined) {
        stop = start
        start = 0
    }
    if(step === undefined) {
        step = 1
    }
    if((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return []
    }
    var result = [] as number[]
    for(let i = start; step > 0? i < stop : i > stop; i += step) {
        result.push(i)
    }
    return result
}

import * as three from './three/three-v166/three.module.js'

import { Mat4 } from './mat4.js'

/**
 * Created using {@link curve}.\
 * The only available function is `point`.
 */
export class Curve {
    constructor(
        /**
         * Returns the point at the interval of `t`; from 0 to 1.
         */
        public point: (t:number) => CurvePoint
    ) {}
}

/**
 * Created using {@link Curve}.\
 * See also {@link curve}.
 */
export class CurvePoint { constructor(
    /**
     * The matrix already contains the translation, rotation and scale.
     */
    public matrix:Mat4,
    /**
     * Optional interpolated values. See {@link curve}.
     */
    public vars:Array<number>) {}
}

type matrix = (x:number, y:number, z:number, nx:number, ny:number, nz:number, r:number, sx:number, sy:number, sz:number) => Mat4
const matrix:matrix = (x, y, z, nx, ny, nz, r, sx, sy, sz) => {
    let m = new three.Matrix4()
    m.makeTranslation(x, y, z)
    m.lookAt(new three.Vector3(x, y, z), new three.Vector3(x + nx, y + ny, z + nz), new three.Vector3(0, 1, 0))
    m.multiply(new three.Matrix4().makeRotationZ(r))
    m.multiply(new three.Matrix4().makeScale(sx, sy, sz))
    return m.elements as any
}


type curve = (points:Array<[[number, number, number, number, number, number, number, number, number, number], Array<number>]>) => Curve
/**
 * x y z nx ny nz r sx sy sz
 */

/**
 * To create a curve, you need to give all the keyframe data.\
 * The first array are the x, y and z coordinates.
 * Then the normal (a unit vector), the rotation, and the scale at x, y and z.\
 * The second array are user defined values to be interpolated.
 * Example:\
 * ```ts
 * let c = curve([
 *     [[0, 0, 0, 0, 0, 1, 0, 1, 1, 1], []],
 *     [[1, 1, 1, 0, 0, 1, 0, 1, 1, 1], []]
 * ])
 * let p = c.point(0.5)
 * ```
 * @param points
 * @returns 
 */
export const curve:curve = (points) => {
    let ps = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][0], p[0][1], p[0][2])
    }))
    let ns = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][3], p[0][4], p[0][5])
    }))
    let rs = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][6], 0, 0)
    }))
    let xs = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][7], 0, 0)
    }))
    let ys = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][8], 0, 0)
    }))
    let zs = new three.CatmullRomCurve3(points.map((p) => {
        return new three.Vector3(p[0][9], 0, 0)
    }))
    let vs = $range(points[0][1].length).map((i) => {
        return new three.CatmullRomCurve3(points.map((p) => {
            return new three.Vector3(p[1][i], 0, 0)
        }))
    })
    return new Curve((t) => {
        let p = ps.getPoint(t)
        let n = ns.getPoint(t)
        let r = rs.getPoint(t).x
        let x = xs.getPoint(t).x
        let y = ys.getPoint(t).x
        let z = zs.getPoint(t).x
        let vars = vs.map((v) => v.getPoint(t).x)
        let m = matrix(p.x, p.y, p.z, n.x, n.y, n.z, r, x, y, z)
        return new CurvePoint(m, vars)
    })
}

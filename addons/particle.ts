import {
    Texture,
    DrawCall,
    UniformArray,
    Buffer,
    Uniform
} from '../types.js'

import * as three from './three/three-v166/three.module.js'

import { Mat4 } from './mat4.js'

export class Particle { constructor(
    public time:number,
    public delta:number,
    public uniforms:() => Array<[string, Uniform]>) {}
    public static shader = `
        vec4 pixel(px p) {
            return hue(texture(p.tex, p.uv), p.hue) * p.alpha;
        }
    `
    // static struct = (o:{ time:number, delta:number, draw:($0:DrawCall, $1:string) => void }) => {
    //     return new Particle(o.time, o.delta, o.draw)
    // }
}

type rescale = (x:number, amin:number, amax:number, bmin:number, bmax:number) => number
const rescale:rescale = (x, amin, amax, bmin, bmax) => {
    let a = amax - amin
    let b = bmax - bmin
    return (x - amin) * b / a + bmin
}

type particle = (matrix:Mat4, time:number, a:number, x:number, y:number, z:number, vx:number, vy:number, vz:number, r:number, size:[number, number], hue:[number, number], texture:Texture) => Particle
export const particle:particle = (matrix, time, a, x, y, z, vx, vy, vz, r, size, hue, texture) => {
    let m = new three.Matrix4()
    m.fromArray(matrix)
    m.multiply(new three.Matrix4().makeTranslation(x, y, z))
    let self:Particle = new Particle(time, 0, () => {
        let c = new three.Matrix4()
        c.copy(m)
        c.multiply(new three.Matrix4().makeTranslation(vx * self.delta, vy * self.delta, vz * self.delta))
        c.multiply(new three.Matrix4().makeRotationZ(r * self.delta))
        let s = rescale(self.delta, 0, time, size[0], size[1])
        c.multiply(new three.Matrix4().makeScale(s, s, s))
        let model = c.elements
        let alpha = (() => {
            if(self.delta < a) {
                return rescale(self.delta, 0, a, 0, 1)
            }
            return rescale(self.delta, a, time, 1, 0)
        })()
        let h = rescale(self.delta, 0, time, hue[0], hue[1])
        return [
            ['tex', texture],
            ['model', new UniformArray('mat4', model)],
            ['alpha', alpha],
            ['hue', h]
        ]
        // buf.draw({
        //     uniforms: [
        //         ['tex', texture],
        //         ['model', new UniformArray('mat4', model)],
        //         ['alpha', alpha],
        //         ['hue', h]
        //     ],
        //     shader: vertex + `
        //         vec4 pixel(px p) {
        //             return hue(texture(p.tex, p.uv), p.hue) * p.alpha;
        //         }
        //     `
        // })
    })
    return self
}
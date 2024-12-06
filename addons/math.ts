import { Mat4 } from './mat4.js'


export type Vec3 = [number, number, number]

type translate = (x:number, y:number, z:number) => Mat4
export const translate:translate = (x, y, z) => {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
}

type rotatex = (a:number) => Mat4
export const rotatex:rotatex = (a) => {
    let c = Math.cos(a)
    let s = Math.sin(a)
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]
}

type rotatey = (a:number) => Mat4
export const rotatey:rotatey = (a) => {
    let c = Math.cos(a)
    let s = Math.sin(a)
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]
}

type rotatez = (a:number) => Mat4
export const rotatez:rotatez = (a) => {
    let c = Math.cos(a)
    let s = Math.sin(a)
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

type scale = (x:number, y:number, z:number) => Mat4
export const scale:scale = (x, y, z) => {
    return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]
}

type perspective_vfov_r = (vfov:number, aspect:number, near:number, far:number) => Mat4
const perspective_vfov_r:perspective_vfov_r = (vfov, aspect, near, far) => {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * vfov)
    let rangeinv = 1 / (near - far)
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeinv * 1, -1, 0, 0, near * far * rangeinv * 2, 0]
}

type radians = (degrees:number) => number
const radians:radians = (degrees) => {
    return degrees * Math.PI / 180
}

type perspective = (fov:number, aspect:number, near:number, far:number) => Mat4
export const perspective:perspective = (fov, aspect, near, far) => {
    return perspective_vfov_r(radians(fov), aspect, near, far)
}

type sub = (a:Vec3, b:Vec3) => Vec3
const sub:sub = (a, b) => {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

type cross = (a:Vec3, b:Vec3) => Vec3
const cross:cross = (a, b) => {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

type normalize = (v:Vec3) => Vec3
const normalize:normalize = (v) => {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    if(length === 0) throw(new Error())
    return [v[0] / length, v[1] / length, v[2] / length]
}

type lookatup = (eye:Vec3, target:Vec3, up:Vec3) => Mat4
export const lookatup:lookatup = (eye, target, up) => {
    let p = eye
    let z = normalize(sub(p, target))
    let x = normalize(cross(up, z))
    let y = normalize(cross(z, x))
    return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, p[0], p[1], p[2], 1]
}

type lookat = (eye:Vec3, target:Vec3) => Mat4
export const lookat:lookat = (eye, target) => {
    return lookatup(eye, target, [0, 1, 0])
}

type mul = (a:Mat4, b:Mat4) => Mat4
export const mul:mul = (a, b) => {
    return [a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3], a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3], a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3], a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3], a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7], a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7], a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7], a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7], a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11], a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11], a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11], a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11], a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15], a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]]
}

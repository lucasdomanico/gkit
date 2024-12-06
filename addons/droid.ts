import * as three from './three/three-v166/three.module.js'

import {
    gfx,
    GFX,
    Model
} from '../gkit.js'

import {
    raw
} from './model_raw.js'

import {
    raw_model
} from './model.js'

import {
    anim
} from './droid_anim.js'

type Scene = any

type Mesh = any

type scene_meshes = (scene:Scene) => Array<Mesh>
const scene_meshes:scene_meshes = (scene) => {
    let meshes = ([] as Array<Mesh>)
    scene.traverse((o:any) => {
        let c = o.constructor.name
        if(c === 'Mesh' || c === 'SkinnedMesh') {
            meshes.push(o)
        }
    })
    return meshes
}

type dump_anim = (scene:Scene, name:string, duration:number, fps:number, update:($0:Mesh, $1:number) => void) => void
const dump_anim:dump_anim = (scene, name, duration, fps, update) => {
    let meshes = scene_meshes(scene)
    let tracks = ([] as Array<any>)
    meshes.forEach((mesh) => {
        if(!mesh.name) throw(mesh)
        let id = mesh.name
        let times = ([] as Array<number>)
        let pos = ([] as Array<number>)
        let scale = ([] as Array<number>)
        let quat = ([] as Array<number>)
        let o = mesh
        for(let t = 0; t < duration; t += 1 / fps) {
            times.push(t)
            update(o, t)
            pos.push(o.position.x, o.position.y, o.position.z)
            scale.push(o.scale.x, o.scale.y, o.scale.z)
            quat.push(o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w)
        }
        return tracks.push(new three.VectorKeyframeTrack(id + '.position', times, pos), new three.VectorKeyframeTrack(id + '.scale', times, scale), new three.QuaternionKeyframeTrack(id + '.quaternion', times, quat))
    })
    return scene.animations.push(new three.AnimationClip(name, duration, tracks))
}

// export type canvas = (w:number, h:number) => HTMLCanvasElement
// export const canvas:canvas = (w, h) => {
//     let canvas = document.createElement('canvas')
//     canvas.width = w
//     canvas.height = h
//     canvas.style.position = 'absolute'
//     canvas.style.top = '0'
//     canvas.style.right = '1.5%'
//     canvas.style.border = '2px solid black'
//     canvas.style.width = '40%'
//     document.body.append(canvas)
//     return canvas
// }

// export type render_three = (scene:Scene, animation:string) => void
// export const render_three:render_three = (scene, animation) => {
//     let c = canvas(1000, 1000)
//     let renderer = new three.WebGLRenderer(Object.fromEntries([['canvas', c]]))
//     let camera = new three.PerspectiveCamera(75, c.width / c.height, 0.1, 1000)
//     camera.position.z = 5
//     let mixer = new three.AnimationMixer(scene)
//     mixer.clipAction('run').play()
//     let time = Date.now()
//     return renderer.setAnimationLoop(() => {
//         mixer.update((Date.now() - time) * 0.001)
//         time = Date.now()
//         return renderer.render(scene, camera)
//     })
// }

// export type render_gkit = (scene:Scene, animation:string) => void
// export const render_gkit:render_gkit = (scene, animation) => {
//     let g = gfx(canvas(1000, 1000))
//     let buf = g.buffer((_) => {
//         return _.depth = true
//     })
//     let m = raw_model(g, raw(scene, scene.animations, $range(scene.animations.length).map(() => 600)))
//     let now = Date.now()
//     let animate = () => {
//         let time = (Date.now() - now) * 0.001
//         buf.clear(true, true)
//         m.items.forEach((item) => {
//             return buf.draw((_) => {
//                 _.depth = true
//                 _.mesh = item.mesh
//                 _.uniforms.set('time', time * 0.1)
//                 _.uniforms.set('clip', item.clips.get(animation))
//                 return _.shader = `
//                     mat4[3] vertex(vx v) {
//                         mat4 proj = perspective(75., v.aspect, 0.1, 1000.);
//                         mat4 view = translate(0., 0., 5.);
//                         mat4 model = rotatey(v.time * 0.5) *
//                             clip(v.clip, v.joints, v.weights, v.time);
//                         return mat4[3](proj, inverse(view), model);
//                     }
//                     vec4 pixel(px p) {
//                         return vec4(p.normal.x, p.normal.y, p.normal.z, 1);
//                     }
//                 `
//             })
//         })
//         g.flush(buf)
//         return requestAnimationFrame(animate)
//     }
//     return animate()
// }

type droid = (gfx:GFX) => Model
export const droid:droid = (gfx) => {
    let a = anim()
    let fpsv = ([] as Array<number>)
    a.clips.forEach((c) => {
        dump_anim(a.scene, c.name, c.duration, c.fps, c.update)
        return fpsv.push(c.fps)
    })
    return raw_model(gfx, raw(a.scene, a.scene.animations, fpsv))
}

// export type main = () => void
// export const main:main = () => {
//     let a = anim()
//     a.clips.forEach((c) => {
//         console.log(c)
//         return dump_anim(a.scene, c.name, c.duration, c.fps, c.update)
//     })
//     return render_gkit(a.scene, 'dash')
// }

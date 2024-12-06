import * as three from './three/three-v166/three.module.js'
import * as capsule from './three/three-js-capsule-geometry.js'

export type Scene = any
export type Mesh = any
export type Geometry = any

export class AnimClip { constructor(
    public name:string,
    public duration:number,
    public fps:number,
    public update:($0:Mesh, $1:number) => void) {}
    static struct = (o:{ name:string, duration:number, fps:number, update:($0:Mesh, $1:number) => void }) => {
        return new AnimClip(o.name, o.duration, o.fps, o.update)
    }
}

export class Anim { constructor(
    public scene:Scene,
    public clips:Array<AnimClip>) {}
    static struct = (o:{ scene:Scene, clips:Array<AnimClip> }) => {
        return new Anim(o.scene, o.clips)
    }
}

export type wave = (t:number) => number
export const wave:wave = (t) => {
    return Math.sin(t * Math.PI * 2 - Math.PI * 0.5) * 0.5 + 0.5
}

export type rescale = (x:number, amin:number, amax:number, bmin:number, bmax:number) => number
export const rescale:rescale = (x, amin, amax, bmin, bmax) => {
    let a = amax - amin
    let b = bmax - bmin
    return (x - amin) * b / a + bmin
}

export type capsule_uv = (geo:Geometry) => Geometry
export const capsule_uv:capsule_uv = (geo) => {
    let uv_index = 0
    for(let i = 0; i < geo.attributes.position.array.length; i += 3) {
        let x = geo.attributes.position.array[i + 0]
        let y = geo.attributes.position.array[i + 1]
        let z = geo.attributes.position.array[i + 2]
        let u = geo.attributes.uv.array[uv_index + 0]
        let v = geo.attributes.uv.array[uv_index + 1]
        let yy = rescale(y, (-1.5), 1.5, 0, 1)
        if(yy <= 0.25) {
            v = yy
        }
        if(yy > 0.25 && yy < 0.75) {
            v = rescale(yy, 0.25, 0.75, 0, 0.5) + 0.25
        }
        if(yy >= 0.75) {
            v = yy
        }
        geo.attributes.uv.array[uv_index + 0] = u
        geo.attributes.uv.array[uv_index + 1] = v
        uv_index += 2
    }
    return geo
}

export const new_mesh = (name:string):Mesh => {
    let geo = capsule_uv(new capsule.CapsuleBufferGeometry(1, 1, 1, 25, 25, 10, 10))
    let mat = new three.MeshBasicMaterial()
    let mesh = new three.Mesh(geo, mat)
    mesh.name = name
    return mesh
}

export type anim = () => Anim
export const anim:anim = () => {
    let arm_x = 1
    let foot_x = 0.5
    let foot_y = (-1)
    let body = new_mesh('body')
    let arm_left = new_mesh('arm_left')
    let arm_right = new_mesh('arm_right')
    let foot_left = new_mesh('foot_left')
    let foot_right = new_mesh('foot_right')
    let o = new three.Object3D()
    o.add(body)
    o.add(arm_left)
    o.add(arm_right)
    o.add(foot_left)
    o.add(foot_right)
    let reset = () => {
        [body, arm_left, arm_right, foot_left, foot_right].forEach((mesh) => {
            mesh.position.set(0, 0, 0)
            mesh.rotation.set(0, 0, 0)
            return mesh.scale.set(0.5, 0.5, 0.5)
        })
        body.scale.set(1, 1, 1)
        arm_left.position.x = arm_x
        arm_right.position.x = -arm_x
        foot_left.position.y = foot_y
        foot_left.position.x = -foot_x
        foot_right.position.y = foot_y
        return foot_right.position.x = foot_x
    }
    let fps = 600
    return new Anim(o, [new AnimClip('walk', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'body') {
            mesh.position.y = wave(time) * 0.1
        }
        let k = Math.PI / 2
        if(mesh.name === 'arm_left') {
            mesh.rotation.x = wave(time) * k - k / 2
        }
        if(mesh.name === 'arm_right') {
            mesh.rotation.x = -(wave(time) * k - k / 2)
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = wave(time) * k - k / 2
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = -(wave(time) * k - k / 2)
        }
    }), new AnimClip('run', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'body') {
            mesh.position.y = -0.1 + wave(time * 4) * 0.1
            mesh.rotation.x = -Math.PI / 12
        }
        let k = Math.PI
        if(mesh.name === 'arm_left') {
            mesh.rotation.x = wave(time * 2) * k - k / 2
        }
        if(mesh.name === 'arm_right') {
            mesh.rotation.x = -(wave(time * 2) * k - k / 2)
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = wave(time * 2) * k - k / 2
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = -(wave(time * 2) * k - k / 2)
        }
    }), new AnimClip('dash', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'body') {
            mesh.position.y = -0.1 + wave(time * 4) * 0.1
            mesh.rotation.x = Math.PI / 12
        }
        let k = Math.PI
        if(mesh.name === 'arm_left') {
            mesh.rotation.x = wave(time * 2) * k - k / 2
        }
        if(mesh.name === 'arm_right') {
            mesh.rotation.x = -(wave(time * 2) * k - k / 2)
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = wave(time * 2) * k - k / 2
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = -(wave(time * 2) * k - k / 2)
        }
    }), new AnimClip('stop', 1, fps, (mesh, time) => {
        return reset()
    }), new AnimClip('guard', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'body') {
            mesh.position.y = -0.1 + wave(time) * 0.1
        }
        if(mesh.name === 'arm_left') {
            mesh.position.y = wave(time + 0.5) * 0.1
            mesh.rotation.x = Math.PI / 4
        }
        if(mesh.name === 'arm_right') {
            mesh.position.y = wave(time) * 0.1
            mesh.rotation.x = -Math.PI / 2
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = Math.PI / 4
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = -Math.PI / 4
        }
    }), new AnimClip('jump', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'arm_left') {
            mesh.position.y = wave(time + 0.5) * 0.1
            mesh.rotation.x = Math.PI / 4
        }
        if(mesh.name === 'arm_right') {
            mesh.position.y = wave(time) * 0.1
            mesh.rotation.x = -Math.PI / 4
            mesh.position.z = wave(time * 2) * 0.2
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = Math.PI / 4
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = -Math.PI / 4
        }
    }), new AnimClip('action', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'body') {
            mesh.position.y = -0.1 + wave(time) * 0.1
        }
        if(mesh.name === 'arm_left') {
            mesh.position.y = wave(time + 0.5) * 0.1
            mesh.rotation.x = Math.PI / 8
        }
        if(mesh.name === 'arm_right') {
            mesh.position.y = wave(time) * 0.1
            mesh.rotation.x = -Math.PI / 2
            mesh.position.z = wave(time * 2) * 0.2
        }
        if(mesh.name === 'foot_left') {
            mesh.rotation.x = -Math.PI / 8
        }
        if(mesh.name === 'foot_right') {
            mesh.rotation.x = Math.PI / 8
        }
    }), new AnimClip('hi', 1, fps, (mesh, time) => {
        reset()
        if(mesh.name === 'arm_left') {
            mesh.rotation.z = wave(time + 0.5) * -1 + Math.PI
        }
    })])
}

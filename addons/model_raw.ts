import * as three from './three/three-v166/three.module.js'
import * as gltf_loader from './three/three-v166/GLTFLoader.js'
import * as draco_loader from './three/three-v166/DRACOLoader.js'
import * as buffer_geometry_utils from './three/three-v166/BufferGeometryUtils.js'

import { MeshData } from '../gkit.js'

// export type GLB = any
// export type Mesh = any
// export type Texture = any
// export type Geometry = any
// export type Scene = any
// export type Attribute = any
// export type Animation = any
// export type Mixer = any
// export type Color = any

class GLFT {
    constructor(
        public scene:three.Scene,
        public animations:Array<three.AnimationClip>
    ) {}
}

export type Bone = Float32Array

export type Frame = Array<Array<Bone>>

export class Raw { constructor(
    public items:Array<RawItem>,
    public textures:Array<RawTexture>,
    public anims:Array<RawAnimation>) {}
    static struct = (o:{ items:Array<RawItem>, textures:Array<RawTexture>, anims:Array<RawAnimation> }) => {
        return new Raw(o.items, o.textures, o.anims)
    }
}

export class RawTexture { constructor(
    public name:string,
    public image:HTMLImageElement | OffscreenCanvas,
    public flip:boolean,
    public wraps:string,
    public wrapt:string) {}
    static struct = (o:{ name:string, image:HTMLImageElement | OffscreenCanvas, flip:boolean, wraps:string, wrapt:string }) => {
        return new RawTexture(o.name, o.image, o.flip, o.wraps, o.wrapt)
    }
}



// export class RawMesh { constructor(
//     public indices:Uint32Array,
//     public positions:Float32Array,
//     public uvs:Float32Array,
//     public normals:Float32Array,
//     public tangents:Float32Array,
//     public joints:Uint32Array,
//     public weights:Float32Array) {}
//     static struct = (o:{ indices:Uint32Array, positions:Float32Array, uvs:Float32Array, normals:Float32Array, tangents:Float32Array, joints:Uint32Array, weights:Float32Array }) => {
//         return new RawMesh(o.indices, o.positions, o.uvs, o.normals, o.tangents, o.joints, o.weights)
//     }
// }

// let MeshData_struct = (o:{ indices:Uint32Array, positions:Float32Array, uvs:Float32Array, normals:Float32Array, tangents:Float32Array, joints:Uint32Array, weights:Float32Array }) => {
//     return new MeshData(o.indices, o.positions, o.uvs, o.normals, o.tangents, o.joints, o.weights)
// }

export class RawItem { constructor(
    public name:string,
    public skin:boolean,
    public color:string,
    public normal:string,
    public ao:string,
    public emissive:string,
    public mesh:MeshData) {}
    static struct = (o:{ name:string, skin:boolean, color:string, normal:string, ao:string, emissive:string, mesh:MeshData }) => {
        return new RawItem(o.name, o.skin, o.color, o.normal, o.ao, o.emissive, o.mesh)
    }
}

export class RawAnimation { constructor(
    public name:string,
    public time:number,
    public fps:number,
    public clips:Array<RawClip>) {}
    static struct = (o:{ name:string, time:number, fps:number, clips:Array<RawClip> }) => {
        return new RawAnimation(o.name, o.time, o.fps, o.clips)
    }
}

export class RawClip { constructor(
    public mesh:string,
    public arraybuf:ArrayBuffer) {}
    static struct = (o:{ mesh:string, arraybuf:ArrayBuffer }) => {
        return new RawClip(o.mesh, o.arraybuf)
    }
}

export type wrap = (n:number) => string
export const wrap:wrap = (n) => {
    if(n === three.RepeatWrapping) return 'repeat'
    if(n === three.ClampToEdgeWrapping) return 'clamp'
    if(n === three.MirroredRepeatWrapping) return 'mirror'
    return ''
}

export type raw_textures = (meshes:Array<three.Mesh>) => Array<RawTexture>
export const raw_textures:raw_textures = (meshes) => {
    let imgs = new Map<string, three.Texture>()
    meshes.forEach((mesh) => {
        let material = mesh.material as any
        if(material.map) imgs.set(material.map.source.uuid, material.map)
        if(material.normalMap) imgs.set(material.normalMap.source.uuid, material.normalMap)
        if(material.aoMap) imgs.set(material.aoMap.source.uuid, material.aoMap)
        if(material.emissiveMap) imgs.set(material.emissiveMap.source.uuid, material.emissiveMap)
    })
    let texs = ([] as Array<RawTexture>)
    imgs.forEach((value, key) => {
        let flipY = value.rotation? true : value.flipY
        return texs.push(new RawTexture(key, value.image, flipY, wrap(value.wrapS), wrap(value.wrapT)))
    })
    return texs
}

export type interleaved = (a:three.InterleavedBufferAttribute) => Array<number>
export const interleaved:interleaved = (a) => {
    let size = a.itemSize
    let stride = a.data.stride
    let offset = a.offset
    let v = ([] as Array<number>)
    for(let i = offset; i < a.data.array.length; i += stride) {
        v.push(a.data.array[i], a.data.array[i + 1], a.data.array[i + 2], a.data.array[i + 3])
    }
    return v
}

export type attribute = (a:three.BufferAttribute) => Array<number>
export const attribute:attribute = (a) => {
    if(a.constructor.name.endsWith('InterleavedBufferAttribute')) {
        return interleaved(a as any)
    }
    return a.array
}

export type iattribute = (a:three.BufferAttribute) => Uint32Array
export const iattribute:iattribute = (a) => {
    return new Uint32Array(attribute(a))
}

export type fattribute = (a:three.BufferAttribute) => Float32Array
export const fattribute:fattribute = (a) => {
    return new Float32Array(attribute(a))
}

export type geometry = (g:three.BufferGeometry) => MeshData
export const geometry:geometry = (g) => {
    let unit = g.attributes.position.array.length / 3
    if(!g.attributes.uv) {
        let a = new Float32Array(unit * 2)
        g.setAttribute('uv', new three.BufferAttribute(a, 2, false))
    }
    if(!g.index) {
        g = buffer_geometry_utils.mergeVertices(g)
    }
    if(!g.attributes.normal) {
        g.computeVertexNormals()
    }
    g.computeTangents()
    return new MeshData(
        iattribute(g.index),
        fattribute(g.attributes.position),
        fattribute(g.attributes.uv),
        fattribute(g.attributes.normal),
        fattribute(g.attributes.tangent),
        g.attributes.skinIndex? iattribute(g.attributes.skinIndex) : new Uint32Array(unit * 4),
        g.attributes.skinWeight? fattribute(g.attributes.skinWeight) : new Float32Array(unit * 4)
    )
}

export type loadglb = (path:string) => Promise<GLFT>
export const loadglb:loadglb = (path) => {
    let g = new gltf_loader.GLTFLoader()
    let d = new draco_loader.DRACOLoader()
    d.setDecoderPath(new URL('./three/three-v166/draco/', import.meta.url).href)
    g.setDRACOLoader(d)
    return new Promise((resolve, reject) => {
        return g.load(path, resolve, () => 0, reject)
    })
}

export type scene_meshes = (scene:three.Scene) => Array<three.Mesh>
export const scene_meshes:scene_meshes = (scene) => {
    let meshes = ([] as Array<three.Mesh>)
    scene.traverse((o:any) => {
        let c = o.constructor.name
        if(c === 'Mesh' || c === 'SkinnedMesh') {
            meshes.push(o)
        }
    })
    return meshes
}

export type mesh_bones = (mesh:three.Mesh) => Array<Bone>
export const mesh_bones:mesh_bones = (mesh) => {
    let bones = [new Float32Array(mesh.matrixWorld.clone().elements)]
    let skeleton = (mesh as any).skeleton as three.Skeleton
    if(skeleton) {
        skeleton.update()
        skeleton.bones.forEach((bone:any, i:number) => {
            let p = i * 16
            if(skeleton.boneMatrices === null) throw new Error()
            return bones.push(skeleton.boneMatrices.slice(p, p + 16))
        })
    }
    return bones
}

export type frame_to_arraybuf = (frame:Frame, time:number, fps:number) => ArrayBuffer
export const frame_to_arraybuf:frame_to_arraybuf = (frame, time, fps) => {
    let stride = frame[0].length
    let size = 4 + frame.length * stride * 16
    let arraybuf = new ArrayBuffer(size * 4)
    let v = new Float32Array(arraybuf)
    v[0] = time
    v[1] = fps
    v[2] = stride
    let p = 4
    frame.forEach((bones) => {
        return bones.forEach((bone) => {
            v.set(bone, p)
            return p += 16
        })
    })
    return arraybuf
}

export type animation_to_clips = (scene:three.Scene, meshes:Array<three.Mesh>, mixer:three.AnimationMixer, animation:three.AnimationClip, fps:number) => Array<RawClip>
export const animation_to_clips:animation_to_clips = (scene, meshes, mixer, animation, fps) => {
    let frames = meshes.map(() => ([] as Array<Array<Bone>>))
    mixer.stopAllAction()
    let action = mixer.clipAction(animation)
    action.setLoop(three.LoopOnce, 0)
    action.clampWhenFinished = true
    action.play()
    for(;;) {
        mixer.update(1 / fps)
        scene.updateWorldMatrix(true, true)
        meshes.forEach((mesh, i) => {
            return frames[i].push(mesh_bones(mesh))
        })
        if(action.paused) break
    }
    let clips = ([] as Array<RawClip>)
    meshes.forEach((mesh, i) => {
        let arraybuf = frame_to_arraybuf(frames[i], animation.duration, fps)
        return clips.push(new RawClip(mesh.name, arraybuf))
    })
    return clips
}

export const pixel_texture = (r:number, g:number, b:number):OffscreenCanvas => {
    let canvas = new OffscreenCanvas(1, 1)
    let c = canvas.getContext('2d')
    if(c) {
        c.fillStyle = ['rgb(', Math.round(r * 255), ' ', Math.round(g * 255), ' ', Math.round(b * 255), ')'].join('')
        c.fillRect(0, 0, 1, 1)    
    }
    return canvas
}

export type raw = (scene:three.Scene, animations:Array<three.AnimationClip>, fpsv:Array<number>) => Raw
export const raw:raw = (scene, animations, fpsv) => {
    let meshes = scene_meshes(scene)
    let rawtexs = raw_textures(meshes)
    let rawitems = meshes.map((mesh) => {
        let material = mesh.material as any
        let color = material.map? material.map.source.uuid : ''
        let normal = material.normalMap? material.normalMap.source.uuid : ''
        let ao = material.aoMap? material.aoMap.source.uuid : ''
        let emissive = material.emissiveMap? material.emissiveMap.source.uuid : ''
        if(!color) {
            color = mesh.uuid + '-color'
            let c = material.color
            c.convertLinearToSRGB()
            let image = pixel_texture(c.r, c.g, c.b)
            rawtexs.push(RawTexture.struct({ name:color, image:image, flip:false, wraps:'clamp', wrapt:'clamp' }))
        }
        if(!normal) {
            normal = mesh.uuid + '-normal'
            let image = pixel_texture(0, 0, 1)
            rawtexs.push(RawTexture.struct({ name:normal, image:image, flip:false, wraps:'clamp', wrapt:'clamp' }))
        }
        if(!ao) {
            ao = mesh.uuid + '-ao'
            let image = pixel_texture(0, 0, 0)
            rawtexs.push(RawTexture.struct({ name:ao, image:image, flip:false, wraps:'clamp', wrapt:'clamp' }))
        }
        if(!emissive) {
            emissive = mesh.uuid + '-emissive'
            let image = pixel_texture(0, 0, 0)
            rawtexs.push(RawTexture.struct({ name:emissive, image:image, flip:false, wraps:'clamp', wrapt:'clamp' }))
        }
        return RawItem.struct({ name:mesh.name, skin:mesh.constructor.name === 'SkinnedMesh', color:color, normal:normal, ao:ao, emissive:emissive, mesh:geometry(mesh.geometry) })
    })
    let mixer = new three.AnimationMixer(scene)
    let rawanims = animations.map((animation:any, i) => {
        return new RawAnimation(animation.name, animation.duration, fpsv[i], animation_to_clips(scene, meshes, mixer, animation, fpsv[i]))
    })
    let raw = new Raw(rawitems, rawtexs, rawanims)
    return raw
}

export type rawfile = (path:string) => Promise<Raw>
export const rawfile:rawfile = async (path) => {
    let glb = await loadglb(path)
    return raw(glb.scene, glb.animations, Array.from(Array(glb.animations.length)).map(() => 60))
}

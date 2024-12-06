import {
    GFX,
    Wrap,
    Texture,
    Mesh,
    MeshData
} from '../types.js'

import {
    Raw,
    rawfile,
    geometry,
} from './model_raw.js'

export class Model { constructor(
    public clips:Array<ModelClip>,
    public items:Array<ModelItem>) {}
}

export class ModelClip { constructor(
    public name:string,
    public time:number) {}
}

export class ModelItem { constructor(
    public name:string,
    public mesh:Mesh,
    public skin:boolean,
    public clips:Array<Texture>,
    public color:Texture,
    public normal:Texture,
    public ao:Texture,
    public emissive:Texture) {}
}

type wrap = (kind:string) => Wrap
const wrap:wrap = (kind) => (() => {
    if(kind === 'clamp')  return kind
    if(kind === 'repeat') return kind
    if(kind === 'mirror') return kind
    throw new Error()
})()

type raw_model = (gfx:GFX, r:Raw) => Model
/**
 * @hidden
 */
export const raw_model:raw_model = (gfx, r) => {
    let texs = new Map<string, Texture>()
    r.textures.forEach((tex) => {
        return texs.set(tex.name, gfx.texture(tex.image, {
            width: tex.image.width,
            height: tex.image.height,
            flip: tex.flip,
            wraps: wrap(tex.wraps),
            wrapt: wrap(tex.wrapt)
        }))
    })
    let items = new Map<string, ModelItem>()
    r.items.forEach((item) => {
        let color = texs.get(item.color)
        let normal = texs.get(item.normal)
        let ao = texs.get(item.ao)
        let emissive = texs.get(item.emissive)
        if(!color || !normal || !ao || !emissive) {
            // console.log(color, normal, ao, emissive)
            throw new Error()
        }
        let model_item = new ModelItem(item.name, gfx.mesh(item.mesh), item.skin, new Array<Texture>(), color, normal, ao, emissive)
        return items.set(item.name, model_item)
    })
    let clips = ([] as Array<ModelClip>)
    r.anims.forEach((anim) => {
        clips.push(new ModelClip(anim.name, anim.time))
        return anim.clips.forEach((clip) => {
            let tex = gfx.texture(new Float32Array(clip.arraybuf))
            return items.get(clip.mesh)?.clips.push(tex)
        })
    })
    return new Model(clips, Array.from(items.values()))
}

type model = (gfx:GFX, path:string) => Promise<Model>
export const model:model = async (gfx, path) => {
    return raw_model(gfx, await rawfile(path))
}

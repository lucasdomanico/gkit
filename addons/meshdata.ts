import * as three from './three/three-v166/three.module.js'
import * as roundedboxgeo from './three/RoundedBoxGeometry.js'

import { geometry } from './model_raw.js'
import { MeshData } from '../types.js'

export const plane = () => {
    return geometry(new three.PlaneGeometry())
}

// export type sphere = () => MeshData
export const sphere = () => {
    return geometry(new three.SphereGeometry())
}

export const roundedbox = () => {
    return geometry(new roundedboxgeo.RoundedBoxGeometry())
}


type imgdata = (img:HTMLImageElement) => ImageData
const imgdata:imgdata = (img) => {
    let c = new OffscreenCanvas(img.width, img.height)
    let q = c.getContext('2d')
    if(!q) throw new Error()
    q.drawImage(img, 0, 0)
    return q.getImageData(0, 0, c.width, c.height)
}

type hmap_geometry = (w:number, h:number, data:Uint8ClampedArray) => three.BufferGeometry
const hmap_geometry:hmap_geometry = (w, h, data) => {
    let g = new three.PlaneGeometry(1, h / w, w - 1, h - 1)
    for(let y = 0; y < h; y += 1) {
        for(let x = 0; x < w; x += 1) {
            g.attributes.position.array[y * w * 3 + x * 3 + 2] = data[y * w * 4 + x * 4] / 255 * -1
        }
    }
    g.deleteAttribute('normal')
    g.computeVertexNormals()
    return g
}

type hmap = (img:HTMLImageElement) => MeshData
export const hmap:hmap = (img) => {
    let data = imgdata(img)
    return geometry(hmap_geometry(data.width, data.height, data.data))
}

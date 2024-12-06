import * as three from '../three/three-v166/three.module.js'
import * as csgx from '../three/cgs/CSG.js'

import { geometry } from '../model/raw.js'
import { MeshData } from '../types.js'
import { Mat4 } from '../addons/math.js'


export class CSG {
    constructor(
        public subtract: (b:CSG) => CSG,
        public meshdata: () => MeshData
    ) {}
}

class $CSGO extends CSG {
    constructor(
        public data:any
    ) {
        super(
            (b) => subtract(this, b),
            () => csgmesh(this)
        )
    }
}

// let csg = (meshdata:MeshData, m:Mat4):CSG => {
//     return new $CSGO(csgx.CSG.fromGeometry(meshdata))
// }

let to_geometry = (data:MeshData):three.BufferGeometry => {
    let g = new three.BufferGeometry()
    g.setIndex(data.indices)
    g.setAttribute('position', new three.BufferAttribute(data.positions, 3))    
    g.setAttribute('normal', new three.BufferAttribute(data.normals, 3))
    // g.setAttribute('uv', new three.BufferAttribute(data.uvs, 2))
    return g
}

export let csg = (geo:MeshData, m?:Mat4):CSG => {
    return new $CSGO(csgx.CSG.fromGeometry(to_geometry(geo)))
}

let subtract = (a:CSG, b:CSG):CSG => {
    if(a instanceof $CSGO && b instanceof $CSGO) {
        return new $CSGO(a.data.subtract(b.data))
    }
    throw new Error()
}

let csgmesh = (a:CSG):MeshData => {
    if(a instanceof $CSGO) {
        return geometry(a.data.toGeometry(new three.Matrix4()))
    }
    throw new Error()
}
import {
    App as PicoGLApp,
    Program as PicoGLProgram,
    Texture as PicoGLTexture,
    VertexArray as PicoGLVertexArray,
    VertexBuffer as PicoGLVertexBuffer,
    DrawCall as PicoGLDrawCall,
    Framebuffer as PicoGLFramebuffer,
    Renderbuffer as PicoGLRenderbuffer,
    PicoGL
} from './picogl/picogl.js'

import {
    MeshData,
    Mesh,
    Pixels,
    Wrap,
    Texture,
    Attachment,
    Uniform,
    UniformFloat,
    UniformInt,
    UniformArray,
    Blend,
    Cull,
    Buffer,
    DrawCall
} from './types.js'

import {
    mapget
} from './mapget.js'

import {
    prefix as shader_prefix
} from './shader.js'

export type VertexShader = string

export type PixelShader = string

export type Width = number

export type Height = number

export type IsData = boolean

export type Flip = boolean

export type MSAA = boolean

export type DepthAttachment = boolean

export type ColorAttachments = Array<Attachment>

export type Color = boolean

export type Depth = boolean

export type Instances = number

export type Mask = boolean

export class PeakMesh extends Mesh { constructor(
    mesh:Mesh,
    public vao:PicoGLVertexArray) {
        super(mesh.free)
    }
}

export class PeakTexture extends Texture { constructor(
    texture:Texture,
    public tex:PicoGLTexture) {
        super(texture.width, texture.height, texture.set, texture.free)
    }
}

export class DefaultFramebuffer {}

export type Framebuffer = (PicoGLFramebuffer | DefaultFramebuffer)

export type FunWidth = () => number

export type FunHeight = () => number

export type FunMesh = ($0:MeshData) => PeakMesh

export type FunProgram = ($0:VertexShader, $1:PixelShader) => PicoGLProgram

export type FunTexture = ($0:Pixels, $1:Width, $2:Height, $3:IsData, $4:Flip, $5:Wrap, $6:Wrap) => PeakTexture

export type FunFBO = ($0:Width, $1:Height, $2:MSAA, $3:DepthAttachment, $4:ColorAttachments) => PicoGLFramebuffer

export type FunClear = ($0:Framebuffer, $1:Color, $2:Depth) => void

export type FunBlit = ($0:Framebuffer, $1:Framebuffer, $2:Color, $3:Depth) => void

export type FunDraw = ($0:Framebuffer, $1:PeakMesh, $2:PicoGLProgram, $3:Map<string, Uniform>, $4:Instances, $5:Depth, $6:Mask, $7:Blend, $8:Cull, $9:Width, $10:Height) => void

export type FunFree = () => void

export class Peak { constructor(
    public width:FunWidth,
    public height:FunHeight,
    public mesh:FunMesh,
    public program:FunProgram,
    public texture:FunTexture,
    public fbo:FunFBO,
    public clear:FunClear,
    public blit:FunBlit,
    public draw:FunDraw,
    public free:FunFree) {}
    static struct = (o:{ width:FunWidth, height:FunHeight, mesh:FunMesh, program:FunProgram, texture:FunTexture, fbo:FunFBO, clear:FunClear, blit:FunBlit, draw:FunDraw, free:FunFree }) => {
        return new Peak(o.width, o.height, o.mesh, o.program, o.texture, o.fbo, o.clear, o.blit, o.draw, o.free)
    }
}

export class State { constructor(
    public app:PicoGLApp,
    public drawcalls:Map<PicoGLProgram, Map<PicoGLVertexArray, PicoGLDrawCall>>) {}
    static struct = (o:{ app:PicoGLApp, drawcalls:Map<PicoGLProgram, Map<PicoGLVertexArray, PicoGLDrawCall>> }) => {
        return new State(o.app, o.drawcalls)
    }
}

let Mesh_struct = (o:{ free:() => void }) => {
    return new Mesh(o.free)
}

let Texture_struct = (o:{ width:() => number, height:() => number, set:($0:Pixels) => void, free:() => void }) => {
    return new Texture(o.width, o.height, o.set, o.free)
}

export type width = (state:State) => FunWidth
export const width:width = (state) => () => {
    return state.app.width
}

export type height = (state:State) => FunHeight
export const height:height = (state) => () => {
    return state.app.height
}

export type mesh = (state:State) => FunMesh
export const mesh:mesh = (state) => (mesh_data) => {
    let vbufs = ([] as Array<PicoGLVertexBuffer>)
    let attr:($0:PicoGLVertexArray, $1:number, $2:number, $3:number, $4:ArrayBufferView, $5:boolean) => void = (vao, n, type, item_size, data, is_int) => {
        let buf = state.app.createVertexBuffer(type, item_size, data)
        vbufs.push(buf)
        let options = is_int? Object.fromEntries([['integer', PicoGL.VERTEX_ATTRIB_ARRAY_INTEGER]]) : undefined
        return vao.vertexAttributeBuffer(n, buf, options)
    }
    let u = PicoGL.UNSIGNED_INT
    let f = PicoGL.FLOAT
    let vao = state.app.createVertexArray()
    let ibuf = state.app.createIndexBuffer(u, 3, mesh_data.indices)
    vbufs.push(ibuf)
    vao.indexBuffer(ibuf)
    attr(vao, 0, f, 3, mesh_data.positions, false)
    attr(vao, 1, f, 2, mesh_data.uvs, false)
    attr(vao, 2, f, 3, mesh_data.normals, false)
    attr(vao, 3, f, 4, mesh_data.tangents, false)
    attr(vao, 4, u, 4, mesh_data.joints, true)
    attr(vao, 5, f, 4, mesh_data.weights, false)
    let mesh = Mesh_struct({ free:() => {
        vbufs.forEach((vbuf) => vbuf.delete())
        vbufs = []
        let values = Array.from(state.drawcalls.entries())
        values.forEach((value) => {
            let program = value[0]
            let m = value[1]
            return m.delete(vao)
        })
        return vao.delete()
    } })
    return new PeakMesh(mesh, vao)
}

export type program = (state:State) => FunProgram
export const program:program = (state) => (vertex, fragment) => {
    return state.app.createProgram(vertex, fragment)
}

export type texture = (state:State) => FunTexture
export const texture:texture = (state) => (pixels, w, h, isdata, flip, wraps, wrapt) => {
    let wrap:($0:Wrap) => number = (w) => {
        if(w === 'clamp')  return PicoGL.CLAMP_TO_EDGE
        if(w === 'repeat') return PicoGL.REPEAT
        if(w === 'mirror') return PicoGL.MIRRORED_REPEAT
        throw(w)
        return 0
    }
    let internal_format = pixels.constructor === Float32Array? PicoGL.RGBA32F : PicoGL.RGBA8
    let option_data = [['internalFormat', internal_format], ['minFilter', PicoGL.NEAREST], ['magFilter', PicoGL.NEAREST], ['wrapS', wrap(wraps)], ['wrapT', wrap(wrapt)]]
    let option_raw = [['internalFormat', internal_format], ['premultiplyAlpha', true], ['maxAnisotropy', PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY], ['flipY', flip], ['wrapS', wrap(wraps)], ['wrapT', wrap(wrapt)]]
    let options = isdata? option_data : option_raw
    let create_texture:() => PicoGLTexture = () => {
        if(pixels instanceof ImageBitmap && flip) {
            let c = document.createElement('canvas')
            c.width = pixels.width
            c.height = pixels.height
            c.getContext('2d')?.drawImage(pixels, 0, 0, c.width, c.height)
            pixels = c
        }
        if(pixels instanceof HTMLImageElement || pixels instanceof HTMLCanvasElement) {
            return state.app.createTexture2D(pixels as any, Object.fromEntries(options))
        }
        return state.app.createTexture2D(pixels as any, w, h, Object.fromEntries(options))
    }
    let tex = create_texture()
    let texture = Texture_struct({
        width:() => w,
        height:() => h,
        set:(pixels) => tex.data(pixels as any),
        free:() => tex.delete()
    })
    return new PeakTexture(texture, tex)
}

export type fbo = (state:State) => FunFBO
export const fbo:fbo = (state) => (w, h, msaa, depth, colors) => {
    let renderbuf:($0:number, $1:number, $2:number) => PicoGLRenderbuffer = (w, h, internal_format) => {
        return state.app.createRenderbuffer(w, h, internal_format, PicoGL.WEBGL_INFO.SAMPLES)
    }
    let fbo = state.app.createFramebuffer()
    if(depth) {
        let internal_format = PicoGL.DEPTH_COMPONENT32F
        let options = Object.fromEntries([['internalFormat', internal_format]])
        let target = msaa? renderbuf(w, h, internal_format) : state.app.createTexture2D(w, h, options)
        fbo.depthTarget(target)
    }
    colors.forEach((tex, index) => {
        let internal_format = tex === 'rgba32f'? PicoGL.RGBA32F : PicoGL.RGBA8
        let options = [['internalFormat', internal_format], ['premultiplyAlpha', true], ['flipY', true], ['wrapS', PicoGL.CLAMP_TO_EDGE], ['wrapT', PicoGL.CLAMP_TO_EDGE], ['maxAnisotropy', PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY]]
        let target = msaa? renderbuf(w, h, internal_format) : state.app.createTexture2D(w, h, Object.fromEntries(options))
        return fbo.colorTarget(index, target)
    })
    return fbo
}

export type clear = (state:State) => FunClear
export const clear:clear = (state) => (fbo, color, depth) => {
    let bits = PicoGL.STENCIL_BUFFER_BIT
    if(color) bits = bits | PicoGL.COLOR_BUFFER_BIT
    if(depth) bits = bits | PicoGL.DEPTH_BUFFER_BIT
    state.app.clearBits = bits
    state.app.depthMask(true)
    if(fbo instanceof DefaultFramebuffer) {
        state.app.defaultDrawFramebuffer()
    }
    else {
        state.app.drawFramebuffer(fbo)
    }
    return state.app.clearColor(0, 0, 0, 0).clear()
}

export type blit = (state:State) => FunBlit
export const blit:blit = (state) => (draw, read, color, depth) => {
    if(draw instanceof DefaultFramebuffer) {
        state.app.defaultDrawFramebuffer()
    }
    else {
        state.app.drawFramebuffer(draw)
    }
    if(read instanceof DefaultFramebuffer) {
        state.app.defaultReadFramebuffer()
    }
    else {
        state.app.readFramebuffer(read)
    }
    let mask = 0
    if(color) mask = mask | PicoGL.COLOR_BUFFER_BIT
    if(depth) mask = mask | PicoGL.DEPTH_BUFFER_BIT
    state.app.depthMask(true)
    return state.app.blitFramebuffer(mask)
}

export type draw = (state:State) => FunDraw
export const draw:draw = (state) => (fbo, mesh, program, uniforms, instances, depth, mask, blend, cull, w, h) => {
    let programs = mapget(state.drawcalls, program, () => new Map<PicoGLVertexArray, PicoGLDrawCall>())
    let drawcall = mapget(programs, mesh.vao, () => state.app.createDrawCall(program, mesh.vao))
    mesh.vao.numInstances = instances;
    (drawcall as any).numInstances[0] = instances
    let uniformv = Object.keys(program.uniforms)
    let samplerv = Object.keys((program as any).samplers)
    let has:($0:string) => boolean = (k) => uniformv.includes(k) || samplerv.includes(k)
    uniforms.forEach((uniform, key) => {
        if(!has(shader_prefix + key)) return
        if(uniform instanceof PeakTexture) {
            drawcall.texture(shader_prefix + key, uniform.tex)
            return
        }
        if(uniform instanceof UniformFloat) {
            drawcall.uniform(shader_prefix + key, uniform.f)
            return
        }
        if(uniform instanceof UniformInt) {
            drawcall.uniform(shader_prefix + key, uniform.i)
            return
        }
        if(uniform instanceof UniformArray) {
            drawcall.uniform(shader_prefix + key, uniform.value)
            return
        }
        if(typeof(uniform) === 'number') {
            drawcall.uniform(shader_prefix + key, uniform)
            return
        }
    })
    state.app.viewport(0, 0, w, h)
    if(depth) (state.app as any).depthTest()
    else (state.app as any).noDepthTest()
    state.app.depthFunc(PicoGL.LEQUAL)
    state.app.depthMask(mask)
    let one = PicoGL.ONE
    let one_minus_src_alpha = PicoGL.ONE_MINUS_SRC_ALPHA
    let dst_color = PicoGL.DST_COLOR
    let one_minus_src_color = PicoGL.ONE_MINUS_SRC_COLOR;
    (state.app as any).blend()
    if(blend === 'normal') {
        state.app.blendFuncSeparate(one, one_minus_src_alpha, one, one_minus_src_alpha)
    }
    if(blend === 'add') {
        state.app.blendFuncSeparate(one, one, one, one)
    }
    if(blend === 'multiply') {
        state.app.blendFuncSeparate(dst_color, one_minus_src_alpha, one, one_minus_src_alpha)
    }
    if(blend === 'screen') {
        state.app.blendFuncSeparate(one, one_minus_src_color, one, one_minus_src_alpha)
    }
    if(cull === 'none') {
        (state.app as any).drawBackfaces()
    }
    else {
        (state.app as any).cullBackfaces()
        if(cull === 'back') {
            state.app.gl.cullFace(PicoGL.BACK)
        }
        if(cull === 'front') {
            state.app.gl.cullFace(PicoGL.FRONT)
        }
        if(cull === 'both') {
            state.app.gl.cullFace(PicoGL.FRONT_AND_BACK)
        }
    }
    if(fbo instanceof DefaultFramebuffer) {
        state.app.defaultDrawFramebuffer()
    }
    else {
        state.app.drawFramebuffer(fbo)
    }
    return drawcall.draw()
}

export type free = (state:State) => FunFree
export const free:free = (state) => () => {
    return state.drawcalls = new Map()
}

export type peak = (canvas:HTMLCanvasElement) => Peak
export const peak:peak = (canvas) => {
    let app = PicoGL.createApp(canvas, Object.fromEntries([['alpha', true], ['antialias', true], ['depth', false], ['stencil', false], ['premultipliedAlpha', true]]))
    let state = new State(app, new Map())
    return new Peak(width(state), height(state), mesh(state), program(state), texture(state), fbo(state), clear(state), blit(state), draw(state), free(state))
}

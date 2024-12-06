import {
    MeshData,
    GFX,
    DrawCall,
    Uniform,
    UniformFloat,
    UniformInt,
    UniformArray,
    Texture,
    TextureOptions,
    Buffer,
    Mesh,
    Pixels,
    BufferOptions
} from './types.js'

import {
    DefaultFramebuffer,
    Framebuffer,
    PeakMesh,
    PeakTexture,
    peak as new_peak
} from './peak.js'

import {
    Program as PicoGLProgram,
    Texture as PicoGLTexture,
    Framebuffer as PicoGLFramebuffer
} from './picogl/picogl.js'

import {
    shader as create_shader
} from './shader.js'

import {
    mapget
} from './mapget.js'

type Shader = string

type ShaderId = string

type ShaderType = string

class MSAANone { constructor(
) {}
    static struct = (o:{  }) => {
        return new MSAANone()
    }
}

let GFX_struct = (o:{ width:() => number, height:() => number, mesh:($0:MeshData) => Mesh, buffer:($0?:BufferOptions) => Buffer, texture:($0:Pixels, $1?:TextureOptions) => Texture, flush:($0:Buffer) => void, free:() => void }) => {
    return new GFX(o.width, o.height, o.mesh, o.buffer, o.texture, o.flush, o.free)
}

let Buffer_struct = (o:{ width:() => number, height:() => number, draw:($0:DrawCall) => void, clear:($0?:boolean, $1?:boolean) => void, color:($0?:number) => Texture, depth:() => Texture, free:() => void }) => {
    return new Buffer(o.width, o.height, o.draw, o.clear, o.color, o.depth, o.free)
}

let Texture_struct = (o:{ width:() => number, height:() => number, set:($0:Pixels) => void, free:() => void }) => {
    return new Texture(o.width, o.height, o.set, o.free)
}

let u32 = Uint32Array

let f32 = Float32Array

let quad_mesh = new MeshData(
    new u32([0, 2, 1, 2, 3, 1]),
    new f32([-0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
    new f32([0, 1, 1, 1, 0, 0, 1, 0]),
    new f32([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
    new f32([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]),
    new u32([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    new f32([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
)

/**
 * Creates the graphics context
 * @param canvas
 * @returns 
 */
export const gfx = (canvas:HTMLCanvasElement):GFX => {
    let peak = new_peak(canvas)
    let quad = peak.mesh(quad_mesh)
    let programs = new Map<Shader, PicoGLProgram>()
    let draw:($0:Framebuffer, $1:number, $2:number, $3:DrawCall) => void = (fbo, w, h, dc) => {
        let dc_mesh = dc.mesh?? quad
        let dc_shader = dc.shader?? ''
        let dc_uniforms = dc.uniforms?? new Array<[string, Uniform]>()
        let dc_instances = dc.instances?? 1
        let dc_depth = dc.depth?? false
        let dc_mask = dc.mask?? true
        let dc_blend = dc.blend?? 'normal'
        let dc_cull = dc.cull?? 'back'
        let dc_clear = dc.clear?? false
        if(dc_clear) peak.clear(fbo, true, true)
        dc_uniforms.push(['aspect', new UniformFloat(w / h)])
        dc_uniforms.push(['instances', new UniformInt(dc_instances)])
        let types = ([] as Array<[ShaderId, ShaderType]>)
        dc_uniforms.forEach(([key, value]) => {
            let type = (() => {
                if(value instanceof Texture) {
                    return 'sampler2D'
                }
                if(value instanceof UniformFloat) {
                    return 'float'
                }
                if(value instanceof UniformInt) {
                    return 'int'
                }
                if(value instanceof UniformArray) {
                    return value.type
                }
                if(typeof(value) === 'number') {
                    return 'float'
                }
                throw new Error()
            })()
            return types.push([key, type])
        })
        let hash = types.flat().join(',')
        let program = mapget(programs, hash + dc_shader, () => {
            let shader = create_shader(dc_shader, types)
            return peak.program(shader[0], shader[1])
        })
        if(dc_mesh instanceof PeakMesh) {
            peak.draw(fbo, dc_mesh, program, new Map(dc_uniforms), dc_instances, dc_depth, dc_mask, dc_blend, dc_cull, w, h)
        }
    }
    // let new_drawcall:() => DrawCall = () => {
    //     return DrawCall.struct({ mesh:quad.mesh, shader:'', uniforms:new Map<string, Uniform>(), instances:1, depth:false, mask:true, blend:new BlendNormal(), cull:new CullBack(), clear:false })
    // }
    return GFX_struct({ free:() => {
        peak.free()
        quad.free()
        let values = Array.from(programs.values())
        values.forEach((pico_program) => pico_program.delete())
        return programs = new Map()
    }, width:() => {
        return peak.width()
    }, height:() => {
        return peak.height()
    }, flush:(buffer) => {
        return draw(new DefaultFramebuffer(), peak.width(), peak.height(), {
            clear: true,
            uniforms: [
                ['buf', buffer.color()]
            ],
            shader: `
                vec4 pixel(px p) {
                    return texture(p.buf, p.uv);
                }
            `
        })
    }, mesh:(mesh_data) => {
        return peak.mesh(mesh_data)
    }, texture:(pixels, texture_options_f) => {
        let isdata = pixels instanceof Float32Array
        let flip = isdata? false : true
        let w = -1
        let h = -1
        if(pixels instanceof HTMLVideoElement) {
            w = pixels.videoWidth
            h = pixels.videoHeight
        }
        if(pixels instanceof Float32Array) {
            let size = Math.ceil(Math.sqrt(pixels.length / 4))
            let v = new Float32Array(size * size * 4)
            v.set(pixels, 0)
            pixels = v
            w = size
            h = size
        }
        if(pixels instanceof HTMLCanvasElement) {
            w = pixels.width
            h = pixels.height
        }
        if(pixels instanceof HTMLImageElement) {
            w = pixels.width
            h = pixels.height
        }
        if(pixels instanceof ImageBitmap) {
            w = pixels.width
            h = pixels.height
        }
        if(pixels instanceof OffscreenCanvas) {
            w = pixels.width
            h = pixels.height
        }
        // let options = new TextureOptions(w, h, flip, new WrapClamp(), new WrapClamp())
        // if(texture_options_f) texture_options_f(options)
        let options_width = texture_options_f?.width?? w
        let options_height = texture_options_f?.height?? h
        let options_flip = texture_options_f?.flip?? flip
        let options_wraps = texture_options_f?.wraps?? 'clamp'
        let options_wrapt = texture_options_f?.wrapt?? 'clamp'
        if(options_width === -1 || options_height === -1) throw(w)
        return peak.texture(pixels, options_width, options_height, isdata, options_flip, options_wraps, options_wrapt)
    }, buffer:(buffer_options_f) => {
        let buffer_options_width = buffer_options_f?.width?? peak.width()
        let buffer_options_height = buffer_options_f?.height?? peak.height()
        let buffer_options_msaa = buffer_options_f?.msaa?? false
        let buffer_options_depth = buffer_options_f?.depth?? false
        let buffer_options_colors = buffer_options_f?.colors?? ['rgba8']        
        let fbo = peak.fbo(buffer_options_width, buffer_options_height, false, buffer_options_depth, buffer_options_colors)
        let msaa:(Framebuffer | MSAANone) = new MSAANone()
        if(buffer_options_msaa) {
            msaa = peak.fbo(buffer_options_width, buffer_options_height, true, buffer_options_depth, buffer_options_colors)
            peak.clear(msaa, true, true)
        }
        peak.clear(fbo, true, true)
        let online = false
        let sync = () => {
            if(msaa instanceof MSAANone) return
            if(online === false) {
                peak.blit(fbo, msaa, true, true)
                online = true
            }
        }
        let wrap_texture:($0:PicoGLTexture) => Texture = (picogl_texture) => {
            let texture = Texture_struct({ width:() => picogl_texture.width, height:() => picogl_texture.height, set:(pixels) => {
                throw(picogl_texture)
                return
            }, free:() => {
                throw(picogl_texture)
                return
            } })
            return new PeakTexture(texture, picogl_texture)
        }
        return Buffer_struct({ free:() => {
            let free_fbo:($0:PicoGLFramebuffer) => void = (fbo) => {
                if(fbo.depthAttachment) {
                    fbo.depthAttachment.delete()
                }
                fbo.colorAttachments.forEach((color_attachment) => {
                    return color_attachment.delete()
                })
                return fbo.delete()
            }
            free_fbo(fbo)
            if(msaa instanceof MSAANone === false && msaa instanceof DefaultFramebuffer === false) {
                free_fbo(msaa)
            }
        }, width:() => {
            return buffer_options_width
        }, height:() => {
            return buffer_options_height
        }, color:(n = 0) => {
            sync()
            return wrap_texture(fbo.colorAttachments[n])
        }, depth:() => {
            sync()
            return wrap_texture(fbo.depthAttachment as any)
        }, clear:(color = true, depth = true) => {
            online = true
            if(msaa instanceof MSAANone === false) {
                peak.clear(msaa, color, depth)
            }
            return peak.clear(fbo, color, depth)
        }, draw:(drawcall) => {
            // let drawcall = new_drawcall()
            // drawcall_f(drawcall)
            online = false
            if(msaa instanceof MSAANone === false) {
                draw(msaa, buffer_options_width, buffer_options_height, drawcall)
            }
            else {
                draw(fbo, buffer_options_width, buffer_options_height, drawcall)
            }
        } })
    } })
}

import {
    Buffer,
    Texture,
    UniformFloat,
    Pixels,
    Uniform,
    GFX,
    Mesh,
    MeshData,
    Wrap,
} from '../gkit.js'

type wave = (t:number) => number
/**
 * @ignore
 */
export const wave:wave = (t) => {
    return Math.sin(t * Math.PI * 2 - Math.PI * 0.5) * 0.5 + 0.5
}

type rescale = (x:number, amin:number, amax:number, bmin:number, bmax:number) => number
/**
 * @ignore
 * @param x 
 * @param amin 
 * @param amax 
 * @param bmin 
 * @param bmax 
 * @returns 
 */
export const rescale:rescale = (x, amin, amax, bmin, bmax) => {
    let a = amax - amin
    let b = bmax - bmin
    return (x - amin) * b / a + bmin
}

/**
 * @ignore
 * @param x 
 * @param min 
 * @param max 
 * @returns 
 */
export let clamp = (x:number, min:number = 0, max:number = 1) => {
    if(x < min) return min
    if(x > max) return max
    return x
}






/**
 * @ignore
 */
export class Animation<T> {
    constructor(
        public secs:number,
        public frames:Array<T>,
        public index:(time:number) => T = (time) => {
            return this.frames[Math.round(rescale(time % secs, 0, secs, 0, this.frames.length))]
        }
    ) {}
}

/**
 * @ignore
 */
export class AnimationArgs {
    constructor(
        public time:number,
        public delta:number,
        public secs:number,
        public fps:number
    ) {}
}

/**
 * @ignore
 * @param secs 
 * @param fps 
 * @param f 
 * @returns 
 */
export let animation = <T>(secs:number, fps:number, f:(time:number, a:AnimationArgs) => T) => {
    let time = 0
    let delta = 1 / fps
    let frames = Array.from(Array(fps * secs)).map(() => {
        time += delta
        return f(time, new AnimationArgs(time, delta, secs, fps))
    })
    return new Animation(secs, frames)
}




// export class AttachmentEnum {
//     constructor(
//         public truee = new WrapClamp(),
//         public repeat = new WrapRepeat(),
//         public mirror = new WrapMirror()
//     ) {}
// }


// type AtlasMap = <T,>(f:(pixels:OffscreenCanvas) => T) => Array<Array<T>>

// export class Atlas {
//     constructor(
//         public table:Array<Array<OffscreenCanvas>>,
//         // public textures:(tex:(pixels:Pixels) => Texture) => Array<Array<Texture>> = (tex) => {
//         //     let r = new Array<Array<Texture>>()
//         //     for(let i = 0; i < this.table.length; i++) {
//         //         let row = new Array<Texture>()
//         //         for(let j = 0; j < this.table[i].length; j++) {
//         //             row.push(tex(this.table[i][j]))
//         //         }
//         //         r.push(row)
//         //     }
//         //     return r
//         // },
//         public map:AtlasMap = (f) => {
//             return atlas_map(this.table, f)
//         }
//     ) {}
// }

// let atlas_map = <T,>(table:Array<Array<OffscreenCanvas>>, f:(pixels:OffscreenCanvas) => T):Array<Array<T>> => {
//     let r = new Array<Array<T>>()
//     for(let i = 0; i < table.length; i++) {
//         let row = new Array<T>()
//         for(let j = 0; j < table[i].length; j++) {
//             row.push(f(table[i][j]))
//         }
//         r.push(row)
//     }
//     return r
// }

/**
 * @ignore
 * @param img 
 * @param sizex 
 * @param sizey 
 * @returns 
 */
export let atlas = (img:HTMLImageElement, sizex:number, sizey:number = sizex) => {
    let r = new Array<Array<OffscreenCanvas>>()
    for(let y = 0; y < img.height; y += sizey) {
        let row = new Array<OffscreenCanvas>()
        for(let x = 0; x < img.width; x += sizex) {
            let c = new OffscreenCanvas(sizex, sizey)
            c.getContext('2d')?.drawImage(img, x, y, sizex, sizey, 0, 0, c.width, c.height)
            row.push(c)
        }
        r.push(row)
    }
    return r
    // return new Atlas(r)
}

// export let mapget = <K, T,>(map:Map<K,T>, key:K):T => {
//     let r = map.get(key)
//     if(r === undefined) {
//         throw new Error()
//     }
//     return r
// }

// './disp.raw.js'
//     disp_raw disp
// Buffer Texture void
// blit buf tex
//     buf.draw(\_
//         _.uniforms.set('tex' tex)
//         _.shader := '''
//             vec4 pixel(px p) {
//                 return texture(p.tex, p.uv);
//             }
//         '''
//     )
// Buffer num void
// noise b n
//     b.draw(\_
//         _.uniforms.set('n' n)
//         _.shader := '''
//             float vnoise_F(vec2 p) {
//                 #define rand(f) fract(sin(f) * 10000.)   
//                 #define rand2d(x, y) rand(x + y * 100.)    // OG 10000.
//                 float sw = rand2d(floor(p.x), floor(p.y));
//                 float se = rand2d(ceil(p.x),  floor(p.y));
//                 float nw = rand2d(floor(p.x), ceil(p.y));
//                 float ne = rand2d(ceil(p.x),  ceil(p.y));
//                 #undef rand
//                 #undef rand2d
//                 vec2 inter = smoothstep(0., 1., fract(p));
//                 float s = mix(sw, se, inter.x);
//                 float n = mix(nw, ne, inter.x);
//                 return mix(s, n, inter.y);
//             }
//             // float fbm(vec2 p) {
//             //     float total = 0.0;
//             //     total += vnoise(p);
//             //     total += vnoise(p * 2.) / 2.;
//             //     total += vnoise(p * 4.) / 4.;
//             //     total += vnoise(p * 8.) / 8.;
//             //     total += vnoise(p * 16.) / 16.;
//             //     total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;
//             //     return total;
//             // }
//             float vnoise(vec2 p, int octs) {
//                 float total = 0.;
//                 float div = 0.;
//                 for(int i = 0; i < octs; i++) {
//                     float mul = pow(2., float(i));
//                     total += vnoise_F(p * mul) / mul;
//                     div += 1. / mul;
//                 }
//                 return total / div;
//             }
//             vec4 pixel(px p) {
//                 float f = vnoise(p.uv * p.n, 5);
//                 return vec4(f, f, f, 1);
//             }
//         '''
//     )
// int int Promise(HTMLImageElement)
// disp w h
//     if w != 512 || h != 512
//         throw(Error())
//     image(disp_raw)
type image = (src:string) => Promise<HTMLImageElement>
export const image:image = (src) => {
    return new Promise((resolve, reject) => {
        let img:HTMLImageElement = new Image()
        img.onload = () => resolve(img)
        img.onerror = (e:any) => reject(new Error(e))
        return img.src = src
    })
}

export class BlitOptions { constructor(
    public width?:number,
    public height?:number,
    public rz?:number,
    public px?:number,
    public py?:number,
    public alpha?:number
    ) {}
}

/**
 * @param buf
 * @param tex 
 * @param x 
 * @param y 
 * @param options 
 * @returns 
 */
export const blit = (buf:Buffer, tex:Texture, x:number = 0, y:number = 0, options?:BlitOptions) => {
    let w = options?.width?? tex.width()
    let h = options?.height?? tex.height()
    let r = options?.rz?? 0
    let px = options?.px?? 0
    let py = options?.py?? 0
    let a = options?.alpha?? 1
    let bufw = buf.width()
    let bufh = buf.height()
    return buf.draw({
        uniforms: [
            ['bufw', new UniformFloat(bufw)],
            ['bufh', new UniformFloat(bufh)],
            ['x', new UniformFloat(x)],
            ['y', new UniformFloat(y)],
            ['w', new UniformFloat(w)],
            ['h', new UniformFloat(h)],
            ['r', new UniformFloat(r)],
            ['px', new UniformFloat(px)],
            ['py', new UniformFloat(py)],
            ['a', new UniformFloat(a)],
            ['tex', tex]
        ],
        shader: `
            mat4 vertex(vx v) {
                return sprite(v.bufw, v.bufh, v.x, v.y, v.w, v.h, v.r, v.px, v.py);
            }
            vec4 pixel(px p) {
                return texture(p.tex, p.uv) * p.a;
            }
        `
    })
}

type blur = (img:Texture, bufa:Buffer, bufb:Buffer, cycles:number, strength:number) => void
/**
 * @param img 
 * @param bufa 
 * @param bufb 
 * @param cycles 
 * @param strength 
 */
export const blur:blur = (img, bufa, bufb, cycles, strength) => {
    let a = bufa
    let b = bufb
    let sx = strength
    let sy = strength * (img.width() / img.height())
    a.draw({
        clear: true,
        uniforms: [
            ['img', img]
        ],
        shader: `
            vec4 pixel(px p) {
                return texture(p.img, p.uv);
            }
        `
    })
    for(let i = 0; i < cycles; i += 1) {
        b.draw({
            clear: true,
            uniforms: [
                ['img', a.color(0)],
                ['sx', sx]
            ],
            shader: `
                vec4 pixel(px p) {
                    return hblur(p.img, p.uv, p.sx);
                }
            `
        })
        a.draw({
            clear: true,
            uniforms: [
                ['img', b.color(0)],
                ['sy', sy]    
            ],
            shader: `
                vec4 pixel(px p) {
                    return vblur(p.img, p.uv, p.sy);
                }
            `
        })
    }
}

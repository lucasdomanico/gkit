type $assert = <T>(value:T | undefined | null) => T
const $assert = <T>(value:T | undefined | null):T => {
    if(!value) {
        throw(new Error())
    }
    return value
}

import {
    Input,
    KeyEvent,
    PtrEvent,
    ClickEvent,
    Tick,
    App,
} from './run.js'

export let fps = 60

export let length = fps * 5

export let quality = 0.5

export let bps = 1024 * 1024 * 200

// array(HTMLCanvasElement) int array(HTMLCanvasElement)
// fade canvasv length
//     framec 0
//     canvasv.slice(length).map(\c i
//         if i > canvasv.length - length * 2
//             t canvasv[framec]
//             framec += 1
//             x assert(c.getContext('2d'))
//             x.globalAlpha := framec / length
//             x.drawImage(t 0 0)
//         c
//     )
// tuple(num num num num) tuple(num num num num) fun(num num num) tuple(num num num num)
// blend dca sca f
//     # sc iif sca[3] == 0 [0 0 0] [sca[0] / sca[3], sca[1] / sca[3], sca[2] / sca[3]]
//     # dc iif dca[3] == 0 [0 0 0] [dca[0] / dca[3], dca[1] / dca[3], dca[2] / dca[3]]
//     sc iif sca[3] == 0 [0 0 0] [sca[0] sca[1] sca[2]]
//     dc iif dca[3] == 0 [0 0 0] [dca[0] dca[1] dca[2]]
//     sa sca[3]
//     da dca[3]
//     x 1
//     y 1
//     z 1
//     r f(dc[0] sc[0]) * sa * da + y * sca[0] * (1 - da) + z * dca[0] * (1 - sa)
//     g f(dc[1] sc[1]) * sa * da + y * sca[1] * (1 - da) + z * dca[1] * (1 - sa)
//     b f(dc[2] sc[2]) * sa * da + y * sca[2] * (1 - da) + z * dca[2] * (1 - sa)
//     a x * sa * da  + y * sa * (1 - da) + z * da * (1 - sa)
//     [r g b a]
export type fade = (canvasv:Array<HTMLCanvasElement>, length:number) => Array<HTMLCanvasElement>
export const fade:fade = (canvasv, length) => {
    let framec = 0
    let cs = canvasv.slice(length).map((c, i) => {
        if(i > canvasv.length - length * 2) {
            let t = canvasv[framec]
            framec += 1
            let dst = $assert(c.getContext('2d')).getImageData(0, 0, c.width, c.height)
            let src = $assert(t.getContext('2d')).getImageData(0, 0, t.width, t.height)
            for(let i = 0; i < dst.data.length; i += 4) {
                let f = framec / length
                let s:[number, number, number, number] = [src.data[i] / 255, src.data[i + 1] / 255, src.data[i + 2] / 255, src.data[i + 3] / 255]
                let d:[number, number, number, number] = [dst.data[i] / 255, dst.data[i + 1] / 255, dst.data[i + 2] / 255, dst.data[i + 3] / 255]
                let r = [d[0] * (1 - f) + s[0] * f, d[1] * (1 - f) + s[1] * f, d[2] * (1 - f) + s[2] * f, d[3] * (1 - f) + s[3] * f]
                // r blend(d s \d s\ d * (1 - f) + (s * f))
                dst.data[i + 0] = r[0] * 255
                dst.data[i + 1] = r[1] * 255
                dst.data[i + 2] = r[2] * 255
                dst.data[i + 3] = r[3] * 255
            }
            $assert(c.getContext('2d')).putImageData(dst, 0, 0)
        }
        return c
    })
    return cs
}

// cs.slice(cs.length - length).concat(cs.slice(0 cs.length - length * 2))
export type encode = (canvasv:Array<HTMLCanvasElement>, w:number, h:number) => void
export const encode:encode = (canvasv, w, h) => {
    let out = document.createElement('canvas')
    out.width = w
    out.height = h
    $assert(out.getContext('2d')).drawImage(canvasv[0], 0, 0)
    // recorder MediaRecorder(out.captureStream(fps) Object.fromEntries([['mimeType' 'video/webm']]))
    let recorder = new MediaRecorder(out.captureStream(fps), Object.fromEntries([['mimeType', 'video/webm;codecs=h264,opus'], ['bitsPerSecond', bps], ['videoBitsPerSecond', bps]]))
    let chunks = ([] as Array<Blob>)
    recorder.ondataavailable = (e) => {
        if(e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
        let blob = new Blob(chunks, Object.fromEntries([['type', 'video/webm']]))
        let url = URL.createObjectURL(blob)
        let video = document.createElement('video')
        video.src = url
        video.controls = true
        video.loop = true
        video.style.position = 'absolute'
        video.style.top = '0'
        video.style.right = '1.5%'
        video.style.width = '40%'
        return document.body.append(video)
    }
    recorder.onstart = () => {
        console.log('START')
        let framec = 0
        let frame = () => {
            console.log(framec)
            if(framec >= canvasv.length) {
                recorder.stop()
                return
            }
            $assert(out.getContext('2d')).clearRect(0, 0, out.width, out.height)
            $assert(out.getContext('2d')).drawImage(canvasv[framec], 0, 0)
            framec += 1
            return setTimeout(frame, 1000 / fps)
        }
        return frame()
    }
    return recorder.start(1000 / fps)
}

export type canvas = (c:HTMLCanvasElement) => ($0:number, $1:number) => HTMLCanvasElement
export const canvas:canvas = (c) => (w, h) => {
    c.width = w
    c.height = h
    return c
}

export type tick = (canvas:HTMLCanvasElement, $0:Tick) => void
export const tick:tick = (canvas, f) => {
    let canvasv = ([] as Array<HTMLCanvasElement>)
    let animate = async () => {
        if(canvasv.length < length) {
            console.log(canvasv.length)
            // assert(canvas.getContext('2d')).clearRect(0 0 canvas.width canvas.height)
            let input = new Input((1000 / fps) * canvasv.length * 0.001, (1 / fps), () => false, ([] as Array<KeyEvent>), ([] as Array<PtrEvent>), ([] as Array<ClickEvent>))
            await f(input)
            let c = document.createElement('canvas')
            c.width = canvas.width * quality
            c.height = canvas.height * quality
            $assert(c.getContext('2d')).drawImage(canvas, 0, 0, c.width, c.height)
            canvasv.push(c)
            requestAnimationFrame(animate)
            return
        }
        return encode(fade(canvasv, fps), canvas.width * quality, canvas.height * quality)
    }
    return animate()
}

export const record = async (sketch:App, path:string = '') => {
    let c = document.createElement('canvas')
    let t = await sketch(path, canvas(c), (f) => {
        // tick(c, f)
    })
    if(t) tick(c, t)
}


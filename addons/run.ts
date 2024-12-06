class Events { constructor(
    public keys:Array<KeyEvent>,
    public ptrs:Array<PtrEvent>,
    public clicks:Array<ClickEvent>
    ) {}
}

export class KeyEvent { constructor(
    public time:number,
    public mods:Array<string>,
    public action:'down' | 'up',
    public code:string,
    public key:string
    ) {}
}

export class PtrEvent { constructor(
    public time:number,
    public mods:Array<string>,
    public action:'up' | 'down' | 'move',
    public device:string,
    public id:number,
    public x:number,
    public y:number,
    public button:number,
    public buttons:Array<boolean>,
    public pressure:number
    ) {}
}

export class ClickEvent { constructor(
    public time:number,
    public mods:Array<string>,
    public x:number,
    public y:number,
    public double:boolean
    ) {}
}

type key_event = (e:KeyboardEvent, action:('down' | 'up')) => KeyEvent
const key_event:key_event = (e, action) => {
    return new KeyEvent(Date.now(), [], action, e.code, e.key)
}

type ptr_event = (e:PointerEvent, action:('down' | 'up' | 'move'), view:HTMLElement) => PtrEvent
const ptr_event:ptr_event = (e, action, view) => {
    let device = e.pointerType
    let id = e.pointerId
    let bc = view.getBoundingClientRect()
    let x = (e.x - bc.x) / bc.width
    let y = (e.y - bc.y) / bc.height
    return new PtrEvent(Date.now(), [], action, device, id, x, y, e.button, [], e.pressure)
}

type click_event = (e:MouseEvent, double:boolean, view:HTMLElement) => ClickEvent
const click_event:click_event = (e, double, view) => {
    let bc = view.getBoundingClientRect()
    let x = (e.x - bc.x) / bc.width
    let y = (e.y - bc.y) / bc.height
    return new ClickEvent(Date.now(), [], x, y, double)
}

type events = (win:Window, doc:Document, view:HTMLElement) => () => Events
const events:events = (win, doc, view) => {
    let keysdown = new Map<string, boolean>()
    let keys = ([] as Array<KeyEvent>)
    let ptrs = ([] as Array<PtrEvent>)
    let clicks = ([] as Array<ClickEvent>)
    win.addEventListener('keydown', (e) => {
        if(keysdown.has(e.code)) return
        keys.push(key_event(e, 'down'))
        keysdown.set(e.code, true)
    })
    win.addEventListener('keyup', (e) => {
        keys.push(key_event(e, 'up'))
        keysdown.delete(e.code)
    })
    doc.addEventListener('pointerdown', (e) => ptrs.push(ptr_event(e, 'down', view)))
    doc.addEventListener('pointerup',   (e) => ptrs.push(ptr_event(e, 'up', view)))
    doc.addEventListener('pointermove', (e) => ptrs.push(ptr_event(e, 'move', view)))
    doc.addEventListener('click',       (e) => clicks.push(click_event(e, false, view)))
    doc.addEventListener('dblclick',    (e) => clicks.push(click_event(e, true, view)))
    return () => {
        let events = new Events(keys, ptrs, clicks)
        keys = []
        ptrs = []
        clicks = []
        return events
    }
}

export class Input { constructor(
    public time:number,
    public delta:number,
    public key:(code:string) => boolean,
    public keys:Array<KeyEvent>,
    public ptrs:Array<PtrEvent>,
    public clicks:Array<ClickEvent>
    ) {}
}

type keystate = (m:Map<string, boolean>, keys:Array<KeyEvent>) => void
const keystate:keystate = (m, keys) => {
    keys.forEach((key) => {
        if(key.action === 'down') m.set(key.code, true)
        if(key.action === 'up')   m.set(key.code, false)
    })
}

export type Tick = (input:Input) => Promise<void | boolean>

type ticker = (win:Window, doc:Document, view:HTMLElement, f:Tick, show_fps:boolean) => void
const ticker:ticker = (win, doc, view, f, show_fps) => {
    let fps = 0
    let time = Date.now()
    let delta = time
    let esync = events(win, doc, view)
    let keys = new Map<string, boolean>()
    let animate = async () => {
        let now = Date.now()
        let t = (now - time) * 0.001
        let r = (now - delta) * 0.001
        delta = now
        fps += 1
        let e = esync()
        keystate(keys, e.keys)
        let input = new Input(t, r, (code) => keys.get(code)? true : false, e.keys, e.ptrs, e.clicks)
        let call = await f(input)
        if(call === false) return
        requestAnimationFrame(animate)
        // setTimeout(animate 1000 / 10)
    }
    animate()
    if(show_fps) {
        setInterval(() => {
            console.log(fps)
            fps = 0
        }, 1000)    
    }
}

type canvas = (c:HTMLCanvasElement) => ($0:number, $1:number) => HTMLCanvasElement
const canvas:canvas = (c) => (w, h) => {
    c.width = w
    c.height = h
    return c
}

export type App = (path:string, canvas:(width:number, height:number) => HTMLCanvasElement, tick:(f:Tick) => void) => Promise<void | Tick>

// export class AppOptions { constructor(
//     ) {}
// }

export const run = async (app:App) => {
    let path = ''
    let c = document.createElement('canvas')
    c.style.position = 'absolute'
    c.style.top = '0'
    c.style.right = '1.5%'
    c.style.border = '2px solid black'
    c.style.width = '40%'
    document.body.append(c)
    let t = await app(path, canvas(c), (f) => {
        ticker(window, document, c, f, false)
    })
    if(t) ticker(window, document, c, t, true)
}


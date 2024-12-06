export class GFX { constructor(
    public width:() => number,
    public height:() => number,
    public mesh:(data:MeshData) => Mesh,
    public buffer:(options?:BufferOptions) => Buffer,
    public texture:(pixels:Pixels, options?:TextureOptions) => Texture,
    public flush:(buffer:Buffer) => void,
    public free:() => void) {}
}

export class Buffer { constructor(
    public width:() => number,
    public height:() => number,
    public draw:(drawcall:DrawCall) => void,
    public clear:(color?:boolean, depth?:boolean) => void,
    public color:(n?:number) => Texture,
    public depth:() => Texture,
    public free:() => void) {}
}

export class Texture { constructor(
    public width:() => number,
    public height:() => number,
    public set:(pixels:Pixels) => void,
    public free:() => void) {}
}

export class Mesh { constructor(
    public free:() => void) {}
}

export class DrawCall { constructor(
    public mesh?:Mesh,
    public shader?:string,
    public uniforms?:Array<[string, Uniform]>,
    public instances?:number,
    public depth?:boolean,
    public mask?:boolean,
    public blend?:Blend,
    public cull?:Cull,
    public clear?:boolean) {}
}

export class BufferOptions { constructor(
    public width?:number,
    public height?:number,
    public msaa?:boolean,
    public depth?:boolean,
    public colors?:Array<Attachment>) {}
}

export class TextureOptions { constructor(
    public width?:number,
    public height?:number,
    public flip?:boolean,
    public wraps?:Wrap,
    public wrapt?:Wrap) {}
}

export class MeshData { constructor(
    public indices:Uint32Array,
    public positions:Float32Array,
    public uvs:Float32Array,
    public normals:Float32Array,
    public tangents:Float32Array,
    public joints:Uint32Array,
    public weights:Float32Array) {}
}

export type Pixels = (
    Uint8Array |
    Float32Array |
    HTMLImageElement |
    HTMLCanvasElement |
    HTMLVideoElement |
    ImageData |
    ImageBitmap |
    OffscreenCanvas
)

export type Attachment = 'rgba8' | 'rgba32f'

export type Uniform = (Texture | UniformFloat | UniformInt | UniformArray | number)

export class UniformFloat { constructor(
    public f:number) {}
}

export class UniformInt { constructor(
    public i:number) {}
}

export class UniformArray { constructor(
    public type:string,
    public value:Array<number>) {}
}

export type Blend = 'normal' | 'add' | 'multiply' | 'screen'

export type Cull = 'back' | 'front' | 'both' | 'none'

export type Wrap = 'clamp' | 'repeat' | 'mirror'

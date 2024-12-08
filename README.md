# GKit

An alternative Web graphics kit

[API](https://lucasdomanico.github.io/gkit/functions/gfx.gfx.html) Docs

Usage:
```ts
    import { gfx } from './gkit/gkit.js'
    let g = gfx(canvas)
    let buf = g.buffer()
    buf.draw({
        shader: `
            vec4 pixel(px p) {
                return vec4(p.uv.x, p.uv.y, 0, 1);
            }
        `
    })
    g.flush(buf)
```


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_0_candlestick/video.gif" width="300"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_0_candlestick/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_1_linda/video.gif" width="300"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_1_linda/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_2_martha/video.gif" width="300"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_2_martha/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_3_love/video.gif" width="300"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_3_love/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_4_revolver/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_4_revolver/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_5_selfie/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_5_selfie/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_6_glasses/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_6_glasses/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_7_clock/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_7_clock/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_8_dali/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_8_dali/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_9_paulslide/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_9_paulslide/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_11_john_horizon_friendly/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_11_john_horizon_friendly/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_12_abbey_road/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_12_abbey_road/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_13_george_rgbshift/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_13_george_rgbshift/main.ts)


<img src="https://raw.githubusercontent.com/lucasdomanico/gkit-examples/refs/heads/main/beatles_14_paul_altas/video.gif" width="200"/>

[Source Code](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_14_paul_altas/main.ts)


© 2025 - Lucas Domanico
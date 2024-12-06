# Gkit


An alternative to Three.js

## [API](https://lucasdomanico.github.io/gkit/classes/types.GFX.html) Docs

```ts
    import { gfx } from './gkit/'
    let g = gfx(canvas)
    let buf = g.buffer()
    buf.draw({
        shader: `
            vec4 pixel(px p) {
                return vec4(p.uv.x, p.uv.y, 0, 1);
            }
        `
    })
    g.flush(buf.color())
```

Examples:\
    [Arwing](https://github.com/lucasdomanico/gkit-examples/blob/main/arwing/main.ts)
    |
    [Atlas](https://github.com/lucasdomanico/gkit-examples/blob/main/atlas/main.ts)
    |
    [Candlestick Park](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_0_candlestick/main.ts)
    |
    [Revolver](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_4_revolver/main.ts)
    |
    [Selfie](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_5_selfie/main.ts)
    |
    [Glasses](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_6_glasses/main.ts)
    |
    [Clock](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_7_clock/main.ts)
    |
    [Dali](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_8_dali/main.ts)
    |
    [PaulSlide](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_9_paulslide/main.ts)
    |
    [John Horizon](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_11_john_horizon_friendly/main.ts)
    |
    [Abbey Road](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_12_abbey_road/main.ts)
    |
    [George RGB Shift](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_13_george_rgbshift/main.ts)
    |
    [Paul Atlas](https://github.com/lucasdomanico/gkit-examples/blob/main/beatles_14_paul_altas/main.ts)
    |
    [BoomBox](https://github.com/lucasdomanico/gkit-examples/blob/main/boombox/main.ts)
    |
    [Bot](https://github.com/lucasdomanico/gkit-examples/blob/main/bot/main.ts)
    |
    [Drive](https://github.com/lucasdomanico/gkit-examples/blob/main/drive/main.ts)
    |
    [Droid](https://github.com/lucasdomanico/gkit-examples/blob/main/droid_shadow_reflect/main.ts)
    |
    [Ex Disp](https://github.com/lucasdomanico/gkit-examples/blob/main/ex_disp/main.ts)
    |
    [Ex FBM](https://github.com/lucasdomanico/gkit-examples/blob/main/ex_fmb/main.ts)
    |
    [Ex Junk](https://github.com/lucasdomanico/gkit-examples/blob/main/ex_junk/main.ts)
    |
    [Ex List](https://github.com/lucasdomanico/gkit-examples/blob/main/ex_list/main.ts)
    |
    [Ex Test](https://github.com/lucasdomanico/gkit-examples/blob/main/ex_test/main.ts)
    |
    [Frog](https://github.com/lucasdomanico/gkit-examples/blob/main/frog/main.ts)
    |
    [Helmet](https://github.com/lucasdomanico/gkit-examples/blob/main/helmet_bloom_fps_lib/main.ts)
    |
    [HMap](https://github.com/lucasdomanico/gkit-examples/blob/main/hmap/main.ts)
    |
    [InstanceOf](https://github.com/lucasdomanico/gkit-examples/blob/main/instanceof/main.ts)
    |
    [Loading](https://github.com/lucasdomanico/gkit-examples/blob/main/loading_4/main.ts)
    |
    [Mario](https://github.com/lucasdomanico/gkit-examples/blob/main/mario_metal/main.ts)
    |
    [MatCap](https://github.com/lucasdomanico/gkit-examples/blob/main/matcap/main.ts)
    |
    [Outline](https://github.com/lucasdomanico/gkit-examples/blob/main/outline/main.ts)
    |
    [Phoenix](https://github.com/lucasdomanico/gkit-examples/blob/main/phoenix/main.ts)
    |
    [Soldier](https://github.com/lucasdomanico/gkit-examples/blob/main/soldier/main.ts)
    |
    [Particles](https://github.com/lucasdomanico/gkit-examples/blob/main/stroke_emit/main.ts)
    |
    [Tokyo](https://github.com/lucasdomanico/gkit-examples/blob/main/tokyo/main.ts)
    |
    [Video](https://github.com/lucasdomanico/gkit-examples/blob/main/video_test/main.ts)

## Watch [Videos](https://www.instagram.com/beatmemoart)

© 2025 - Lucas Domanico
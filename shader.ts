export let prefix = 'x_'

let math = `
    const float pi = 3.1415926535897932384626433832795;
    // https://en.wikipedia.org/wiki/Waveform
    // #define sine(x)     smoothstep(0., 1., wave(x))
    // #define square(x)   step(0.5, wave(x))
    // #define sawtooth(x) mod(wave(x), 1.)
    float priv_lwave(float t) {
        return 1. - abs(mod(t, 1.) * 2. - 1.);
    }
    float wave(float t) {
        return smoothstep(0., 1., priv_lwave(t));
        // not the same: ...
        // return sin(t * pi * 2. - pi * 0.5) * 0.5 + 0.5; // CHECK
    }
    /*
        vec2 bezier(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
            return pow(1. - t, 3.) * a + 3. * pow(1. - t, 2.) * t * b + 3. * (1. - t) * pow(t, 2.) * c + pow(t, 3.) * d;
        }
        float ease(float x, float y, float a, float b, float t) {
            return bezier(vec2(0.), vec2(x, y), vec2(a, b), vec2(1.), t).y;
        }
    */
    // rescale: a/b == rescale(a, 0, b, 0, 1)
    float rescale(float x, float amin, float amax, float bmin, float bmax) {
        float a = amax - amin;
        float b = bmax - bmin;
        return (x - amin) * b / a + bmin;
    }
    // float range(float amin, float amax, float bmin, float bmax, float x) {
    //     float a = amax - amin;
    //     float b = bmax - bmin;
    //     return (x - amin) * b / a + bmin;
    // }
`
let matrices = `
    mat4 translate(float x, float y, float z) {
        return mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
    }
    mat4 rotatex(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat4(
            1, 0, 0, 0,
            0, c, s, 0,
            0,-s, c, 0,
            0, 0, 0, 1
        );
    }
    mat4 rotatey(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat4(
            c, 0,-s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
    }
    mat4 rotatez(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat4(
            c, s, 0, 0,
           -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }
    mat4 scale(float x, float y, float z) {
        return mat4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    }


    float hfov2v(float hfov, float aspect) {
        return 2. * atan(tan(hfov * 0.5) / aspect);
    }
    float vfov2h(float vfov, float aspect) {
        return 2. * atan(tan(vfov * 0.5) * aspect);
    }
    // float f = 1. / tan(radians(fov) * 0.5);
    // infinite far: [10]: -1, [14]: -2 * near
    mat4 perspective_vfov_r(float vfov, float aspect, float near, float far) {
        float f = tan(pi * 0.5 - 0.5 * vfov);
        float rangeinv = 1.0 / (near - far);
        return mat4(
            f / aspect, 0,                            0,  0,
                     0, f,                            0,  0,
                     0, 0, (near + far) * rangeinv * 1., -1,
                     0, 0,  near * far  * rangeinv * 2.,  0
        );
    }
    mat4 perspective(float fov, float aspect, float near, float far) {
        return perspective_vfov_r(radians(fov), aspect, near, far);
    }





    mat4 frustum(float left, float right, float bottom, float top, float near, float far) {
        float dx = right - left;
        float dy = top - bottom;
        float dz = near - far;
        return mat4(
            2. * near / dx, 0, 0, 0,
            0, 2. * near / dy, 0, 0,
            (left + right) / dx, (top + bottom) / dy, far / dz, -1,
            0, 0, near * far / dz, 0
        );
    }

    mat4 ortho(float left, float right, float top, float bottom, float near, float far) {
        float w = 1. / (right - left);
        float h = 1. / (top - bottom);
        float p = 1. / (far - near);
        float x = (right + left) * w;     // far + near is 1, far - near is 1
        float y = (top + bottom) * h;
        float z = (far + near) * p;
        return transpose(mat4(
            2. * w,      0,       0, -x,
                0, 2. * h,       0, -y,
                0,      0, -2. * p, -z,
                0,      0,       0,  1
        ));
    }


    // mat4 ortho_2(float left, float right, float top, float bottom, float near, float far) {
    //     return mat4(
    //         2. / (right - left),      0,       0, 0,
    //         0,                     2. / (top - bottom),       0, 0,
    //             0,      0,                     2. / (far - near), 0,
    //         (right + left) / (right-left), (top + bottom) / (top-bottom), (far + near) / (far-near),  1
    //     );
    // }




    const mat4 orthoquad = mat4( // ortho(-0.5, 0.5, 0.5, -0.5, 0., 1.)
        2., 0,  0,   0,
        0,  2., 0,  -0,
        0,  0, -2., -1.,
        0,  0,  0,   1.
    );
    // const mat4 orthoquad = mat4(
    //     1, 0, 0, -0,
    //     0, 1, 0, -0,
    //     0, 0, -1, -0,
    //     0, 0, 0, 1
    // );




    // vec3 rvec_dir(mat3 m, vec3 dir) {
    //     return vec3(
    //         m[0].x * dir.x + m[1].x * dir.y + m[2].x * dir.z,
    //         m[0].y * dir.x + m[1].y * dir.y + m[2].y * dir.z,
    //         m[0].z * dir.x + m[1].z * dir.y + m[2].z * dir.z
    //     );
    // }
    vec3 position(mat4 m) {
        return m[3].xyz;
    }
    // mat3 rotation(mat3 m, vec3 scale) {
    //     return mat3(m[0] * (1./scale.x), m[1] * (1./scale.y), m[2] * (1./scale.z));
    // }
        //  position
        //  rotation
        //  scaledup
    vec3 get_scale(mat4 m) {
        vec3 s = vec3(length(m[0].xyz), length(m[1].xyz), length(m[2].xyz));
        float det = determinant(m);
        if(det < 0.) s.x = -s.x;
        return s;
    }
    vec3[3] decompose_unsafe(mat4 m) {
        vec3 p = position(m);
        vec3 s = get_scale(m);
        m[0].xyz *= 1. / s.x;
        m[1].xyz *= 1. / s.y;
        m[2].xyz *= 1. / s.z;
		float m11 = m[0].x, m12 = m[1].x, m13 = m[2].x;
        float m21 = m[0].y, m22 = m[1].y, m23 = m[2].y;
		float m31 = m[0].z, m32 = m[1].z, m33 = m[2].z;
        // euler xyz
        float y = asin(clamp(m13, -1., 1.));
        float x, z;
        if(abs(m13) < 0.9999999) {
            x = atan(-m23, m33);
            z = atan(-m12, m11);
        }
        else {
            x = atan(m32, m22);
            z = 0.;
        }
        vec3[3] r;
        r[0] = p;
        r[1] = vec3(x, y, z);
        r[2] = s;
        return r;
    }

    mat4 lookatup(vec3 eye, vec3 t, vec3 up) {
        vec3 p = eye;
        vec3 z = normalize(p - t);
        vec3 x = normalize(cross(up, z));
        vec3 y = normalize(cross(z, x));
        return mat4(
            x[0], x[1], x[2], 0,
            y[0], y[1], y[2], 0,
            z[0], z[1], z[2], 0,
            p[0], p[1], p[2], 1
        );
    }
    mat4 lookat(vec3 eye, vec3 t) {
        return lookatup(eye, t, vec3(0, 1, 0));
    }

    // float length_sq(vec3 a) {
    //     return a.x * a.x + a.y *a. y + a.z * a.z;
    // }
    // mat4 threejs_lookat(vec3 eye, vec3 target, vec3 up) {
    //     vec3 z = eye - target;
    //     if(length_sq(z) == 0.) z.z = 1.; // eye and target are in the same position
    //     z = normalize(z);
    //     vec3 x = cross(up, z);
    //     if(length_sq(x) == 0.) { // up and z are parallel
    //         if(abs(up.z) == 1.) z.x += 0.0001;
    //         else                z.z += 0.0001;
    //         z = normalize(z);
    //         x = cross(up, z);
    //     }
    //     x = normalize(x);
    //     vec3 y = cross(z, x);
    //     return mat4(
    //         x[0], x[1], x[2], 0,
    //         y[0], y[1], y[2], 0,
    //         z[0], z[1], z[2], 0,
    //         eye[0], eye[1], eye[2], 1
    //     );
    // }
    // mat4 lookat(mat4 m, vec3 target) {
    //     vec3 eye = position(m);
    //     vec3 up = vec3(0, 1, 0);
    //     return threejs_lookat(eye, target, up);
    // }


    // mat4 lookatz(mat4 m, vec3 t) {
    //     vec3 up = upvec(m);
    //     return lookatup(m, t, up);
    // }

    // vec3 upvec(mat4 m) {
    //     return normalize(vec3(m[1][0], m[1][1], m[1][2]));
    // }

    // mat4 billboard(mat4 m, mat4 camera) {
    //     vec3 up = upvec(camera);
    //     return lookatup(m, -position(camera), up);
    // }
    // mat4 billboardz(mat4 m, mat4 camera) {
    //     return lookatup(m, -position(camera), vec3(0, 1, 0));
    // }
`

// 1000 _ 0.03
//   15 _ 0.1

let lights = `

bool wrap(vec2 uv) {
    return uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.;
}

    float diffuse(vec3 light, vec3 pos, vec3 normal) {
        vec3 dist = light - pos.xyz;
        return max(0., dot(normal, normalize(dist)));
    }
    float specular(vec3 light, vec3 pos, vec3 normal, vec3 eye, float shininess) {
        vec3 lightpos = light;
        vec3 eyedir = normalize(eye - pos.xyz);
        vec3 lightdir = normalize(lightpos - pos.xyz);
        vec3 halfv = normalize(eyedir + lightdir);
        return pow(max(dot(normal, halfv), 0.), shininess);
    }
    // https://danielilett.com/2019-06-12-tut2-3-fresnel/
    float fresnel(vec3 pos, vec3 normal, vec3 eye) {
        vec3 v = normalize(eye - pos.xyz);
        return 1. - dot(normal, v);
    }

    // projective texture mapping
    // vec2 projuv(mat4 view, mat4 proj, vec3 pos) {
    //     vec4 uv = proj * inverse(view) * vec4(pos, 1);
    //     if(uv.w < 0.) return vec2(-1);
    //     return (uv.xy / uv.w) * 0.5 + 0.5;
    // }


    bool do_light(vec3 light, vec3 pos, vec3 normal) {
        vec3 dir = normalize(light - pos);
        return dot(dir, normal) >= 0.;
    }

    vec2 projuv(mat4 view, mat4 proj, vec3 pos, vec3 normal) {
        if(!do_light(position(view), pos, normal)) return vec2(-1);
        vec4 uv = proj * inverse(view) * vec4(pos, 1);
        if(uv.w <= 0.) return vec2(-1);
        if(-uv.w <= uv.x && uv.x <= uv.w && -uv.w <= uv.y && uv.y <= uv.w && -uv.w <= uv.z && uv.z <= uv.w) {
            return (uv.xy / uv.w) * 0.5 + 0.5;
        }        
        return vec2(-1);
    }
    vec2 sphereuv(vec3 n) {
        return vec2(
            0.5 + atan(n.z, n.x) / (pi * 2.),
            0.5 - asin(n.y) / pi
        );
    }
    vec2 spotmap_x(mat4 view, vec3 pos) {
        vec3 dist = normalize(position(view) - pos.xyz);
        vec3 ray = dist * mat3(view);
        return sphereuv(ray * mat3(rotatey(pi / -2.)));
    }
    vec2 spotmap_nope(mat4 view, vec3 pos, float angle) {
        if(angle != 1.) return vec2(-1);
        return spotmap_x(view, pos);
    }

    vec2 spotuv(mat4 light, vec3 pos, vec3 normal) {
        if(!do_light(position(light), pos, normal)) return vec2(-1);
        // light *= rotatex(0.000000001);
        return spotmap_x(light, pos);
    }

    float dist(vec3 light, vec3 pos, float d) {
        float n = distance(light, pos);
        return 1. - rescale(clamp(n, 0., d), 0., d, 0., 1.);
    }



    float shadow(mat4 light, mat4 proj, sampler2D map, vec4 pos, float bias) {
        vec4 fpos = proj * inverse(light) * pos;
        vec3 uv = fpos.xyz / fpos.w;
        uv = uv * 0.5 + 0.5;
        float r = 0.;
        if(!wrap(uv.xy)) {
            float closestDepth = texture(map, uv.xy).r; 
            float currentDepth = uv.z;
            r = currentDepth - bias > closestDepth  ? 1.0 : 0.0; 
        }
        return r;
    }


    vec3 cubeuv(vec3 v) {
        float faceIndex;
        vec3 vAbs = abs(v);
        float ma;
        vec2 uv;
        if(vAbs.z >= vAbs.x && vAbs.z >= vAbs.y) {
            faceIndex = v.z < 0.0 ? 5.0 : 4.0;
            ma = 0.5 / vAbs.z;
            uv = vec2(v.z < 0.0 ? -v.x : v.x, -v.y);
        }
        else if(vAbs.y >= vAbs.x) {
            faceIndex = v.y < 0.0 ? 2.0 : 3.0;
            ma = 0.5 / vAbs.y;
            uv = vec2(v.x, v.y < 0.0 ? -v.z : v.z);
        }
        else {
            faceIndex = v.x < 0.0 ? 1.0 : 0.0;
            ma = 0.5 / vAbs.x;
            uv = vec2(v.x < 0.0 ? v.z : -v.z, -v.y);
        }
        return vec3(uv * ma + 0.5, faceIndex);
    }

    vec4 cubemap(vec3 dir, sampler2D right, sampler2D left, sampler2D top, sampler2D bottom, sampler2D front, sampler2D back) {
        vec3 st = cubeuv(dir);
        if(st[2] == 0.) return texture(right,  st.xy);
        if(st[2] == 1.) return texture(left,   st.xy);
        if(st[2] == 2.) return texture(top,    st.xy);
        if(st[2] == 3.) return texture(bottom, st.xy);
        if(st[2] == 4.) return texture(front,  st.xy);
        // if(st[2] == 5.)
        return texture(back,   st.xy);
    }


    vec3 reflex(vec3 pos, vec3 normal, vec3 eye) {
        vec3 I = normalize(eye - pos);
        vec3 R = reflect(I, normalize(normal));              
        return R;
    }
    vec3 refrax(vec3 pos, vec3 normal, vec3 eye, float ratio) {
        vec3 I = -normalize(eye - pos);
        vec3 R = -refract(I, normalize(normal), ratio);
        return R;
    }

    // https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
    vec2 matcap(vec3 eye, vec3 normal) {
        vec3 r = reflect(eye, normal);
        float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
        vec2 vN = r.xy / m + .5;
        return vN;
    }
`
let surface = `
    // mr doob
    // vec3 normalgen(sampler2D h, vec2 uv) {
    //     ivec2 size = textureSize(h, 0);
    //     float px = 1. / float(size.x);// + 0.01;
    //     float py = 1. / float(size.y);// + 0.01;
    //     // px = 0.1;
    //     // px = 0.1;
    //  // float h00 = texture(h, uv + vec2(-px, -py)).r;
    //     float h10 = texture(h, uv + vec2( 0., -py)).r;
    //  // float h20 = texture(h, uv + vec2( px, -py)).r;
    //     float h01 = texture(h, uv + vec2(-px,  0.)).r;
    //     float h21 = texture(h, uv + vec2( px,  0.)).r;
    //  // float h02 = texture(h, uv + vec2(-px,  py)).r;
    //     float h12 = texture(h, uv + vec2( 0.,  py)).r;
    //  // float h22 = texture(h, uv + vec2( px,  py)).r;
    //     vec3 c = vec3((h21 - h01) + 0.5, (h12 - h10) + 0.5, 1);
    //     return c;
    // }
    float sampleSobel(sampler2D t, vec2 uv)
    {
        float weight = 1.0;
        float f = 1. - texture(t, uv).r;
        return f * weight - (weight * 0.5);
    }
    // https://www.shadertoy.com/view/Xtd3DS
    vec3 normalgen(sampler2D t, vec2 uv)
    {   
        ivec2 size = textureSize(t, 0);
        float x = 1. / float(size.x);
        float y = 1. / float(size.y);
        // float x = 1. / 900.;
        // float y = 1. / 900.;
        
        // |-1  0  1|
        // |-2  0  2| 
        // |-1  0  1|
        
        float gX = 0.0;
        gX += -1.0 * sampleSobel(t, uv + vec2(-x, -y));
        gX += -2.0 * sampleSobel(t, uv + vec2(-x,  0));
        gX += -1.0 * sampleSobel(t, uv + vec2(-x, +y));
        gX += +1.0 * sampleSobel(t, uv + vec2(+x, -y));
        gX += +2.0 * sampleSobel(t, uv + vec2(+x,  0));
        gX += +1.0 * sampleSobel(t, uv + vec2(+x, +y));
        
        // |-1 -2 -1|
        // | 0  0  0| 
        // | 1  2  1|
        
        float gY = 0.0;
        gY += -1.0 * sampleSobel(t, uv + vec2(-x, -y));
        gY += -2.0 * sampleSobel(t, uv + vec2( 0, -y));
        gY += -1.0 * sampleSobel(t, uv + vec2(+x, -y));
        gY += +1.0 * sampleSobel(t, uv + vec2(-x, +y));
        gY += +2.0 * sampleSobel(t, uv + vec2( 0, +y));
        gY += +1.0 * sampleSobel(t, uv + vec2(+x, +y));
        
    
        vec2 f = vec2(sqrt(gX * gX + gY * gY), atan(-gY, -gX));
        vec2 gradientDirection = f.x * vec2(cos(f.y), sin(f.y));
        vec3 normal = normalize(vec3(gradientDirection, 1.0));
        // normal.x = -normal.x;
        return normal * 0.5 + 0.5;
    }    
    //vec3 normalmap(vec3 normal, vec3 tangent, vec3 bitangent, sampler2D t, vec2 uv, float scale) {
    vec3 normalmap(mat3 tbn, sampler2D t, vec2 uv, float scale) {
        vec3 n = texture(t, uv).xyz * 2.0 - 1.0;
        // n.z *= -0.01;
        n.xy *= scale;
        return normalize(tbn * n);
    }
    vec2 parallax_f(vec2 uv, vec3 viewdir, sampler2D hmap, float scale, float quality) {
        const float min = 10.;
        float max = 512. * quality;
        float n = mix(max, min, abs(dot(vec3(0, 0, 1), viewdir)));  
        float depth = 1. / n;
        float c = 0.;
        vec2 P = viewdir.xy / viewdir.z * scale;
        vec2 delta = P / n;
        vec2 cuv = uv;
        float ch = texture(hmap, cuv).r;
        while(c < ch) {
            cuv -= delta;
            ch = texture(hmap, cuv).r;  
            c += depth;  
        }
        vec2 prev = cuv + delta;
        float after  = ch - c;
        float before = texture(hmap, prev).r - c + depth;
        float weight = after / (after - before);
        vec2 r = prev * weight + cuv * (1. - weight);
        return r;
    }
    // vec2 parallax(vec3 normal, vec3 tangent, vec3 bitangent, vec3 eye, vec3 pos, vec2 uv, sampler2D hmap, float scale) {
    // vec2 parallax(vec3 normal, vec3 tangent, vec3 bitangent, sampler2D hmap, vec2 uv, float scale, vec3 pos, vec3 eye) {
    vec2 parallax(mat3 tbn, sampler2D t, vec2 uv, float scale, float quality, vec3 pos, vec3 eye) {
        mat3 ttbn = transpose(tbn);
        
        ivec2 size = textureSize(t, 0);
        float asp = float(size.x) / float(size.y);

        // asp = 1.;

        eye.y *= asp;
        pos.y *= asp;

        vec3 tbnv = ttbn * eye;
        vec3 tbnp = ttbn * pos.xyz;
        vec3 vdir = normalize(tbnv - tbnp);
        return parallax_f(uv, vdir, t, scale, quality);
    }
`
let particles = `
    // float[4] catmullrom_init_c(float x0, float x1, float t0, float t1) {
    //     return float[4](
    //         x0,
    //         t0,
    //         -3. * x0 + 3. * x1 - 2. * t0 - t1,
    //         2. * x0 - 2. * x1 + t0 + t1
    //     );
    // }
    // float[4] catmullrom_init(float x0, float x1, float x2, float x3, float tension) {
    //     return catmullrom_init_c(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
    // }
    // float[4] catmullrom_init_nonuni(float x0, float x1, float x2, float x3, float dt0, float dt1, float dt2) {
    //     float t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
    //     float t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
    //     t1 *= dt1;
    //     t2 *= dt1;
    //     return catmullrom_init_c(x1, x2, t1, t2);
    // }
    // float catmullrom_calc(float[4] c, float t) {
    //     float t2 = t * t;
    //     float t3 = t2 * t;
    //     return c[0] + c[1] * t + c[2] * t2 + c[3] * t3;
    // }
    // float distance_to_squared(vec3 a, vec3 b) {
    //     float dx = a.x - b.x;
    //     float dy = a.y - b.y;
    //     float dz = a.z - b.z;
    //     return dx * dx + dy * dy + dz * dz;
    // }
    // vec3 catmullrom(vec3[4] p, float tension, float t) {
    //     t = mod(t, 1.);
    //     int LENGTH = 4;
    //     float pp = float(LENGTH - 1) * t;
    //     int ip = int(floor(pp));
    //     float weight = pp - float(ip);
    //     if(weight == 0. && ip == (LENGTH - 1)) {
    //         ip = LENGTH - 2;
    //         weight = 1.;
    //     }
    //     vec3 p0 = (p[0] - p[1]) + p[0];
    //     vec3 p1 = p[ip % LENGTH];
    //     vec3 p2 = p[(ip + 1) % LENGTH];
    //     vec3 p3 = (p[LENGTH - 1] - p[LENGTH - 2]) + p[LENGTH - 1];
    //     // non-uniform
    //     float centripetal = 0.25;
    //     float chordal = 0.5;
    //     float pw = centripetal;
    //     float dt0 = pow(distance_to_squared(p0, p1), pw);
    //     float dt1 = pow(distance_to_squared(p1, p2), pw);
    //     float dt2 = pow(distance_to_squared(p2, p3), pw);
    //     if(dt1 < 1e-4) dt1 = 1.;
    //     if(dt0 < 1e-4) dt0 = dt1;
    //     if(dt2 < 1e-4) dt2 = dt1;
    //     return vec3(
    //         catmullrom_calc(catmullrom_init_nonuni(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2), weight),
    //         catmullrom_calc(catmullrom_init_nonuni(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2), weight),
    //         catmullrom_calc(catmullrom_init_nonuni(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2), weight)
    //     );
    //     // uniform
    //     // tension = 0.7;
    //     return vec3(
    //         catmullrom_calc(catmullrom_init(p0.x, p1.x, p2.x, p3.x, tension), weight),
    //         catmullrom_calc(catmullrom_init(p0.y, p1.y, p2.y, p3.y, tension), weight),
    //         catmullrom_calc(catmullrom_init(p0.z, p1.z, p2.z, p3.z, tension), weight)
    //     );
    // }
    vec3 catmullrom(vec3[4] p, float tension, float t) {
        // Cardinal Spline Matrix
        // https://www.shadertoy.com/view/MlGSz3
        float T = tension;
        mat4 CRM = mat4(-T,        2.0 - T,  T - 2.0,         T,
                               2.0 * T,  T - 3.0,  3.0 - 2.0 * T,  -T,
                              -T,        0.0,      T,               0.0,
                               0.0,      1.0,      0.0,             0.0);
        vec3 G1 = p[0];
        vec3 G2 = p[1];
        vec3 G3 = p[2];
        vec3 G4 = p[3];
        vec3 A = G1 * CRM[0][0] + G2 * CRM[0][1] + G3 * CRM[0][2] + G4 * CRM[0][3];
        vec3 B = G1 * CRM[1][0] + G2 * CRM[1][1] + G3 * CRM[1][2] + G4 * CRM[1][3];
        vec3 C = G1 * CRM[2][0] + G2 * CRM[2][1] + G3 * CRM[2][2] + G4 * CRM[2][3];
        vec3 D = G1 * CRM[3][0] + G2 * CRM[3][1] + G3 * CRM[3][2] + G4 * CRM[3][3];
        return t * (t * (t * A + B) + C) + D;
    }
    // vec3 curvepath(vec3[16] p, int size, float t) {
    //     t = mod(t, 1.);
    //     int i = int(floor(rescale(t, 0., 1., 0., float(size - 3))));
    //     float d = 1. / float(size - 3);
    //     float dt = mod(t, d);
    //     vec3[4] v = vec3[4](p[i], p[i + 1], p[i + 2], p[i + 3]);
    //     float x = 1. / 3.;
    //     return catmullrom(v, 1., rescale(dt, 0., d, x, x + x));
    // }
    vec3 curvepath(vec3[64] p, float[64] ts, int size, float t) {
        t = mod(t, 1.);
        int i = int(floor(rescale(t, 0., 1., 0., float(size - 3))));
        float d = 1. / float(size - 3);
        float dt = mod(t, d);
        vec3[4] v = vec3[4](p[i], p[i + 1], p[i + 2], p[i + 3]);
        return catmullrom(v, ts[i + 1], rescale(dt, 0., d, 0., 1.));
    }
//
//let span =
    float randi2(int a, int b) {
        vec2 st = vec2(a, b);
        return fract(
            sin(
                dot(st, vec2(12.9898, 78.233))
            ) * 43758.5453123
        );
    }
    vec3 span(int seed, float range, float min, float offset, float time) {
        float life = randi2(seed, 0) * range + min;
        float off = randi2(seed, 1) * offset;
        float n = off + time / life;
        int cycle = int(n) + 2; // +2 to avoid overlap of randi2
        float t = fract(n);
        return vec3(cycle, t, seed);
    }
    const int START = 0;
    const int START_RAND = 1;
    const int END = 2;
    const int END_RAND = 3;
    float emit_field(float[4] v, float t, float r1, float r2) {
        return mix(
            v[START] + rescale(r1, 0., 1., -v[START_RAND], v[START_RAND]),
            v[END]   + rescale(r2, 0., 1., -v[END_RAND],   v[END_RAND]),
            t
        );
    }
    mat4 emit(vec3 span, vec3[4] points, float[4] angle, float[4] size) {
        int c = int(span.x);
        float t = span.y;
        int seed = int(span.z);
        #define r() randi2(seed, c++)
        vec3 a = points[START];
        vec3 ar = points[START_RAND];
        vec3 b = points[END];
        vec3 br = points[END_RAND];
        a.x += rescale(r(), 0., 1., -ar.x, ar.x);
        a.y += rescale(r(), 0., 1., -ar.y, ar.y);
        a.z += rescale(r(), 0., 1., -ar.z, ar.z);
        b.x += rescale(r(), 0., 1., -br.x, br.x);
        b.y += rescale(r(), 0., 1., -br.y, br.y);
        b.z += rescale(r(), 0., 1., -br.z, br.z);
        vec3 p_ = mix(a, b, t);
        float an = emit_field(angle, t, r(), r());
        float sz = emit_field(size,  t, r(), r());
        #undef r
        return translate(p_.x, p_.y, p_.z) * rotatez(an) * scale(sz, sz, sz);
    }
    mat4 emitcurve(vec3 span, vec3[64] ps, vec3[64] ds, float[64] ts, int length, float[4] angle, float[4] size) {
        int c = int(span.x);
        float t = span.y;
        int seed = int(span.z);
        #define r() randi2(seed, c++)
        vec3[64] q;
        for(int i = 0; i < length; i++) {
            q[i] = vec3(
                ps[i].x + rescale(r(), 0., 1., -ds[i].x, ds[i].x),
                ps[i].y + rescale(r(), 0., 1., -ds[i].y, ds[i].y),
                ps[i].z + rescale(r(), 0., 1., -ds[i].z, ds[i].z)
            );
        }
        vec3 p_ = curvepath(q, ts, length, t);
        float an = emit_field(angle, t, r(), r());
        float sz = emit_field(size,  t, r(), r());
        #undef r
        return translate(p_.x, p_.y, p_.z) * rotatez(an) * scale(sz, sz, sz);
    }
//
// let slash = 
    float slash_hard(vec4 p_, float a, float b, float c, float d, float time) {
        float t = mod(time, a + b + c + d);
        if(t < a) return (t / a - p_.r) > 0.? p_.a : 0.;
        t -= a;
        if(t < b) return p_.a;
        t -= b;
        if(t < c) return (t / c - p_.r) > 0.? 0. : p_.a;
        return 0.;
    }
    float slash_one(float r, float a, float t, float n) {
        float tn = t / n;
        float f = tn - r;
        float o = 0.5;
        o = mix(o, 0., tn); // float o = 1. - tn;
        if(f < 0.) return 0.;
        if(f < o) {
            return mix(0., a, rescale(f, 0., o, 0., 1.));
        }
        return 1.;
    }
    float slash(float pr, float pa, float a, float b, float c, float d, float time) {
        float t = mod(time, a + b + abs(c) + d);
        if(t < a) {
            return slash_one(pr, pa, t, a);
        }
        t -= a;
        if(t < b) {
            return pa;
        }
        t -= b;
        if(c < 0. && t < -c) {
            return slash_one(pr, pa, -c - t, -c);
        }
        if(t < c) {
            return 1. - slash_one(pr, pa, t, c);
        }
        return 0.;
    }
`
let color = `
    vec3 rgbtohsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p_ = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p_.xyw, c.r), vec4(c.r, p_.yzx), step(p_.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsvtorgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    vec4 hue(vec4 c, float v) {
        vec3 hsv = rgbtohsv(c.rgb);
        hsv.x += v;
        c.rgb = hsvtorgb(hsv);
        return c;
    }
    vec4 invert(vec4 c) {
        return vec4(1.-c.r, 1.-c.g, 1.-c.b, c.a);
    }
`
let filters = `
    // vec4 blur_13(sampler2D image, vec2 uv, vec2 strength) {
    //     vec4 color = vec4(0.0);
    //     vec2 off1 = vec2(1.411764705882353) * strength;
    //     vec2 off2 = vec2(3.2941176470588234) * strength;
    //     vec2 off3 = vec2(5.176470588235294) * strength;
    //     color += texture(image, uv) * 0.1964825501511404;
    //     color += texture(image, uv + off1) * 0.2969069646728344;
    //     color += texture(image, uv - off1) * 0.2969069646728344;
    //     color += texture(image, uv + off2) * 0.09447039785044732;
    //     color += texture(image, uv - off2) * 0.09447039785044732;
    //     color += texture(image, uv + off3) * 0.010381362401148057;
    //     color += texture(image, uv - off3) * 0.010381362401148057;
    //     return color;
    // }
    // vec4 hblur(sampler2D t, vec2 uv, float strength) {
    //     return blur_13(t, uv, vec2(strength, 0));
    // }
    // vec4 vblur(sampler2D t, vec2 uv, float strength) {
    //     return blur_13(t, uv, vec2(0, strength));
    // }

    vec4 blur_13(sampler2D image, vec2 uv, vec2 direction) {	
        vec4 color = vec4(0.0);	
        vec2 off1 = vec2(1.411764705882353) * direction;	
        vec2 off2 = vec2(3.2941176470588234) * direction;	
        vec2 off3 = vec2(5.176470588235294) * direction;	
        color += texture(image, uv) * 0.1964825501511404;	
        color += texture(image, uv + off1) * 0.2969069646728344;	
        color += texture(image, uv - off1) * 0.2969069646728344;	
        color += texture(image, uv + off2) * 0.09447039785044732;	
        color += texture(image, uv - off2) * 0.09447039785044732;	
        color += texture(image, uv + off3) * 0.010381362401148057;	
        color += texture(image, uv - off3) * 0.010381362401148057;	
        return color;	
    }	
    vec4 hblur(sampler2D t, vec2 uv, float strength) {	
        return blur_13(t, uv, vec2(strength, 0));	
    }	
    vec4 vblur(sampler2D t, vec2 uv, float strength) {
        return blur_13(t, uv, vec2(0, strength));
    }
//
//let zoomblur = 
    vec4 zoomblur(sampler2D img, vec2 uv, float x, float y, float strength) {
        vec2 inc = (vec2(x, 1. - y) - uv) * strength;
        vec4 sum;
        sum += texture(img, uv - inc * 4.) * 0.051;
        sum += texture(img, uv - inc * 3.) * 0.0918;
        sum += texture(img, uv - inc * 2.) * 0.12245;
        sum += texture(img, uv - inc * 1.) * 0.1531;
        sum += texture(img, uv + inc * 0.) * 0.1633;
        sum += texture(img, uv + inc * 1.) * 0.1531;
        sum += texture(img, uv + inc * 2.) * 0.12245;
        sum += texture(img, uv + inc * 3.) * 0.0918;
        sum += texture(img, uv + inc * 4.) * 0.051;
        return sum;
    }
    // vec4 zoomblur2(sampler2D img, vec2 uv, float x, float y, float sa, float sb) {
    //     vec2 inc = (vec2(x, 1. - y) - uv) * vec2(sa, sb);
    //     vec4 sum;
    //     sum += texture(img, uv - inc * 4.) * 0.051;
    //     sum += texture(img, uv - inc * 3.) * 0.0918;
    //     sum += texture(img, uv - inc * 2.) * 0.12245;
    //     sum += texture(img, uv - inc * 1.) * 0.1531;
    //     sum += texture(img, uv + inc * 0.) * 0.1633;
    //     sum += texture(img, uv + inc * 1.) * 0.1531;
    //     sum += texture(img, uv + inc * 2.) * 0.12245;
    //     sum += texture(img, uv + inc * 3.) * 0.0918;
    //     sum += texture(img, uv + inc * 4.) * 0.051;
    //     return sum;
    // }
    float sobel(sampler2D t, vec2 uv, float x, float y) { // x and y are strength
        vec4 h = vec4(0);
        h -= texture(t, vec2(uv.x - x, uv.y - y)) * 1.;
        h -= texture(t, vec2(uv.x - x, uv.y    )) * 2.;
        h -= texture(t, vec2(uv.x - x, uv.y + y)) * 1.;
        h += texture(t, vec2(uv.x + x, uv.y - y)) * 1.;
        h += texture(t, vec2(uv.x + x, uv.y    )) * 2.;
        h += texture(t, vec2(uv.x + x, uv.y + y)) * 1.;
        vec4 v_ = vec4(0);
        v_ -= texture(t, vec2(uv.x - x, uv.y - y)) * 1.;
        v_ -= texture(t, vec2(uv.x    , uv.y - y)) * 2.;
        v_ -= texture(t, vec2(uv.x + x, uv.y - y)) * 1.;
        v_ += texture(t, vec2(uv.x - x, uv.y + y)) * 1.;
        v_ += texture(t, vec2(uv.x    , uv.y + y)) * 2.;
        v_ += texture(t, vec2(uv.x + x, uv.y + y)) * 1.;
        vec3 edge = sqrt(h.rgb * h.rgb + v_.rgb * v_.rgb);
        return (edge.x + edge.y + edge.z) / 3.;
    }
    // https://www.shadertoy.com/view/XlsXRB
    float outline_x(sampler2D t, vec2 uv, float samples_dx, bool inside) {
        vec2 size = vec2(textureSize(t, 0));
        ivec2 iuv = ivec2(int(uv.x * size.x), int(uv.y * size.y));
        float samples = round(samples_dx * size.x);
        int isamples = int(samples);
        float d = samples;
        for(int x = -isamples; x != isamples; x++) {
            for(int y = -isamples; y != isamples; y++) {
                float a = texelFetch(t, iuv + ivec2(x, y), 0).a;
                if(inside) a = 1. - a;
                // if(dot(normalize(vec2(x, y)), normalize(vec2(0, -5))) < 0.75) continue;
                if(a > 0.5) {
                    d = min(d, length(vec2(x, y)));
                }
            }
        }
        d = clamp(d, 0., samples) / samples;
        // d = clamp(d, 0., 1.); // may be over -0.00000001
        return 1. - d;
    }
    float outline(sampler2D t, vec2 uv, float samples_dx) {
        return outline_x(t, uv, samples_dx, false);
    }





    const float[64] ssao_noise = float[64](
        -0.7123168110847473, 0.7018580436706543, 0., 0., -0.6823078393936157, -0.7310649752616882, 0., 0., 0.8779285550117493, -0.47879165410995483, 0., 0., 0.7977963089942932, 0.602927029132843, 0., 0., 0.15651366114616394, -0.9876757860183716, 0., 0., 0.9920237064361572, -0.12605135142803192, 0., 0., -0.8378090262413025, -0.5459634065628052, 0., 0., 0.6735560297966003, 0.7391361594200134, 0., 0., 0.02000349946320057, 0.999799907207489, 0., 0., 0.30650821328163147, -0.9518679976463318, 0., 0., -0.4286597669124603, 0.903465986251831, 0., 0., 0.7592897415161133, 0.6507527232170105, 0., 0., 0.9918479919433594, -0.1274268627166748, 0., 0., 0.7089933753013611, -0.7052151560783386, 0., 0., 0.9855568408966064, 0.1693449169397354, 0., 0., 0.4421997368335724, -0.8969166278839111, 0., 0.
    );
    vec4 table_get(vec4[16] table, int i, int j) {
        return table[i * 4 + j];
    }
    vec3 ssao_noise_lookup(float x, float y) {
        // float[64] T = ssao_noise;
        // vec4[24] table;
        // table[0] = vec4(T[0],  T[1],  T[2],  T[3]);
        // table[1] = vec4(T[4],  T[5],  T[6],  T[7]);
        // table[2] = vec4(T[8],  T[9],  T[10], T[11]);
        // table[3] = vec4(T[12], T[13], T[14], T[15]);
        // table[4] = table[0];
        // table[5] = vec4(T[16], T[17], T[18], T[19]);
        // table[6] = vec4(T[20], T[21], T[22], T[23]);
        // table[7] = vec4(T[24], T[25], T[26], T[27]);
        // table[8] = vec4(T[28], T[29], T[30], T[31]);
        // table[9] = table[5];
        // table[10] = vec4(T[32], T[33], T[34], T[35]);
        // table[11] = vec4(T[36], T[37], T[38], T[39]);
        // table[12] = vec4(T[40], T[41], T[42], T[43]);
        // table[13] = vec4(T[44], T[45], T[46], T[47]);
        // table[14] = table[10];
        // table[15] = vec4(T[48], T[49], T[50], T[51]);
        // table[16] = vec4(T[52], T[53], T[54], T[55]);
        // table[17] = vec4(T[56], T[57], T[58], T[59]);
        // table[18] = vec4(T[60], T[61], T[62], T[63]);
        // table[19] = table[15];
        // table[20] = table[0];
        // table[21] = table[1];
        // table[22] = table[2];
        // table[23] = table[3];
        float[64] T = ssao_noise;
        vec4[16] table;
        table[0] =  vec4(T[0],  T[1],  T[2],  T[3]);
        table[1] =  vec4(T[4],  T[5],  T[6],  T[7]);
        table[2] =  vec4(T[8],  T[9],  T[10], T[11]);
        table[3] =  vec4(T[12], T[13], T[14], T[15]);
        table[4] =  vec4(T[16], T[17], T[18], T[19]);
        table[5] =  vec4(T[20], T[21], T[22], T[23]);
        table[6] =  vec4(T[24], T[25], T[26], T[27]);
        table[7] =  vec4(T[28], T[29], T[30], T[31]);
        table[8] =  vec4(T[32], T[33], T[34], T[35]);
        table[9] =  vec4(T[36], T[37], T[38], T[39]);
        table[10] = vec4(T[40], T[41], T[42], T[43]);
        table[11] = vec4(T[44], T[45], T[46], T[47]);
        table[12] = vec4(T[48], T[49], T[50], T[51]);
        table[13] = vec4(T[52], T[53], T[54], T[55]);
        table[14] = vec4(T[56], T[57], T[58], T[59]);
        table[15] = vec4(T[60], T[61], T[62], T[63]);

        x = mod(x, 1.);
        y = mod(y, 1.);
        float yy = y * 4.;
        float xx = x * 4.;

        int j = int(floor(xx));
        float jd = fract(xx);
        int j2 = j + 1;
        if(j2 == 4) j2 = 0;
        
        int i = int(floor(yy));
        float id = fract(yy);
        int i2 = i + 1;
        if(i2 == 4) i2 = 0;

        vec4 a = table_get(table, i,  j);
        vec4 b = table_get(table, i,  j2);
        // vec4 c = table_get(table, i2, j2);
        vec4 d = table_get(table, i2, j);

        vec4 X = mix(a, b, jd);
        vec4 Y = mix(a, d, id);
        vec4 R = (X + Y) / 2.;

        return vec3(R.xyz);
    }
    
    float[192] ssao_kernel = float[192](-0.09374634215485403,-0.000375369488122982,0.01754888749241413,0.017984001619785535,-0.04356818942450886,0.03569104774985324,-0.043783772268963614,-0.03428895654049228,0.06042799265745649,-0.049004574674518894,-0.06304131859385166,0.027820859347207735,-0.03586738716809315,-0.061326853471432886,0.03525915815457384,-0.06871109333104407,0.01440255699091857,0.04853617849294936,-0.07251809166741986,0.014862179462582895,0.044602699837812995,-0.004731613274647387,-0.017119952135333877,0.0010520665356540406,0.004400121280317265,0.0081662423060754,0.0024589850574472513,0.02537708481215369,0.040274072947467134,0.038324930598352736,-0.007138754764226268,0.049238945168016926,0.006914354524334151,-0.03812673535532064,0.031884808551242524,0.02335045312675197,-0.055864272680788835,-0.006359346492396586,0.0535015245616255,-0.009584547833344784,-0.011422438717361047,0.010290444556246493,0.021175210042685355,0.008931455967788389,0.011879037149721137,-0.004793906537912411,0.012239745521245257,0.13845648606007668,-0.12320928777467297,-0.03853214341372054,0.03412892884776708,-0.08198963874808374,-0.0695686376581193,0.08181684092432585,0.01823509576170111,-0.04889349713193072,0.03762078575423584,-0.032004831476432356,-0.052774232426097925,0.04569333909528465,0.0940348428347339,0.10626822873154232,0.09972482655676185,0.007802552274548907,0.005133272072566735,0.002166986454912428,0.07866566481805626,0.1552667569400362,0.07852789908155675,-0.03798069797314559,-0.0502937747707072,0.11348609067133583,-0.002146962492623746,-0.20358790691639203,0.06879590114599042,-0.11591459015942243,-0.1218945568148924,0.03321024826595269,-0.027859925696481828,0.020007218450851617,0.014431493454092136,0.052639650429022834,0.056978184034887906,0.007799340007003614,0.031220462682335793,0.16666673577793695,0.010408441481931355,-0.03762052936151246,0.03275710650902212,0.004346024772262918,-0.0130415503531828,0.06797832940740839,0.1999559866974219,-0.042058242343440556,-0.22307173108637188,0.12414794904835745,0.12561713530566443,-0.18244935949291594,0.18400526123373917,-0.16826845611664232,0.0803426684231622,0.1623067171427741,0.14300190679782254,0.1837605876166513,0.006462688612661839,0.11952513771136124,-0.3324093275082819,0.03137726320181103,-0.17258251668034924,0.011217030790295497,0.03996294616883077,0.2113137917319127,0.03779921619255335,0.07011234335317412,0.1634120795831472,-0.06457250655616936,0.11192856623922605,-0.19992681370486173,-0.3392611456024551,0.15736686389572502,0.30014044700952447,-0.02073647740507387,0.17808231831412402,-0.11875919251439018,-0.1751823944565052,0.36157555075342246,-0.3425712118794504,0.016253681339188523,0.16911073962736342,0.16933453937240683,-0.1772008093683016,0.07905365814824468,-0.21845331969168105,0.037079630424815185,0.393764176967778,-0.2086258507041632,-0.29730180456336996,0.007498636375080457,-0.002646146646925911,0.008584992115597294,0.0350626152112999,-0.09889040746774319,-0.015992421153517632,0.1328136203632947,-0.1974356421528559,0.0485295866318073,0.04025833872279758,0.32849577823378845,-0.2881668991695629,0.12646953557617205,0.20828762680152946,0.03234418544741987,0.06099372996636346,0.12544830224195277,0.0785383512646071,0.10857925036501055,-0.26441094277718147,-0.2216408863852765,0.2635546996574406,-0.17758098372840736,0.22486559143510249,0.28015606633562423,-0.21150219089628147,0.005408811711959217,0.04227624334243415,-0.15864015220389596,-0.21092533958378795,0.45207521628208824,0.09108306426946074,0.06849434139019694,0.14582484416096658,-0.48576565292941276,0.3269469461022946,0.560117393154986,-0.19101145455923585,-0.08707745185721452,0.2095832167054974,0.3330429107637653,0.4361984010525983,0.5965322553062029,0.18626542472931382,-0.13442625118145018,0.09891189581983724,-0.23747211790531572,0.302296765488922,0.243641847704324,0.0514500352700186,-0.04402159188998558,0.4888981072719507,0.0018009241897987776,0.03609386481524951,0.014861843655224498);

    float ssao(float w, float h, mat4 proj, mat4 camera, sampler2D tpos, sampler2D tnormal, vec2 uv, float radius, float bias) {
        vec2 noise_scale = vec2(w / 4., h / 4.); // noise_texture.size()
        vec3 pos = (inverse(camera) * texture(tpos, uv)).xyz;
        vec3 q = (mat3(transpose(camera))) * texture(tnormal, uv).xyz;
        vec3 normal = (q.xyz);
        float xx = mod(uv.x * noise_scale.x, 1.);
        float yy = mod(uv.y * noise_scale.y, 1.);
        // vec3 rvec = texture(noise, vec2(xx, yy)).xyz;
        vec3 rvec = ssao_noise_lookup(xx, yy);
        vec3 tangent   = normalize(rvec - normal * dot(rvec, normal));
        vec3 bitangent = cross(normal, tangent);
        mat3 TBN       = mat3(tangent, bitangent, normal);
        float occlusion = 0.;
        for(int i = 0; i < 192; i += 3) {
            vec3 s = TBN * vec3(
                ssao_kernel[i],
                ssao_kernel[i + 1],
                ssao_kernel[i + 2]
            );
            s = pos + s * radius; 
            vec4 offset = vec4(s, 1);
            offset      = proj * offset;
            offset.xyz /= offset.w;
            offset.xyz  = offset.xyz * 0.5 + 0.5;
            float depth = (inverse(camera) * texture(tpos, offset.xy)).z;
            float range = smoothstep(0., 1., radius / abs(pos.z - depth));
            occlusion += (depth >= s.z + bias? 1. : 0.) * range;
        }  
        occlusion = 1. - clamp(occlusion / 64., 0., 1.);
        return occlusion;
    }











`
let misc = `
    float aspect(sampler2D t) {
        ivec2 size = textureSize(t, 0);
        return float(size.x) / float(size.y);
    }

    // mat4 quat2mat(vec4 q) {
    //     float x2 = q.x + q.x, y2 = q.y + q.y, z2 = q.z + q.z;
    //     float xx = q.x * x2,  xy = q.x * y2,  xz = q.x * z2;
    //     float yy = q.y * y2,  yz = q.y * z2,  zz = q.z * z2;
    //     float wx = q.w * x2,  wy = q.w * y2,  wz = q.w * z2;
    //     vec3 s = vec3(1);
    //     mat4 m = mat4(1);
    //     m[0][0] = (1. - (yy + zz)) * s.x;
    //     m[1][0] = (xy + wz) * s.x;
    //     m[2][0] = (xz - wy) * s.x;
    //     m[0][1] = (xy - wz) * s.y;
    //     m[1][1] = (1. - (xx + zz)) * s.y;
    //     m[2][1] = (yz + wx) * s.y;
    //     m[0][2] = (xz + wy) * s.z;
    //     m[1][2] = (yz - wx) * s.z;
    //     m[2][2] = (1. - (xx + yy)) * s.z;
    //     return transpose(m); /////////////////////////////////////////////////////////
    // }
    // mat4 clip_x(sampler2D s, uvec4 joints, vec4 weights, float time) {
    //     vec4 head = texelFetch(s, ivec2(0, 0), 0);
    //     float length = head.x;
    //     // if(length == 0.) return mat4(1);
    //     float fps = head.y;
    //     int bones = int(head.z);
    //     if(bones <= 1) return mat4(1);
    //     float t = mod(time, length);
    //     int frame = int(t * fps);
    //     mat4 r = mat4(0);
    //     int size = textureSize(s, 0).x;
    //     for(int i = 0; i < 4; i++) {
    //         int p = 1 + frame * bones * 2 + (int(joints[i]) + 1) * 2;

    //         int x = p % size;
    //         int y = p / size;
    //         int x2 = (p + 1) % size;
    //         int y2 = (p + 1) / size;


    //         // int x = int(floor(mod(float(p), float(size))));
    //         // int y = int(floor(   float(p) / float(size)));
    //         // int x2 = int(floor(mod(float(p + 1), float(size))));
    //         // int y2 = int(floor(   float(p + 1) / float(size)));


    //         // x = p - (y * size);
    //         vec3 a =  texelFetch(s, ivec2(x, y), 0).xyz;
    //         vec4 aq = texelFetch(s, ivec2(x2, y2), 0);

    //         // vec3 a =  texelFetch(s, ivec2(p, 0), 0).xyz;
    //         // vec4 aq = texelFetch(s, ivec2(p + 1, 0), 0);
    //         r += (translate(a.x, a.y, a.z) * quat2mat(aq)) * weights[i];
    //     }
    //     return r;
    // }

    // float texel(sampler2D s, int p) {
    //     int channels = 4;
    //     int width = textureSize(s, 0).x * channels;
    //     int x = p % width;
    //     int y = p / width;
    //     vec4 tex = texelFetch(s, ivec2(x / channels, y), 0);
    //     int offset = x % channels;
    //     return tex[offset];
    // }
    mat4 clip_item(sampler2D s, int p, int size) {
        int x1 = p % size;
        int y1 = p / size;
        int x2 = (p + 1) % size;
        int y2 = (p + 1) / size;
        int x3 = (p + 2) % size;
        int y3 = (p + 2) / size;
        int x4 = (p + 3) % size;
        int y4 = (p + 3) / size;
        vec4 a = texelFetch(s, ivec2(x1, y1), 0);
        vec4 b = texelFetch(s, ivec2(x2, y2), 0);
        vec4 c = texelFetch(s, ivec2(x3, y3), 0);
        vec4 d = texelFetch(s, ivec2(x4, y4), 0);
        return mat4(a, b, c, d);
    }
    mat4 clip(sampler2D s, uvec4 joints, vec4 weights, float time) {
        vec4 head = texelFetch(s, ivec2(0, 0), 0);
        float length = head.x;
        float fps = head.y;
        int stride = int(head.z);
        float t = mod(time, length);
        int frame = int(t * fps);
        int size = textureSize(s, 0).x;
        int p = 1 + frame * stride * 4 + 0;
        mat4 r = clip_item(s, p, size);
        if(stride <= 1) return r;
        mat4 q = mat4(0);
        for(int i = 0; i < 4; i++) {
            int p = 1 + frame * stride * 4 + (int(joints[i]) + 1) * 4;
            q += clip_item(s, p, size) * weights[i];
        }
        return r * q;
    }

// dist
    // https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
    // https://www.geometrictools.com/Source/Distance3D.html
    // r = 0.0025
    // distrayseg
    // if m is 1, returns depth
    //    when 0, just 0 (overlap)
    // float distrayseg(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float r, float m, float none) {
    //     vec3 ba = pb - pa;
    //     vec3 oa = ro - pa;
    //     float baba = dot(ba, ba);
    //     float bard = dot(ba, rd);
    //     float baoa = dot(ba, oa);
    //     float rdoa = dot(rd, oa);
    //     float oaoa = dot(oa, oa);
    //     float a = baba        - bard * bard;
    //     float b = baba * rdoa - baoa * bard;
    //     float c = baba * oaoa - baoa * baoa - r * r * baba;
    //     float h = b * b - a * c;
    //     if(h >= 0.) {
    //         float t = (-b - sqrt(h)) / a;
    //         float y = baoa + t * bard;
    //         if(y > 0. && y < baba) { // body
    //             return t * m;
    //         }
    //         vec3 oc = (y <= 0.)? oa : ro - pb; // caps
    //         b = dot(rd, oc);
    //         c = dot(oc, oc) - r * r;
    //         h = b * b - c;
    //         if(h > 0.) return -b - sqrt(h);
    //     }
    //     return none;
    // }

    // px and py are the pivot points; (-0.5, -0.5 is top left, 0.5, 0.5 is bottom right)
    mat4 sprite(float tw, float th, float x, float y, float w, float h, float r, float px, float py) {
        mat4 m = ortho(-tw / 2., tw / 2., th / 2., -th / 2., 0., 1.);
        m *= translate(x + w / 2. - tw / 2., -y - h / 2. + th / 2., 0.);
        m *= translate(px * w, -py * h, 0.);
        m *= rotatez(r);
        m *= scale(w, h, 1.);
        m *= translate(-px, py, 0.);
        return m;                
    }


`
let blend = (name, f) => `
    float ` + name + `_f(float Sc, float Dc) {
        return ` + f + `;
    }
    // vec4 ` + name + `(vec4 Sca, vec4 Dca) {
    vec4 ` + name + `(vec4 Dca, vec4 Sca) {
        vec3 Sc = Sca.a == 0.? vec3(0) : Sca.rgb / Sca.a;
        vec3 Dc = Dca.a == 0.? vec3(0) : Dca.rgb / Dca.a;
        float Sa = Sca.a;
        float Da = Dca.a;
        float X = 1.;
        float Y = 1.;
        float Z = 1.;
        float r = ` + name + `_f(Sc.r, Dc.r) * Sa * Da + Y * Sca.r * (1.-Da) + Z * Dca.r * (1.-Sa);
        float g = ` + name + `_f(Sc.g, Dc.g) * Sa * Da + Y * Sca.g * (1.-Da) + Z * Dca.g * (1.-Sa);
        float b = ` + name + `_f(Sc.b, Dc.b) * Sa * Da + Y * Sca.b * (1.-Da) + Z * Dca.b * (1.-Sa);
        float a = X * Sa * Da  + Y * Sa  * (1.-Da) + Z * Da  * (1.-Sa);
        return vec4(r, g, b, a);
    }
`
let blendmodes = `
    ` + blend('blend', `Sc`) + `
    // dissolve
    ` + blend('darken',  `min(Sc, Dc)`) + `
    ` + blend('multiply', `Sc * Dc`) + `
    ` + blend('colorburn', `(Sc == 0.)? 0. : 1. - min(1., (1. - Dc) / Sc)`) + `
    ` + blend('linearburn', `max(Dc + Sc - 1., 0.)`) + `
    // darker color
    ` + blend('lighten', `max(Sc, Dc)`) + `
    ` + blend('screen', `Sc + Dc - (Sc * Dc)`) + `
    ` + blend('colordodge', `(Sc == 1.)? 1. : min(1., Dc / (1. - Sc))`) + `
    ` + blend('addition', `Sc + Dc`) + ` // linear dodge
    // lighter color
    ` + blend('overlay', `
        (2. * Dc <= 1.)?
            2. * Sc * Dc
        :
            1. - 2. * (1. - Dc) * (1. - Sc)
    `) + `
    ` + blend('softlight', `
        (2. * Sc <= 1.)?
            Dc - (1. - 2. * Sc) * Dc * (1. - Dc)
        : (2. * Sc > 1. && 4. * Dc <= 1.)?
            Dc + (2. * Sc - 1.) * (4. * Dc * (4. * Dc + 1.) * (Dc - 1.) + 7. * Dc)
        :
            Dc + (2. * Sc - 1.) * (pow(Dc, 0.5) - Dc)`) + `
    ` + blend('hardlight', `(2. * Sc <= 1.)? 2. * Sc * Dc : 1. - 2. * (1. - Dc) * (1. - Sc)`) + `
    // vividlight
    // linearlight
    // pinlight
    // hardmix
    ` + blend('difference', `abs(Dc - Sc)`) + `
    ` + blend('exclusion',  `Sc + Dc - 2. * Sc * Dc`) + `
    ` + blend('subtract',   `Dc - Sc`) + `
    // divide
    // hue
    // saturation
    // color
    // luminosity
`
let ETC = `
    // vec3[2] ray(mat4 proj, mat4 camera, vec2 uv) {
    //     proj[2][2] = -1.;
    //     proj[3][2] = -1.;
    //     vec3 ro = position(camera);
    //     vec4 ndc = vec4(uv * 2. - 1., 1., 1.);
    //     vec3 rd = normalize((camera * inverse(proj) * ndc).xyz);
    //     return vec3[2](ro, rd);
    // }

    // // i is image, s screen
    // vec2 uvfit(vec2 uv, float i, float s) {
    //     uv -= 0.5;
    //     if(s > i) uv.x = s * uv.x / i;
    //     else      uv.y = (1. / s) * uv.y / (1. / i);
    //     uv += 0.5;
    //     return uv;
    // }
    // vec2 uvscale(vec2 uv, float n) {
    //     uv -= 0.5;
    //     uv *= 1. / n;
    //     uv += 0.5;
    //     return uv;
    // }

    vec2 mirror(vec2 uv) {
        uv.x = mod(uv.x, 2.);
        uv.y = mod(uv.y, 2.);
        if(uv.x > 1.) uv.x = 1. - (uv.x - 1.);
        if(uv.y > 1.) uv.y = 1. - (uv.y - 1.);
        return uv;
    }

    // float disp(sampler2D disp, vec2 uv, float time, float scale) {
    //     uv *= scale;
    //     uv += time;
    //     return textureLod(disp, mirror(uv), 0.).x;
    // }

    float vnoise_F(vec2 p) {
        #define rand(f) fract(sin(f) * 10000.)   
        #define rand2d(x, y) rand(x + y * 100.)    // OG 10000.
        float sw = rand2d(floor(p.x), floor(p.y));
        float se = rand2d(ceil(p.x),  floor(p.y));
        float nw = rand2d(floor(p.x), ceil(p.y));
        float ne = rand2d(ceil(p.x),  ceil(p.y));
        #undef rand
        #undef rand2d
        vec2 inter = smoothstep(0., 1., fract(p));
        float s = mix(sw, se, inter.x);
        float n = mix(nw, ne, inter.x);
        return mix(s, n, inter.y);
    }
    // float fbm(vec2 p) {
    //     float total = 0.0;
    //     total += vnoise_F(p);
    //     total += vnoise_F(p * 2.) / 2.;
    //     total += vnoise_F(p * 4.) / 4.;
    //     total += vnoise_F(p * 8.) / 8.;
    //     total += vnoise_F(p * 16.) / 16.;
    //     total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;
    //     return total;
    // }
    float vnoise(vec2 p, int octs) {
        float total = 0.;
        float div = 0.;
        for(int i = 0; i < octs; i++) {
            float mul = pow(2., float(i));
            total += vnoise_F(p * mul) / mul;
            div += 1. / mul;
        }
        return total / div;
    }


`
let shaderlib = `
    ` + math + `
    ` + matrices + `
    ` + lights + `
    ` + surface + `
    ` + particles + `
    ` + color + `
    ` + filters + `
    ` + misc + `
    ` + blendmodes + `
    ` + ETC + `
`

let shadertag = '//// code'

export let shader = (code:string, types:Array<[string, string]>):[string, string] => {
    let global = prefix
    let $code = code + (code.includes(' vertex(')? '' : //# includes
    `
        mat4 vertex(vx a) {
            return orthoquad;
        }    
    `)
    let vmats = $code.includes('mat4 vertex(')?    1 : //# includes
                $code.includes('mat4[3] vertex(')? 2 : //# includes
                0
    let pvm = vmats == 2
    let pcols = $code.includes('vec4 pixel(')?     1 : //# includes
                $code.includes('vec4[2] pixel(')?  2 :
                $code.includes('vec4[3] pixel(')?  3 :
                $code.includes('vec4[4] pixel(')?  4 :
                $code.includes('vec5 pixel(')?    5 : //# includes
                // $code.includes('vec4f[2] pixel(')? 6 :
                // $code.includes('vec4f[3] pixel(')? 7 :
                // $code.includes('vec4f[4] pixel(')? 8 :
                0
    let uniforms = types.map(([k, t]) => 'uniform ' + t + ' ' + global + k + ';').join('\n')         //# map join
    let args =     types.map(([k, t]) => t === 'sampler2D'? '' : t + ' ' + k + ';').join('\n')       //# map join
    let init =     types.map(([k, t]) => t === 'sampler2D'? '' : ', ' + global + k + '').join('') //# map join
    let ret =      types.map(([k, t]) => t === 'sampler2D'? k : '').filter(_ => _).join('|') //# map filter join
    let re = new RegExp('(^|\\W)(v|p|a)\\.(' + ret + ')(\\W|$)', 'g') //# RegExp
    $code = $code.replace(re, (m, _, a, b, c) => {
        return _ + global + b + c
    })  //# replace
    // console.log('CODE ', $code)
    let glsl = `#version 300 es
        precision highp float;
        precision highp int;
        ` + shaderlib + `
        ` + shadertag + `
        ` + uniforms + `
        struct vx {
            int instance;
            uvec4 joints;
            vec4 weights;
            ` + args + `
        };
        struct px {
            int instance;
            vec2 uv;
            bool front;
            float depth;
            ivec2 st;
            ` + (pvm? `
                vec3 pos;
                float posw;
                vec3 normal;
                // vec3 vpos;
                // vec3 vnormal;
                mat3 tbn;
                vec3 eye;`
            : '') + `
            ` + args + `
        };
        struct vec5 { vec4 _v4; float _f; };
        // f -> nowrite
    `
    let vertex = glsl + `
        #define discard 0.
        ` + $code + `
        layout(location=0) in  vec4 a_pos;
        layout(location=1) in  vec2 a_uv;
        layout(location=2) in  vec3 a_normal;
        layout(location=3) in  vec4 a_tangent;
        layout(location=4) in uvec4 a_joints;
        layout(location=5) in  vec4 a_weights;
        out vec4 v_pos;
        out vec2 v_uv;
        out vec3 v_normal;
        out vec3 v_tangent;
        out vec3 v_bitangent;
        
        // out vec4 v_vpos;
        // out vec3 v_vnormal;

        flat out vec3 v_eye;
        flat out int  v_instance;
        void main()	{
            vx args = vx(
                gl_InstanceID,
                a_joints,
                a_weights
                ` + init + `
            );            
            mat4 m = mat4(1);
            mat4 v = mat4(1);
            mat4 p = mat4(1);
            ` + (pvm? `
                mat4[3] pvm = vertex(args);
                p = pvm[0];
                v = pvm[1];
                m = pvm[2];`
            : `
                m = vertex(args);
            `) + `
            gl_Position = (p * v * m) * a_pos;
            v_uv = a_uv;
            v_instance = gl_InstanceID;
            ` + (pvm? `
                v_pos = m * a_pos;
                // v_vpos = (v * m) * a_pos;

                mat3 nm = mat3(transpose(inverse(m)));
                v_normal = normalize(nm * a_normal);

                // mat3 vnm = mat3(transpose(inverse(v * m)));
                // v_vnormal = normalize(vnm * a_normal);

                v_tangent = normalize(nm * a_tangent.xyz);
                v_bitangent = normalize(cross(v_normal, v_tangent) * a_tangent.w);
                v_eye = position(inverse(v));`
            : '') + `
        }`
    let pixel = glsl + `
        ` + $code + `
        in vec4 v_pos;
        in vec2 v_uv;
        in vec3 v_normal;
        in vec3 v_tangent;
        in vec3 v_bitangent;

        // in vec4 v_vpos;
        // in vec3 v_vnormal;

        flat in vec3 v_eye;
        flat in int v_instance;
        out vec4[${pcols === 4? '4' : pcols === 3? '3' : pcols === 2? '2' : '1'}] color; // resizes?
        void main() {
            vec3 normal = normalize(v_normal);
            vec3 tangent = normalize(v_tangent);
            vec3 bitangent = normalize(v_bitangent);
            // vec3 vnormal = normalize(v_vnormal);
            px args = px(
                v_instance,
                v_uv,
                gl_FrontFacing,
                gl_FragCoord.z,
                ivec2(gl_FragCoord.xy)
                // 1.0 - (gl_FragCoord.z / gl_FragCoord.w) / 10000.
                ` + (pvm? `,
                    v_pos.xyz,
                    v_pos.w,
                    normal,
                    // v_vpos.xyz,
                    // vnormal,
                    mat3(tangent, bitangent, normal),
                    v_eye`
                : '') + `
                ` + init + `
            );
            ` +  (pcols == 1? `
                vec4 c = pixel(args);
                color[0] = c;
            ` :
                pcols == 2? `
                vec4[2] c = pixel(args);
                color[0] = c[0];
                color[1] = c[1];
            ` :
                pcols == 3? `
                vec4[3] c = pixel(args);
                color[0] = c[0];
                color[1] = c[1];
                color[2] = c[2];
            ` :
                pcols == 4? `
                vec4[4] c = pixel(args);
                color[0] = c[0];
                color[1] = c[1];
                color[2] = c[2];
                color[3] = c[3];
            ` :
                pcols == 5? `
                vec5 c = pixel(args);
                color[0] = c._v4;
                gl_FragDepth = c._f;
            ` :
                pcols == 0? `
                color[0] = vec4(0);
            ` :
               (() => { throw pcols })()
            ) + `
        }`
    // console.log(vertex, pixel)
    return [vertex, pixel]
}

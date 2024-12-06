///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2017 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

import { GL, WEBGL_INFO } from "./constants.js";

/**
    WebGL shader.

    @class
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLShader} shader The shader.
*/
export class Shader {

    constructor(gl, appState, type, source) {
        this.gl = gl;
        this.appState = appState;
        this.shader = null;
        this.type = type;
        this.source = source.trim();

        this.restore();
    }

    /**
        Restore shader after context loss.

        @method
        @return {Shader} The Shader object.
    */
    restore() {
        this.shader = this.gl.createShader(this.type);
        this.gl.shaderSource(this.shader, this.source);
        this.gl.compileShader(this.shader);

        return this;
    }

    /**
        Get the shader source translated for the platform's API.

        @method
        @return {String} The translated shader source.
    */
    translatedSource() {
        if (WEBGL_INFO.DEBUG_SHADERS) {
            return this.appState.extensions.debugShaders.getTranslatedShaderSource(this.shader);
        } else {
            return "(Unavailable)";
        }
    }

    /**
        Delete this shader.

        @method
        @return {Shader} The Shader object.
    */
    delete() {
        if (this.shader) {
            this.gl.deleteShader(this.shader);
            this.shader = null;
        }

        return this;
    }


    checkCompilation() {


        let error_handler = () => {
            if(this.type == 35632) return  true
            let codetag = '//// code'
            let source_line = (source) => {
                let lines = 0
                let chars = source.split('')
                for(let i = 0; i < chars.length; i++) {
                    let c = chars[i]
                    if(c == '\n') lines++
                    if(source.substr(i, codetag.length) === codetag) return lines
                }
                return -1
            }
            let error_line = (err) => {
                return parseInt(err.split(':')[2])
            }
            let error_msg = (err) => {
                return err.split(':').slice(3).join(':')
            }
            if(this.source.includes(codetag)) {
                let srcline = source_line(this.source)
                let errs = this.gl.getShaderInfoLog(this.shader).split('\n').slice(0, -1)
                errs.forEach((err) => {
                    let errline = error_line(err)
                    if(errline < srcline) {
                        console.error('error before ' + codetag)
                    }// }
                    let showline = (n) => '    ' + this.source.split('\n')[errline - 1 + n]
                    console.error([
                        'line:' + (errline - srcline),
                        '    ' + showline(-2),
                        '    ' + showline(-1),
                        '>>>>' + showline(0),
                        '    ' + showline(1),
                        '    ' + showline(2),
                        error_msg(err)
                    ].join('\n'))
                })
                return true
            }
            return false
        }
        error_handler()
        return this

        if (!this.gl.getShaderParameter(this.shader, GL.COMPILE_STATUS)) {
            let i, lines;

            console.error(this.gl.getShaderInfoLog(this.shader));
            lines = this.source.split("\n");
            for (i = 0; i < lines.length; ++i) {
                console.error(`${i + 1}: ${lines[i]}`);
            }
        }

        return this;
    }
}

if (!window.boc) { window.boc = {}; }
if (!boc.components) { boc.gl.components = {}; }
if (!boc.systems) { boc.gl.systems = {}; }

boc.components.WebGLDrawable = function () {
    this.position = null;
    this.texture = null;    
    this.color = null; 
    this.className = function () { return 'WebGLDrawable'; }
}

// lots and lots from here : https://github.com/corbanbrook/webgl-2d/blob/master/webgl-2d.js
boc.systems.WebGLRenderSystem = function (em, canvas, camera) {
    var reRGBAColor = /^rgb(a)?\(\s*(-?[\d]+)(%)?\s*,\s*(-?[\d]+)(%)?\s*,\s*(-?[\d]+)(%)?\s*,?\s*(-?[\d\.]+)?\s*\)$/;
    var reHSLAColor = /^hsl(a)?\(\s*(-?[\d\.]+)\s*,\s*(-?[\d\.]+)%\s*,\s*(-?[\d\.]+)%\s*,?\s*(-?[\d\.]+)?\s*\)$/;
    var reHex6Color = /^#([0-9A-Fa-f]{6})$/;
    var reHex3Color = /^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/;

    function HSLAToRGBA(h, s, l, a) {
        var r, g, b, m1, m2;

        // Clamp and Normalize values
        h = (((h % 360) + 360) % 360) / 360;
        s = s > 100 ? 1 : s / 100;
        s = s < 0 ? 0 : s;
        l = l > 100 ? 1 : l / 100;
        l = l < 0 ? 0 : l;

        m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        m1 = l * 2 - m2;

        function getHue(value) {
            var hue;

            if (value * 6 < 1) {
                hue = m1 + (m2 - m1) * value * 6;
            } else if (value * 2 < 1) {
                hue = m2;
            } else if (value * 3 < 2) {
                hue = m1 + (m2 - m1) * (2 / 3 - value) * 6;
            } else {
                hue = m1;
            }

            return hue;
        }

        r = getHue(h + 1 / 3);
        g = getHue(h);
        b = getHue(h - 1 / 3);

        return [r, g, b, a];
    }


    // Converts rgb(a) color string to gl color vector
    function colorStringToVec4(value) {
        var result = [], match, channel, isPercent, hasAlpha, alphaChannel, sameType;

        if ((match = reRGBAColor.exec(value))) {
            hasAlpha = match[1], alphaChannel = parseFloat(match[8]);

            if ((hasAlpha && isNaN(alphaChannel)) || (!hasAlpha && !isNaN(alphaChannel))) {
                return false;
            }

            sameType = match[3];

            for (var i = 2; i < 8; i += 2) {
                channel = match[i], isPercent = match[i + 1];

                if (isPercent !== sameType) {
                    return false;
                }

                // Clamp and normalize values
                if (isPercent) {
                    channel = channel > 100 ? 1 : channel / 100;
                    channel = channel < 0 ? 0 : channel;
                } else {
                    channel = channel > 255 ? 1 : channel / 255;
                    channel = channel < 0 ? 0 : channel;
                }

                result.push(channel);
            }

            result.push(hasAlpha ? alphaChannel : 1.0);
        } else if ((match = reHSLAColor.exec(value))) {
            hasAlpha = match[1], alphaChannel = parseFloat(match[5]);
            result = HSLAToRGBA(match[2], match[3], match[4], parseFloat(hasAlpha && alphaChannel ? alphaChannel : 1.0));
        } else if ((match = reHex6Color.exec(value))) {
            var colorInt = parseInt(match[1], 16);
            result = [((colorInt & 0xFF0000) >> 16) / 255, ((colorInt & 0x00FF00) >> 8) / 255, (colorInt & 0x0000FF) / 255, 1.0];
        } else if ((match = reHex3Color.exec(value))) {
            var hexString = "#" + [match[1], match[1], match[2], match[2], match[3], match[3]].join("");
            result = colorStringToVec4(hexString);
        } else if (value.toLowerCase() in colorKeywords) {
            result = colorStringToVec4(colorKeywords[value.toLowerCase()]);
        } else if (value.toLowerCase() === "transparent") {
            result = [0, 0, 0, 0];
        } else {
            // Color keywords not yet implemented, ie "orange", return hot pink
            return false;
        }

        return result;
    }

    function colorVecToString(vec4) {
        return "rgba(" + (vec4[0] * 255) + ", " + (vec4[1] * 255) + ", " + (vec4[2] * 255) + ", " + parseFloat(vec4[3]) + ")";
    }

    var colorKeywords = {
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgrey: "#d3d3d3",
        lightgreen: "#90ee90",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370d8",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#d87093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
    };

    var shaderMask = {
        texture: 1,
        crop : 2
    };

    var storedPrograms = []; // smask -> program

    var textureCache = {}; // srcPath -> WebGLTexture
    var gl;

    // borrowed from here: https://github.com/corbanbrook/webgl-2d/blob/master/webgl-2d.js
    function getFragmentShaderSource(sMask) {
        var str =
            [
                "#define hasTexture " + ((sMask & shaderMask.texture) ? "1" : "0"),
                "#define hasCrop " + ((sMask & shaderMask.crop) ? "1" : "0"),

                "precision mediump float;",

                "varying vec4 vColor;",

                "#if hasTexture",
                    "varying vec2 vTextureCoord;",
                    "uniform sampler2D uSampler;",
                    "#if hasCrop",
                        "uniform vec4 uCropSource;",
                    "#endif",
                "#endif",

                "void main(void) {",
                    "#if hasTexture",
                        "#if hasCrop",
                            "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x * uCropSource.z, vTextureCoord.y * uCropSource.w) + uCropSource.xy);",
                        "#else",
                            "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));",
                        "#endif",
                    "#else",
                        "gl_FragColor = vColor;",
                    "#endif",
                "}"
            ];
        return str.join('\r\n');
    } // getFragShaderSrc

    function getVertexShaderSource(sMask) {
        var str =
            [
                "#define hasTexture " + ((sMask & shaderMask.texture) ? "1" : "0"),

                "attribute vec3 aVertexPosition;",
                "attribute vec4 aVertexColor;",

                "#if hasTexture",
                "attribute vec2 aTextureCoord;",
                "#endif",

                "uniform mat4 uMVMatrix;",
                "uniform mat4 uPMatrix;",

                "varying vec4 vColor;",

                "#if hasTexture",
                "varying vec2 vTextureCoord;",
                "#endif",

                "void main(void) {",
                    "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
                    "vColor = aVertexColor;",

                    "#if hasTexture",
                    "vTextureCoord = aTextureCoord;",
                    "#endif",
                "}"
            ];
        return str.join('\r\n');
    }

    // taken from lessons @ http://learningwebgl.com/blog/?p=507
    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
            console.log(e);
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

   

    function getShaderProgram(sMask) {
        sMask = sMask || 0;

        var shaderProgram = storedPrograms[sMask];
        if (!shaderProgram) {

            // get shader source and compile
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragShader, getFragmentShaderSource(sMask));
            gl.compileShader(fragShader);

            if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(fragShader));
                return null;
            }

            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, getVertexShaderSource(sMask));
            gl.compileShader(vertexShader);

            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(vertexShader));
                return null;
            }

            // create the program and link to webGL
            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, fragShader);
            gl.attachShader(shaderProgram, vertexShader);            
            gl.linkProgram(shaderProgram);            
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            //gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

            if (sMask & shaderMask.texture) {
                shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
                gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
            }

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

            if (sMask & shaderMask.crop) {
                shaderProgram.cropSourceUniform = gl.getUniformLocation(shaderProgram, "uCropSource");
            }            

            storedPrograms[sMask] = shaderProgram;
        }

        return shaderProgram;        
    }
   
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function getPosition(e, s) {
        var buf = gl.createBuffer();        
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        

        var vertices = null;

        //if (em.getComponentForEntity('DrawableSprite', e)) {
            vertices = [
                0.0, 0.0, s.z,
                s.width, 0.0, s.z,
                0.0, s.height, s.z,
                s.width, s.height, s.z
            ];
        //}
        //else if (em.getComponentForEntity('DrawableRect', e)) {
        //    vertices = [
        //        0.0, 0.0, s.z,
        //        s.width, 0.0, s.z,
        //        s.width, s.height, s.z,
        //        0.0, s.height, s.z                
        //    ];
        //}

        var farray = new Float32Array(vertices);
        gl.bufferData(gl.ARRAY_BUFFER, farray, gl.STATIC_DRAW);
        buf.itemSize = 3;
        buf.numItems = 4;

        return { buf: buf };
    }   
    function isPowerOfTwo(x) {
        return (x & (x - 1)) == 0;
    }

    function nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }

    function createTexture(e, d, s) {                             
        var tex = null;
        if (d && d.image) {            
            if (!tex) {
                tex = gl.createTexture();
                var image = d.image;
                if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
                    // Scale up the texture to the next highest power of two dimensions.
                    var canvas = document.createElement("canvas");
                    canvas.width = nextHighestPowerOfTwo(image.width);
                    canvas.height = nextHighestPowerOfTwo(image.height);
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    image = canvas;
                }
                gl.bindTexture(gl.TEXTURE_2D, tex);
                //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
        else {
            tex = textureCache['(null)'];
            if (!tex) {
                gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.bindTexture(gl.TEXTURE_2D, null);
                textureCache['(null)'] = tex;
            }
        }

        return tex;
    }

    function getTextureBuffer(e, d, s) {
        var key = d.image ? d.image.tag : '(null)';
        var texbuf = textureCache[key];

        if (!texbuf) {
            var buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);

            var textureCoords = new Float32Array([
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    1.0, 1.0
                ]);                     

            gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW);
            buf.itemSize = 2;
            buf.numItems = 4;
            buf.coords = textureCoords;

            var tex = createTexture(e, d, s);
            texbuf = { buf: buf, tex: tex };
            textureCache[key] = texbuf;
        }
        
        return texbuf;
    }

    function getColor(e) {
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        var colors = [
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var drawable = boc.utils.getDrawableComponent(e, em);
        if (drawable.fillStyle) {
            colors = [];
            for (var i = 0; i < 4; i++) {
                colors = colors.concat(colorStringToVec4(drawable.fillStyle));
            }
        }

        //TODO: strokestyle stuff

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        buf.itemSize = 4;
        buf.numItems = 4;
        return { buf: buf, col: colors };
    }

    

    var u = 0;
    //var sw = new boc.utils.Stopwatch();
    function drawEntity(e, c) { // entity, drawable
                
        var glComp = em.getComponentForEntity('WebGLDrawable', e); //$em(e).comp('WebGLDrawable');
        var spatial = em.getComponentForEntity('Spatial', e)//$em(e).comp('Spatial');
        
        if (!glComp) {
            glComp = new boc.components.WebGLDrawable(); // has listeners to update the matrix
            glComp.position = getPosition(e, spatial);
            glComp.color = getColor(e); // regex and table look ups, so it's ok
            em.addComponentToEntity(glComp, e); //$em(e).add(glComp);
        }
        
        //sw.start();
        glComp.texture = getTextureBuffer(e, c, spatial); // cached, so it's ok
        
        //sw.stop();
        mvPushMatrix();

        mat4.translate(mvMatrix, [spatial.x, spatial.y, spatial.z]);
        
        //gl.bindBuffer(gl.ARRAY_BUFFER, glComp.position.buf);
        //gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, glComp.position.buf.itemSize, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, glComp.color.buf);
        //gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, glComp.color.buf.itemSize, gl.FLOAT, false, 0, 0);
                
        if (c.image) { // has a sprite...           
            var mask = shaderMask.texture;
            if (c.clipRect) { mask |= shaderMask.crop; }

            var shaderProgram = getShaderProgram(mask);
            gl.useProgram(shaderProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, glComp.position.buf);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, glComp.position.buf.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, glComp.color.buf);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, glComp.color.buf.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, glComp.texture.buf);            
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, glComp.texture.buf.itemSize, gl.FLOAT, false, 0, 0);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, glComp.texture.tex);

            // tells shaders to use texture 0
            gl.uniform1i(shaderProgram.samplerUniform, 0);

            // passes on the modelView and ortho matrices
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

            if (c.clipRect) {
                gl.uniform4f(shaderProgram.cropSourceUniform,
                    c.clipRect.x / c.image.width,
                    c.clipRect.y / c.image.height,
                    c.clipRect.width / c.image.width,
                    c.clipRect.height / c.image.height);
            }
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, glComp.position.buf.numItems);
            //setMatrixUniforms();

            //gl.uniform1i(shaderProgram.useTextureUniform, 1);
        }

        else { // rect colors only
            var mask = 0;
            var shaderProgram = getShaderProgram(mask);
            gl.useProgram(shaderProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, glComp.position.buf);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, glComp.position.buf.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, glComp.color.buf);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, glComp.color.buf.itemSize, gl.FLOAT, false, 0, 0);

            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
            //setMatrixUniforms();
            //gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, glComp.position.buf.numItems);
        }                       

        mvPopMatrix();
        
    }
    
    // binary search/insert
    function insert(arr, startIndex, lastIndex, z, payload) {
        if (arr.length == 0) {
            arr.push({ z: z, payload: [payload] });
        }
        else {
            var midIndex = startIndex + Math.floor((lastIndex - startIndex) / 2);
            var midEle = arr[midIndex];

            if (lastIndex < startIndex) {
                arr.splice(startIndex, 0, { z: z, payload: [payload] });
                return;
            }

            // i found it, push the payload
            if (midEle.z == z) {
                midEle.payload.push(payload);
            }
            else if (z < midEle.z) {
                insert(arr, startIndex, midIndex - 1, z, payload);
            }
            else if (z > midEle.z) {
                insert(arr, midIndex + 1, lastIndex, z, payload);
            }
        }
    }

    this.processTick = function (frameTime) {
        //sw = new boc.utils.Stopwatch();
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.identity(pMatrix);
        mat4.ortho(camera.xmin, camera.xmax, camera.ymax, camera.ymin, -1000, 1000, pMatrix);
              
        mat4.identity(mvMatrix);        

        var drawables = [];        
        drawables = drawables.concat(em.getAllEntitiesWithComponent('DrawableSprite'));
        drawables = drawables.concat(em.getAllEntitiesWithComponent('DrawableRect'));

        //drawables.sort(function (a, b) {
        //    var spatialA = em.getComponentForEntity('Spatial', a);
        //    var spatialB = em.getComponentForEntity('Spatial', b);

        //    if (!spatialA && !spatialB) { return 0; }
        //    if (spatialA && !spatialB) { return 1; }
        //    if (!spatialA && spatialB) { return -1; }
        //    return spatialA.z - spatialB.z;
        //});
        
        //for (var i = 0; i < drawables.length; i++) {
        //    drawEntity(drawables[i], boc.utils.getDrawableComponent(drawables[i], em));
        //}        
        var zOrderedEntities = [];
        for (var i = 0; i < drawables.length; i++) {
            var spatialComponent = em.getComponentForEntity('Spatial', drawables[i]);
            insert(zOrderedEntities, 0, zOrderedEntities.length - 1, spatialComponent.z, drawables[i]);
        }

        for (var j = 0; j < zOrderedEntities.length; j++) {
            var zOrderedEntitiesPayload = zOrderedEntities[j].payload;
            for (var k = 0; k < zOrderedEntitiesPayload.length; k++) {
                drawEntity(zOrderedEntitiesPayload[k], boc.utils.getDrawableComponent(zOrderedEntitiesPayload[k], em));
            }
        }
    } // processTick

    initGL(canvas);
    //initShaders();

    // init shaders; these calls cache the programs to an array    
    getShaderProgram(0); // color-only
    getShaderProgram(shaderMask.texture); // texture-only
    getShaderProgram(shaderMask.texture | shaderMask.crop); // texture + crop
    // there won't ever be a crop-only

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);    
    gl.enable(gl.BLEND);    

};
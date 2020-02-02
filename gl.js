// import THREE from 'three.js'

function AudioSystem() {
    var listener = new THREE.AudioListener();
    var sound    = new THREE.Audio(listener);
    var loader   = new THREE.AudioLoader();

    var FFT_SIZE      = 2048;
    var MASTER_VOLUME = .8;
    var audioContext  = sound.context;
    var analyser      = audioContext.createAnalyser();

    listener.setMasterVolume(MASTER_VOLUME);
    loader.load(URL, function(buffer) {
        console.log('audio loaded.')
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(.5);
        sound.getOutput().connect(analyser);

        // sound.play();
        soundwave.transitionShowSoundwave();
    });

    this.waveform  = new Uint8Array(analyser.frequencyBinCount);
    this.frequency = new Uint8Array(analyser.frequencyBinCount);

    this.sound    = sound;
    this.analyser = analyser;

    audioUniforms.waveform.value = new THREE.DataTexture(this.waveform, FFT_SIZE / 2, 1, THREE.LuminanceFormat);
    audioUniforms.frequency.value = new THREE.DataTexture(this.frequency, FFT_SIZE / 2, 1, THREE.LuminanceFormat);
}

AudioSystem.prototype.start = function() {
    this.sound.play();
}

AudioSystem.prototype.update = function() {
    this.analyser.getByteTimeDomainData(this.waveform);
    this.analyser.getByteFrequencyData(this.frequency);
}

AudioSystem.prototype.play = function() {
    this.sound.play();
}

// =====================================================

THREE.ShaderChunk.app = "\n\nuniform vec2 screen;\nuniform vec2 mouse;\nuniform float dt;\nuniform float time;\n\n";
THREE.ShaderChunk.audio = "\n\nuniform sampler2D waveform;\nuniform sampler2D frequency;\n\nuniform float instantVolume;\nuniform float smoothedVolume;\n\nfloat sampleAudioTexture(sampler2D tex, float coord) {\n\n  return texture2D(tex, vec2(coord, 0.0)).r;\n\n}\n\nfloat averageAudioTexture(sampler2D tex, float coord, float width) {\n\n  float result = 0.0;\n\n  for (int i = 0; i < 4; ++i) {\n    \n    result += sampleAudioTexture(tex, coord + width * (float(i) - 2.0)) / 4.0;\n    \n  }\n  \n  return result;\n  \n}\n\n";
THREE.ShaderChunk.rotation_matrix = "\n\nmat4 createRotationMatrix(vec3 axis, float angle) {\n  \n  axis = normalize(axis);\n  float s = sin(angle);\n  float c = cos(angle);\n  float oc = 1.0 - c;\n\n  return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n              0.0,                                0.0,                                0.0,                                1.0);\n\n}\n\n";
THREE.ShaderChunk.hash = "\n\n// Pseudorandom hash functions\n// https://www.shadertoy.com/view/4djSRW\n\n// Use these for integer stepped ranges, ie Value-Noise/Perlin noise functions.\n#define HASHSCALE1 0.1031\n#define HASHSCALE3 vec3(0.1031, 0.1030, 0.0973)\n#define HASHSCALE4 vec4(1031, 0.1030, 0.0973, 0.1099)\n\n// Use these for smaller input rangers like audio tick or 0-1 UVs.\n// #define HASHSCALE1 443.8975\n// #define HASHSCALE3 vec3(443.897, 441.423, 437.195)\n// #define HASHSCALE4 vec4(443.897, 441.423, 437.195, 444.129)\n\nfloat hash11(float p)\n{\n  vec3 o = fract(vec3(p,p,p) * HASHSCALE1);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.x + o.y) * o.z);\n}\n\nfloat hash12(vec2 p)\n{\n  vec3 o = fract(p.xyx * HASHSCALE1);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.x + o.y) * o.z);\n}\n\nfloat hash13(vec3 p)\n{\n  vec3 o = fract(p.xyz * HASHSCALE1);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.x + o.y) * o.z);\n}\n\nvec2 hash21(float p)\n{\n  vec3 o = fract(vec3(p,p,p) * HASHSCALE3);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.xx + o.yz) * o.zy);\n}\n\nvec2 hash22(vec2 p)\n{\n  vec3 o = fract(p.xyx * HASHSCALE3);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.xx + o.yz) * o.zy);\n\n}\n\nvec2 hash23(vec3 p)\n{\n  vec3 o = fract(p.xyz * HASHSCALE3);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.xx+o.yz) * o.zy);\n}\n\nvec3 hash31(float p)\n{\n  vec3 o = fract(vec3(p,p,p) * HASHSCALE3);\n  o += dot(o, o.yzx + 19.19);\n  return fract((o.xxy + o.yzz) * o.zyx); \n}\n\nvec3 hash32(vec2 p)\n{\n  vec3 o = fract(p.xyx * HASHSCALE3);\n  o += dot(o, o.yxz + 19.19);\n  return fract((o.xxy + o.yzz) * o.zyx);\n}\n\nvec3 hash33(vec3 p)\n{\n  vec3 o = fract(p.xyz * HASHSCALE3);\n  o += dot(o, o.yxz + 19.19);\n  return fract((o.xxy + o.yxx) * o.zyx);\n}\n\nvec4 hash41(float p)\n{\n  vec4 o = fract(vec4(p,p,p,p) * HASHSCALE4);\n  o += dot(o, o.wzxy + 19.19);\n  return fract((o.xxyz + o.yzzw) * o.zywx);\n}\n\nvec4 hash42(vec2 p)\n{\n  vec4 o = fract(p.xyxy * HASHSCALE4);\n  o += dot(o, o.wzxy + 19.19);\n  return fract((o.xxyz + o.yzzw) * o.zywx);\n}\n\nvec4 hash43(vec3 p)\n{\n  vec4 o = fract(p.xyzx * HASHSCALE4);\n  o += dot(o, o.wzxy + 19.19);\n  return fract((o.xxyz + o.yzzw) * o.zywx);\n}\n\nvec4 hash44(vec4 p)\n{\n  vec4 o = fract(p.xyzw * HASHSCALE4);\n  o += dot(o, o.wzxy + 19.19);\n  return fract((o.xxyz + o.yzzw) * o.zywx);\n}\n\n";
THREE.ShaderChunk.noise = "\n\n#include <hash>\n\n// http://iquilezles.org/www/articles/gradientnoise/gradientnoise.htm\n\n// returns 3D value noise\nfloat noise(in vec3 x)\n{\n    // grid\n    vec3 p = floor(x);\n    vec3 w = fract(x);\n    \n    // quintic interpolant\n    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);\n    \n    // gradients\n    vec3 ga = hash33( p+vec3(0.0,0.0,0.0) );\n    vec3 gb = hash33( p+vec3(1.0,0.0,0.0) );\n    vec3 gc = hash33( p+vec3(0.0,1.0,0.0) );\n    vec3 gd = hash33( p+vec3(1.0,1.0,0.0) );\n    vec3 ge = hash33( p+vec3(0.0,0.0,1.0) );\n    vec3 gf = hash33( p+vec3(1.0,0.0,1.0) );\n    vec3 gg = hash33( p+vec3(0.0,1.0,1.0) );\n    vec3 gh = hash33( p+vec3(1.0,1.0,1.0) );\n    \n    // projections\n    float va = dot( ga, w-vec3(0.0,0.0,0.0) );\n    float vb = dot( gb, w-vec3(1.0,0.0,0.0) );\n    float vc = dot( gc, w-vec3(0.0,1.0,0.0) );\n    float vd = dot( gd, w-vec3(1.0,1.0,0.0) );\n    float ve = dot( ge, w-vec3(0.0,0.0,1.0) );\n    float vf = dot( gf, w-vec3(1.0,0.0,1.0) );\n    float vg = dot( gg, w-vec3(0.0,1.0,1.0) );\n    float vh = dot( gh, w-vec3(1.0,1.0,1.0) );\n\t\n    // interpolation\n    return va + \n           u.x*(vb-va) + \n           u.y*(vc-va) + \n           u.z*(ve-va) + \n           u.x*u.y*(va-vb-vc+vd) + \n           u.y*u.z*(va-vc-ve+vg) + \n           u.z*u.x*(va-vb-ve+vf) + \n           u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);\n}\n\n// returns 3D value noise (in .x)  and its derivatives (in .yzw)\nvec4 noised( in vec3 x )\n{\n    // grid\n    vec3 p = floor(x);\n    vec3 w = fract(x);\n    \n    // quintic interpolant\n    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);\n    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);\n    \n    // gradients\n    vec3 ga = hash33( p+vec3(0.0,0.0,0.0) );\n    vec3 gb = hash33( p+vec3(1.0,0.0,0.0) );\n    vec3 gc = hash33( p+vec3(0.0,1.0,0.0) );\n    vec3 gd = hash33( p+vec3(1.0,1.0,0.0) );\n    vec3 ge = hash33( p+vec3(0.0,0.0,1.0) );\n    vec3 gf = hash33( p+vec3(1.0,0.0,1.0) );\n    vec3 gg = hash33( p+vec3(0.0,1.0,1.0) );\n    vec3 gh = hash33( p+vec3(1.0,1.0,1.0) );\n    \n    // projections\n    float va = dot( ga, w-vec3(0.0,0.0,0.0) );\n    float vb = dot( gb, w-vec3(1.0,0.0,0.0) );\n    float vc = dot( gc, w-vec3(0.0,1.0,0.0) );\n    float vd = dot( gd, w-vec3(1.0,1.0,0.0) );\n    float ve = dot( ge, w-vec3(0.0,0.0,1.0) );\n    float vf = dot( gf, w-vec3(1.0,0.0,1.0) );\n    float vg = dot( gg, w-vec3(0.0,1.0,1.0) );\n    float vh = dot( gh, w-vec3(1.0,1.0,1.0) );\n\t\n    // interpolation\n    float v = va + \n              u.x*(vb-va) + \n              u.y*(vc-va) + \n              u.z*(ve-va) + \n              u.x*u.y*(va-vb-vc+vd) + \n              u.y*u.z*(va-vc-ve+vg) + \n              u.z*u.x*(va-vb-ve+vf) + \n              u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);\n              \n    vec3 d = ga + \n             u.x*(gb-ga) + \n             u.y*(gc-ga) + \n             u.z*(ge-ga) + \n             u.x*u.y*(ga-gb-gc+gd) + \n             u.y*u.z*(ga-gc-ge+gg) + \n             u.z*u.x*(ga-gb-ge+gf) + \n             u.x*u.y*u.z*(-ga+gb+gc-gd+ge-gf-gg+gh) +   \n             \n             du * (vec3(vb-va,vc-va,ve-va) + \n                   u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + \n                   u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + \n                   u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh));\n                   \n    return vec4( v, d );                   \n}\n";
THREE.ShaderChunk.project_billboard = "\n\n#include <rotation_matrix>\n\n/**\n * Project a vertex as a billboard in camera-space.\n */\nvec3 projectBillboardVertex(vec3 vertex, float scale) {\n\n  vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);\n  vec3 cameraUp    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n\n  return (cameraRight * vertex.x * scale) + (cameraUp * vertex.y * scale);\n}\n\n/**\n * Project a vertex as a billboard in camera-space, at an angle.\n */\nvec3 projectBillboardVertex(vec3 vertex, float angle, float scale) {\n  \n  vec3 cameraForward = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);\n  vec3 cameraRight   = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);\n  vec3 cameraUp      = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n\n  mat4 billboardRotation = createRotationMatrix(cameraForward, angle);\n  vec3 billboardRight    = (billboardRotation * vec4(cameraRight, 1.0)).xyz;\n  vec3 billboardUp       = (billboardRotation * vec4(cameraUp, 1.0)).xyz;\n  \n  return (billboardRight * vertex.x * scale) + (billboardUp * vertex.y * scale);\n\n}\n \n";

var SoundwaveTrampolineShader = {};
SoundwaveTrampolineShader.vertex = "\n\n#include <project_billboard>\n#include <common>\n#include <app>\n#include <audio>\n#include <noise>\n\nuniform float radius;\nuniform float radiusMultiplier;\nuniform float rotation;\nuniform float perturbMultiplier;\n\nuniform float audioFrequencyFactor;\nuniform float audioVolumeFactor;\nuniform float audioScaleFactor;\nuniform float audioScaleExponent;\n\nuniform float particleScale;\nuniform float particleCount;\n\nattribute float pid;\nattribute vec3 seed;\n\nvoid main() {\n  \n  float norm = pid / particleCount;\n  float theta = norm * PI2;\n  \n  // arrange the particles in a circle\n  vec2 circle = vec2(sin(theta + rotation * PI2), cos(theta + rotation * PI2));\n  \n  #ifdef USE_FREQUENCY_OFFSET\n    \n    float frequencyCoord = seed.x; // the trampoline uses random frequency coordinates\n    \n    frequencyCoord *= 0.6; // ignore upper (boring) frequencies\n    \n    float frequencySample = sampleAudioTexture(frequency, frequencyCoord);\n    float frequencyOffset = frequencySample * audioFrequencyFactor;\n    \n    frequencyOffset *= seed.y;\n    \n  #endif\n  \n  #ifdef USE_VOLUME_OFFSET\n    \n    float volumeOffset = smoothedVolume * audioVolumeFactor;\n    \n    volumeOffset *= seed.y;    \n    \n  #endif\n  \n  // Sum offsets and perturb the particle position.\n  \n  float offset = 0.0;\n  \n  #ifdef USE_FREQUENCY_OFFSET\n  offset += frequencyOffset;\n  #endif\n  \n  #ifdef USE_VOLUME_OFFSET\n  offset += volumeOffset;\n  #endif\n  \n  vec3 particlePosition = vec3(circle, 0) * radius * radiusMultiplier + vec3(0, 0, -1) * offset * perturbMultiplier;\n  \n  // Compute the particle scale.\n  \n  float scale = particleScale;\n  scale += pow(max(0.0, offset * audioScaleFactor), audioScaleExponent);\n  scale /= length(cameraPosition - particlePosition);\n  \n  // Project the vertex as a billboard in model space, then add it to the particle position in\n  // world space. We don't need to use the model matrix here because the particle's position\n  // is always computed in world space.\n  \n  vec3 worldPosition = particlePosition + projectBillboardVertex(position, scale);\n  \n  gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1.0);\n \n}\n\n";
SoundwaveTrampolineShader.fragment = "\n\nuniform vec3 color;\n\nvoid main() {\n\n  gl_FragColor = vec4(color, 1.0);\n\n}\n\n";

var SoundwaveRingShader = {};
SoundwaveRingShader.vertex = "\n\n#include <project_billboard>\n#include <common>\n#include <app>\n#include <audio>\n#include <noise>\n\nuniform float radius;\nuniform float radiusMultiplier;\nuniform float rotation;\nuniform float dampenExponent;\nuniform float perturbMultiplier;\n\nuniform float audioFrequencyFactor;\nuniform float audioVolumeFactor;\nuniform float audioScaleFactor;\nuniform float audioScaleExponent;\n\nuniform vec3 noiseParams;\n\nuniform float sineFrequency;\nuniform float sineAmplitude;\nuniform float sineTimescale;\n\nuniform float particleScale;\nuniform float particleCount;\n\nattribute float pid;\nattribute vec3 seed;\n\nvoid main() {\n  \n  float norm = pid / particleCount;\n  float theta = norm * PI2;\n  \n  // arrange the particles in a circle\n  vec2 circle = vec2(sin(theta + rotation * PI2), cos(theta + rotation * PI2));\n  \n  // dampen values when norm is close to 0 or 1\n  float dampen = pow(abs(sin(norm * PI)), dampenExponent);\n  \n  #ifdef USE_FREQUENCY_OFFSET\n    \n    float frequencyCoord = norm;\n    \n    #ifdef USE_MIRRORED_FREQUENCY\n    frequencyCoord = abs(frequencyCoord * 2.0 - 1.0);\n    #endif\n    \n    frequencyCoord *= 0.6; // ignore upper (boring) frequencies\n    \n    float frequencySample = sampleAudioTexture(frequency, frequencyCoord);\n    float frequencyOffset = frequencySample * audioFrequencyFactor;\n    \n  #endif\n  \n  #ifdef USE_VOLUME_OFFSET\n    \n    float volumeOffset = smoothedVolume * audioVolumeFactor;\n    \n  #endif\n  \n  #ifdef USE_SINE_OFFSET\n    \n    float sineOffset = sin(theta * sineFrequency + time * sineTimescale) * sineAmplitude * smoothedVolume * dampen;\n    \n  #endif\n  \n  #ifdef USE_NOISE_OFFSET\n    \n    // Compute some gradient noise using the circle coordinates and the application time. We use the\n    // absolute value of the x coordinate to make the noise horizontally symmetrical. Unfortunately\n    // this makes the offset discontinuous around x == 0. Fortunately the x derivative *is*\n    // continuous there, so we mix the value noise with the x derivative.\n    \n    vec3 noiseCoord = vec3(0.0);\n    \n    noiseCoord.x = max(0.25, smoothedVolume) * noiseParams.x * abs(circle.x);\n    noiseCoord.y = max(0.25, smoothedVolume) * noiseParams.y * circle.y;\n    noiseCoord.z = max(0.10, smoothedVolume) * noiseParams.z * sin(time);\n    \n    vec4 noiseDerivatives = noised(noiseCoord);\n    float noiseOffset = mix(noiseDerivatives.x, noiseDerivatives.y * 0.2, dampen) * max(0.1, dampen);  \n    \n  #endif\n  \n  // Sum offsets and perturb the particle position.\n  \n  float offset = 0.0;\n  \n  #ifdef USE_FREQUENCY_OFFSET\n  offset += frequencyOffset;\n  #endif\n  \n  #ifdef USE_VOLUME_OFFSET\n  offset += volumeOffset;\n  #endif\n  \n  #ifdef USE_NOISE_OFFSET\n  offset += noiseOffset;\n  #endif\n  \n  #ifdef USE_SINE_OFFSET\n  offset += sineOffset;\n  #endif\n  \n  vec3 particlePosition = vec3(circle, 0) * radius * radiusMultiplier + vec3(circle, 0) * offset * perturbMultiplier;\n  \n  // Compute the particle scale.\n  \n  float scale = particleScale;\n  scale += pow(max(0.0, offset * audioScaleFactor), audioScaleExponent);\n  scale /= length(cameraPosition - particlePosition);\n  \n  vec3 transformed = particlePosition + projectBillboardVertex(position, scale);\n  \n  #include <project_vertex>\n \n}\n\n";
SoundwaveRingShader.fragment = "\n\nuniform vec3 color;\n\nvoid main() {\n\n  gl_FragColor = vec4(color, 1.0);\n\n}\n\n"

// =====================================================

var audioUniforms = {
    waveform: {
        value: null,
        type: "t"
    },
    frequency: {
        value: null,
        type: "t"
    },
    instantVolume: {
        value: 0
    },
    smoothedVolume: {
        value: 0
    }
}

// =====================================================
var appUniforms = {
    screen: {
        value: new THREE.Vector2
    },
    mouse: {
        value: new THREE.Vector2
    },
    time: {
        value: 0
    },
    dt: {
        value: 0
    }
};

// =====================================================
function ParticleBufferGeometry(options) {
    options = Object.assign({
        particleCount: 1e3
    }, options);

    if (!options.particleGeometry) throw new Error("You must provide a particle geometry.");

    var t = void 0;

    if (typeof options.particleGeometry == 'function') {
        t = options.particleGeometry;
    } else if (Array.isArray(options.particleGeometry)) {
        t = function() {
            return options.particleGeometry[THREE.Math.randInt(0, options.particleGeometry.length - 1)];
        }
    } else {
        t = function() {
            return options.particleGeometry;
        }
    }

    for (var i = [], n = [], r = [], o = [], a = 0; a < options.particleCount; a++) {
        for (var s = t(), l = s.indexArray.length, h = o.length / 3, u = 0; u < l; u++) r.push(s.indexArray[u] + h);
        for (var p = Math.random(), d = Math.random(), f = Math.random(), m = s.vertexArray.length / 3, v = 0; v < m; v++) {
            i.push(a), n.push(p, d, f);
            var g = s.vertexArray[3 * v + 0],
                y = s.vertexArray[3 * v + 1],
                _ = s.vertexArray[3 * v + 2];
            o.push(g, y, _)
        }
    }

    var b = new Uint32Array(r),
        w = new THREE.BufferAttribute(b, 1),
        x = new Float32Array(i),
        T = new THREE.BufferAttribute(x, 1),
        S = new Float32Array(n),
        E = new THREE.BufferAttribute(S, 3),
        P = new Float32Array(o),
        M = new THREE.BufferAttribute(P, 3),
        A = new THREE.BufferGeometry;

    A.setIndex(w);
    A.addAttribute("pid", T);
    A.addAttribute("seed", E);
    A.addAttribute("position", M);
    
    Object.defineProperties(A, {
        particleCount: {
            value: options.particleCount,
            writable: !1
        }
    });

    return A;
}

function FannedCircleParticleGeometry() {
    for (var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 3, t = [], i = [], n = 0; n < e; n++) {
        var r = 2 * n * Math.PI / e;
        i.push(Math.sin(r), Math.cos(r), 0)
    }
    for (var o = 0; o < e - 2; o++) t.push(o + 2, o + 1, 0);
    return {
        indexArray: t,
        vertexArray: i
    }
}

function TetrahedronParticleGeometry() {
    return {
        indexArray: [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1],
        vertexArray: [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1]
    }
}

// =====================================================

function SoundwaveTrampoline(options) {
    options = Object.assign({
        radius: 2,
        audioFrequencyFactor: .5,
        audioVolumeFactor: .2,
        audioScaleFactor: .35,
        audioScaleExponent: 2
    }, options);

    var geometry = ParticleBufferGeometry({
        particleCount: 1e3,
        // particleCount: 100,
        particleGeometry: FannedCircleParticleGeometry(18)
        // particleGeometry: TetrahedronParticleGeometry(18)
    });

    var uniforms = Object.assign({
        color: {
            value: options.color
        },
        radius: {
            value: options.radius
        },
        radiusMultiplier: {
            value: 1
            // value: .2
        },
        perturbMultiplier: {
            value: 1
            // value: .2
        },
        audioFrequencyFactor: {
            value: options.audioFrequencyFactor
        },
        audioVolumeFactor: {
            value: options.audioVolumeFactor
        },
        audioScaleFactor: {
            value: options.audioScaleFactor
        },
        audioScaleExponent: {
            value: options.audioScaleExponent
        },
        particleCount: {
            value: geometry.particleCount
        },
        particleScale: {
            value: .05
            // value: 0
        }
    }, audioUniforms, appUniforms);

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        defines: {
            USE_FREQUENCY_OFFSET: !0,
            USE_VOLUME_OFFSET: !0
        },
        vertexShader: SoundwaveTrampolineShader.vertex,
        fragmentShader: SoundwaveTrampolineShader.fragment
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Soundwave Trampoline";
    mesh.frustumCulled = !1;
    mesh.matrixAutoUpdate = !1;

    this.object3D = mesh;
}

// =====================================================

function createSoundwaveRing(options) {
    options = Object.assign({
        radius: 1.2,
        radiusMultiplier: 1,
        rotation: .5,
        dampenExponent: 2.5,
        audioFrequencyFactor: .5,
        audioVolumeFactor: .2,
        audioScaleFactor: .35,
        audioScaleExponent: 2,
        noiseParams: new THREE.Vector3(9, 7, 17),
        sineFrequency: 30,
        sineAmplitude: .09,
        sineTimescale: 10
    }, options);

    var geometry = ParticleBufferGeometry({
        particleCount: 800,
        // particleCount: 80,
        particleGeometry: FannedCircleParticleGeometry(3)
    });

    var uniforms = Object.assign({
        color: {
            value: options.color
        },
        radius: {
            value: options.radius
        },
        radiusMultiplier: {
            value: options.radiusMultiplier
        },
        rotation: {
            value: options.rotation
        },
        dampenExponent: {
            value: options.dampenExponent
        },
        perturbMultiplier: {
            value: 1
        },
        audioFrequencyFactor: {
            value: options.audioFrequencyFactor
        },
        audioVolumeFactor: {
            value: options.audioVolumeFactor
        },
        audioScaleFactor: {
            value: options.audioScaleFactor
        },
        audioScaleExponent: {
            value: options.audioScaleExponent
        },
        noiseParams: {
            value: options.noiseParams
        },
        sineFrequency: {
            value: options.sineFrequency
        },
        sineAmplitude: {
            value: options.sineAmplitude
        },
        sineTimescale: {
            value: options.sineTimescale
        },
        particleCount: {
            value: geometry.particleCount
        },
        particleScale: {
            value: options.particleScale
        }
    }, audioUniforms, appUniforms);

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        defines: {
            USE_MIRRORED_FREQUENCY: !0,
            USE_FREQUENCY_OFFSET: !0,
            USE_VOLUME_OFFSET: !0,
            USE_NOISE_OFFSET: !0,
            USE_SINE_OFFSET: !0
        },
        vertexShader: SoundwaveRingShader.vertex,
        fragmentShader: SoundwaveRingShader.fragment,
        transparent: true
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Soundwave Ring";
    mesh.frustumCulled = !1;
    mesh.matrixAutoUpdate = !1;

    return mesh;
}

function SoundwaveRing(options) {
    this.index    = options.index;
    this.object3D = createSoundwaveRing(options);
}

// =====================================================
function Soundwave() {
    this.object3D = new THREE.Object3D;

    var children = [
    new SoundwaveRing({
        index: 0,
        color: new THREE.Color(0xccfcfc),
        radius: 1.6,
        rotation: .6,
        dampenExponent: .6,
        audioFrequencyFactor: .35,
        audioVolumeFactor: 0,
        audioScaleFactor: .68,
        audioScaleExponent: 2.2,
        noiseParams: new THREE.Vector3(9.6, 7.3, 9),
        // noiseParams: new THREE.Vector3(0, 0, 0),
        sineFrequency: 13,
        sineAmplitude: .33,
        sineTimescale: 19,
        particleScale: .07
    }),
    new SoundwaveRing({
        index: 1,
        color: new THREE.Color(0xfcfcfc),
        radius: 1.2,
        rotation: .6,
        dampenExponent: .6,
        audioFrequencyFactor: .6,
        audioVolumeFactor: .55,
        audioScaleFactor: .35,
        audioScaleExponent: 2,
        noiseParams: new THREE.Vector3(9, 7, 17),
        sineFrequency: 31,
        sineAmplitude: .09,
        sineTimescale: 10,
        particleScale: .06
    }), 
    // new SoundwaveRing({
    //     index: 1,
    //     color: new THREE.Color(13379233),
    //     radius: 1.2,
    //     rotation: .6,
    //     dampenExponent: .6,
    //     audioFrequencyFactor: .6,
    //     audioVolumeFactor: .55,
    //     audioScaleFactor: .35,
    //     audioScaleExponent: 2,
    //     noiseParams: new THREE.Vector3(9, 7, 17),
    //     sineFrequency: 31,
    //     sineAmplitude: .09,
    //     sineTimescale: 10,
    //     // particleScale: .06
    //     particleScale: .2
    // }), 
    new SoundwaveRing({
        index: 2,
        color: new THREE.Color(0xffcccc),
        radius: 1.3,
        rotation: .18,
        dampenExponent: 2.5,
        audioFrequencyFactor: .5,
        audioVolumeFactor: .2,
        audioScaleFactor: .35,
        audioScaleExponent: 2,
        noiseParams: new THREE.Vector3(9, 7, 17),
        sineFrequency: 30,
        sineAmplitude: .09,
        sineTimescale: 10,
        particleScale: .06
    }), 
    new SoundwaveRing({
        index: 3,
        color: new THREE.Color(0xffffff),
        radius: 1.2,
        rotation: 1,
        dampenExponent: 9,
        audioFrequencyFactor: .5,
        audioVolumeFactor: .2,
        audioScaleFactor: .35,
        audioScaleExponent: 2,
        noiseParams: new THREE.Vector3(9, 7, 17),
        sineFrequency: 30,
        sineAmplitude: .09,
        sineTimescale: 10,
        particleScale: .06
    }), 
    new SoundwaveTrampoline({
        color: new THREE.Color(0xffffff),
        radius: 1.6,
        // radius: 3,
        audioFrequencyFactor: 3.4,
        audioVolumeFactor: 6.7,
        audioScaleFactor: .15,
        // audioScaleFactor: .1,
        audioScaleExponent: 3.5
        // audioScaleExponent: 10
    })];

    children.forEach(child => {
        this.object3D.add(child.object3D);
    });
}

Soundwave.prototype.transitionShowSoundwave = function() {
    var timeline = new TimelineMax();

    var object3D = this.object3D;
    object3D.visible = true;

    app.camera.target.set(0, 0, 0);
    app.camera.position.set(0, 0, -10);
    // app.camera.position.set(0, 0, -12);

    object3D.children.forEach(child => {
        timeline.from(child.material.uniforms.particleScale, 1, {
            value: 0,
            ease: Power3.easeOut
        }, 0);
        timeline.from(child.material.uniforms.radiusMultiplier, .4, {
            value: .2,
            ease: Power3.easeOut
        }, 0);
        timeline.from(child.material.uniforms.perturbMultiplier, .4, {
            value: .2,
            ease: Power3.easeOut
        }, 0);
    });

    // object3D.translateY(100)

    // XXX 模拟线分开
    // var props = {
    //     r: 1.2,
    //     noiseX: 9,
    //     noiseY: 7,
    //     noiseZ: 17,
    //     particleScale: .2
    // };
    // var line2 = object3D.children[1];
    // // line2.material.uniforms.particleScale.value = .7;

    // TweenMax.to(props, 1, {
    //     r: 1.5,
    //     noiseX: 9.6,
    //     noiseY: 7.3,
    //     noiseZ: 9,
    //     particleScale: .06,
    //     delay: 2,
    //     onUpdate: function() {
    //         // line2.material.uniforms.radius.value = props.r;
    //         line2.material.uniforms.particleScale.value = props.particleScale;
    //         line2.material.uniforms.noiseParams.value = new THREE.Vector3(props.noiseX, props.noiseY, props.noiseZ);
    //     }
    // })
}

Soundwave.prototype.transitionExplodeSoundwave = function() {
    var timeline = new TimelineMax();
    var object3D = this.object3D;

    object3D.visible = true;
    object3D.children.forEach((child, index) => {
        var delay = .01 * index;

        timeline.add([
            TweenLite.to(child.material.uniforms.radiusMultiplier, .4, {
                value: .7,
                ease: Power2.easeOut
            }), 
            TweenLite.to(child.material.uniforms.radiusMultiplier, .8, {
                value: 4,
                ease: Power3.easeOut
            })
        ], delay, "sequence");
        
        timeline.add([
            TweenLite.to(child.material.uniforms.perturbMultiplier, .4, {
                value: .4,
                ease: Power2.easeOut
            }), 
            TweenLite.to(child.material.uniforms.perturbMultiplier, .8, {
                value: 1,
                ease: Power3.easeOut
            })
        ], delay, "sequence");
    });

    timeline.call(() => {
        return object3D.visible = !1
    })
}

// =====================================================
function CameraDolly() {
    this.object3D = new THREE.Object3D;
    this.parallaxScale = .15;
    this.parallaxSpeed = .1;
    this.fixedTarget = !0;
    this.fixedTargetVector = new THREE.Vector3;
}

CameraDolly.prototype.start = function() {
    this.object3D.add(app.camera);
    app.camera.target = new THREE.Vector3
}

CameraDolly.prototype.update = function() {
    // var t = app.mouse,
    var t = new THREE.Vector3,
        i = new THREE.Vector3;

    i.x = +t.x * this.parallaxScale;
    i.y = -t.y * this.parallaxScale;

    if (this.fixedTarget && app.camera.target) {
        this.fixedTargetVector.copy(app.camera.target).sub(this.object3D.position);
        app.camera.lookAt(this.fixedTargetVector);
    } else if (app.camera.target) {
        app.camera.lookAt(app.camera.target)
    }

    this.object3D.position.lerp(i, this.parallaxSpeed)
}

// =====================================================
function Application() {
    var scene, camera, renderer, clock;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    camera = new THREE.PerspectiveCamera(45, 1, .1, 1e3);

    scene = new THREE.Scene();

    scene.camera = camera;

    clock = new THREE.Clock(false);

    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.canvas = renderer.domElement;
    this.clock = clock;

    this.animate = this.animate.bind(this);
}

Application.prototype.setup = function() {
    var e = window.innerWidth,
        t = window.innerHeight,
        i = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(i);
    this.renderer.setClearColor( 0x333 );
    this.renderer.setSize(e, t, !0);

    if (this.scene.camera === this.camera) {
        this.camera.aspect = e / t;
        this.camera.updateProjectionMatrix();
    }
}

Application.prototype.animate = function() {
    requestAnimationFrame(this.animate);
    // dispatch update
    onUpdate();
    this.render();
}

Application.prototype.start = function() {
    // dispatch start
    this.setup();
    this.clock.start();
    onStart();
    this.animate();
}

Application.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
}

Application.prototype.getTime = function() {
    return this.clock.elapsedTime;
}

Application.prototype.getDelta = function() {
    return this.clock.getDelta();
}

// =====================================================
var app, audio, dolly, soundwave;

function RewindApplication(options) {
    app = new Application();

    var renderer = app.renderer;
    var scene    = app.scene;
    var camera   = app.camera;

    // renderer.setClearColor(16185078);

    camera.fov = 40;
    camera.far = 1e3;
    camera.near = .01;
    camera.updateProjectionMatrix();

    dolly = new CameraDolly();
    soundwave = new Soundwave();

    var children = [dolly, soundwave];

    children.forEach(child => {
        scene.add(child.object3D);
        child.object3D.visible = true;
    });

    renderer.compile(scene, camera);

    return app;
}

// =====================================================
var renderWebGL = (function() {

    function start() {
        app.start();
        // audio.start();
    }

    function transition() {

    }

    return function(container, options) {
        RewindApplication(options);
        container.appendChild(app.canvas);

        return {
            start: start,
            transition: transition
        }
    }
})();

// =====================================================
function avg(arr) {
    for (var t = 0, i = 0; i < arr.length; i++) t += arr[i];
    return t / arr.length;
}

function onStart() {
    dolly.start();
    // soundwave.transitionShowSoundwave();
}

function onUpdate() {
    // bindApplicationUniforms
    appUniforms.time.value = app.getTime();
    appUniforms.dt.value   = app.getDelta();
    // appUniforms.time.value = 0;
    // appUniforms.dt.value   = 0;

    // bindAudioUniforms
    var e = avg(audio.frequency) / 256;
    audioUniforms.instantVolume.value = e;
    audioUniforms.smoothedVolume.value += .1 * (e - audioUniforms.smoothedVolume.value);

    audioUniforms.waveform.value.needsUpdate = true;
    audioUniforms.frequency.value.needsUpdate = true;

    audio.update();

    dolly.update();
}

// =====================================================
var URL = 'https://m8.music.126.net/21180815163607/04976f67866d4b4d11575ab418904467/ymusic/515a/5508/520b/f0cf47930abbbb0562c9ea61707c4c0b.mp3?infoId=92001';

var bridge = renderWebGL(document.body, {
    audioSrc: URL
});

audio = new AudioSystem();
bridge.start();

document.body.onclick = function() {
  audio.play();
};

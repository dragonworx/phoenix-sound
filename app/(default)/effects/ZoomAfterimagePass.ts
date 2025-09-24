import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export interface ZoomAfterimageOptions {
  damp: number;
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  rotation: number;
  enabled: boolean;
}

export class ZoomAfterimagePass extends Pass {
  material: THREE.ShaderMaterial;
  fsQuad: FullScreenQuad;
  textureComp: THREE.WebGLRenderTarget;
  textureOld: THREE.WebGLRenderTarget;
  shaderUniforms: { [uniform: string]: THREE.IUniform };

  damp: number = 0.96;
  scaleX: number = 1.002;
  scaleY: number = 1.002;
  translateX: number = 0.0;
  translateY: number = 0.0;
  rotation: number = 0.0;

  constructor(damp: number = 0.96, options: Partial<ZoomAfterimageOptions> = {}) {
    super();

    this.damp = damp;
    this.scaleX = options.scaleX ?? 1.002;
    this.scaleY = options.scaleY ?? 1.002;
    this.translateX = options.translateX ?? 0.0;
    this.translateY = options.translateY ?? 0.0;
    this.rotation = options.rotation ?? 0.0;

    const shader = ZoomAfterimageShader;

    this.shaderUniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.material = new THREE.ShaderMaterial({
      uniforms: this.shaderUniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    this.fsQuad = new FullScreenQuad(this.material);

    const pars: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    };

    this.textureComp = new THREE.WebGLRenderTarget(1, 1, pars);
    this.textureOld = new THREE.WebGLRenderTarget(1, 1, pars);

    this.shaderUniforms['tOld'].value = this.textureOld.texture;
    this.shaderUniforms['tNew'].value = this.textureComp.texture;

    this.shaderUniforms['damp'].value = this.damp;
    this.shaderUniforms['scaleX'].value = this.scaleX;
    this.shaderUniforms['scaleY'].value = this.scaleY;
    this.shaderUniforms['translateX'].value = this.translateX;
    this.shaderUniforms['translateY'].value = this.translateY;
    this.shaderUniforms['rotation'].value = this.rotation;
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    this.shaderUniforms['damp'].value = this.damp;
    this.shaderUniforms['scaleX'].value = this.scaleX;
    this.shaderUniforms['scaleY'].value = this.scaleY;
    this.shaderUniforms['translateX'].value = this.translateX;
    this.shaderUniforms['translateY'].value = this.translateY;
    this.shaderUniforms['rotation'].value = this.rotation;

    // Set the new frame as the input buffer
    this.shaderUniforms['tNew'].value = readBuffer.texture;

    // Copy the current frame to our composition buffer first
    renderer.setRenderTarget(this.textureComp);
    renderer.clear();
    this.fsQuad.render(renderer);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.clear();
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }

    // Swap render targets for next frame
    const temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
    this.shaderUniforms['tOld'].value = this.textureOld.texture;
  }

  setSize(width: number, height: number) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }

  dispose() {
    this.material.dispose();
    this.textureComp.dispose();
    this.textureOld.dispose();
    this.fsQuad.dispose();
  }

  updateTransform(options: Partial<ZoomAfterimageOptions>) {
    if (options.scaleX !== undefined) this.scaleX = options.scaleX;
    if (options.scaleY !== undefined) this.scaleY = options.scaleY;
    if (options.translateX !== undefined) this.translateX = options.translateX;
    if (options.translateY !== undefined) this.translateY = options.translateY;
    if (options.rotation !== undefined) this.rotation = options.rotation;
    if (options.damp !== undefined) this.damp = options.damp;
  }
}

const ZoomAfterimageShader = {
  uniforms: {
    'tOld': { value: null },
    'tNew': { value: null },
    'damp': { value: 0.96 },
    'scaleX': { value: 1.002 },
    'scaleY': { value: 1.002 },
    'translateX': { value: 0.0 },
    'translateY': { value: 0.0 },
    'rotation': { value: 0.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tOld;
    uniform sampler2D tNew;
    uniform float damp;
    uniform float scaleX;
    uniform float scaleY;
    uniform float translateX;
    uniform float translateY;
    uniform float rotation;

    varying vec2 vUv;

    vec2 transformUV(vec2 uv) {
      // Center the UV coordinates
      vec2 centered = uv - 0.5;

      // Apply translation first
      vec2 translated = centered + vec2(translateX, translateY);

      // Apply rotation
      float cosR = cos(rotation);
      float sinR = sin(rotation);
      vec2 rotated = vec2(
        translated.x * cosR - translated.y * sinR,
        translated.x * sinR + translated.y * cosR
      );

      // Apply scaling (expand the old frame from center)
      vec2 scaled = vec2(rotated.x * scaleX, rotated.y * scaleY);

      // Recenter
      vec2 final = scaled + 0.5;

      return final;
    }

    void main() {
      vec4 texelNew = texture2D(tNew, vUv);

      // Transform UV for sampling old texture (inverse transform to "zoom out" the old frame)
      vec2 transformedUV = transformUV(vUv);

      // Sample old texture with bounds checking
      vec4 texelOld = vec4(0.0);
      if (transformedUV.x >= 0.0 && transformedUV.x <= 1.0 &&
          transformedUV.y >= 0.0 && transformedUV.y <= 1.0) {
        texelOld = texture2D(tOld, transformedUV);
      }

      // Video feedback effect: new frame over damped old frame with saturation protection
      vec4 dampedOld = texelOld * damp;
      vec4 blended = texelNew + dampedOld;

      // Prevent over-saturation by clamping the final result
      gl_FragColor = clamp(blended, 0.0, 1.0);
      gl_FragColor.a = 1.0;
    }
  `
};
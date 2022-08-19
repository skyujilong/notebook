<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {
  onMounted,
  ref
} from 'vue';

import * as THREE from "three";
import { initHelper,initRender,initCamera } from "../../util/index";
const sceneEl = ref<HTMLDivElement>();
/// 后处理 效果。 这里是进行光源的，展示的更加逼真。
onMounted(()=>{
  const renderer = initRender(sceneEl.value!);
  // const camera = initCamera();
  const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 700, 200, - 500 );

  const scene = new THREE.Scene();

  initHelper(scene,renderer,camera);

  // light  平行方向光源，模拟的是阳光的光照。
  const light = new THREE.DirectionalLight( 0xaabbff, 0.3 );
  light.position.x = 300;
  light.position.y = 250;
  light.position.z = - 500;
  scene.add( light );

  const vertexShader = `
    varying vec3 vWorldPosition;

    void main() {

      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `;
  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;

    varying vec3 vWorldPosition;

    void main() {

      float h = normalize( vWorldPosition + offset ).y;
      gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );

    }
  `;
  
  /// 参数
  const uniforms = {
    topColor: { value: new THREE.Color( 0x0077ff ) },
    bottomColor: { value: new THREE.Color( 0xffffff ) },
    offset: { value: 400 },
    exponent: { value: 0.6 }
  };
  uniforms.topColor.value.copy( light.color );
  /// 天空
  const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
  /// 天空自定义shader
  const skyMat = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    /// webgl的运行代码
    vertexShader: vertexShader!,
    /// webgl的运行代码
    fragmentShader: fragmentShader!,
    side: THREE.BackSide
  });

  const mesh = new THREE.Mesh(skyGeo,skyMat);

  scene.add(mesh);

  /// 加载模型
  const loader = new THREE.ObjectLoader();
  loader.load('./lightmap.json',(object)=>{
    scene.add( object );
    renderer.render(scene,camera);
  });
  renderer.render(scene,camera);
});



</script>
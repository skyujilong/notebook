<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { initHelper, initRender, initCamera } from "../../util/index";

import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();

onMounted(() => {
  const renderer = initRender(sceneEl.value!);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(2, 1.8, 2)
  const scene = new THREE.Scene();
  initHelper(scene, renderer, camera);

  // const sphereGeometry = new THREE.SphereGeometry(30,32,32);

  // // const mesh = new THREE.Mesh(sphereGeometry,pointMaterial);

  // scene.add(new THREE.Points(sphereGeometry,pointMaterial));

  const ambientLight = new THREE.AmbientLight('#ffffff', 1)
  scene.add(ambientLight)

  // geometry
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 5000;
  const colors = new Float32Array(count * 3)
  const positions = new Float32Array(count * 3); // 每个点由三个坐标值组成（x, y, z）
  for (let i = 0; i < count * 3; i += 1) {
    positions[i] = (Math.random() - 0.5) * 100;
    colors[i] = Math.random();
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "https://gw.alicdn.com/imgextra/i3/O1CN01DO6Ed61QtcMKsVnK2_!!6000000002034-2-tps-56-56.png",
    (texture) => {

      console.log(texture);
      const pointMaterial = new THREE.PointsMaterial({
        // color: new THREE.Color("#efefef"),
        size: 1, // 纹理的大小尺寸
        sizeAttenuation: true,
        alphaMap: texture, ///可以给材质做透明
        // map: texture,
        transparent:true,
        depthWrite:false,
        blending: THREE.AdditiveBlending,
        vertexColors:true
      });

      scene.add(new THREE.Points(particlesGeometry, pointMaterial));

      pointMaterial.needsUpdate = true;

      const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
      scene.add(ambientLight);

      renderer.render(scene, camera);
    }
  );

});
</script>
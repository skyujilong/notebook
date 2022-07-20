<template>
  <div class="scene" ref="sceneEl">

  </div>
</template>
<script lang="ts" setup>
import { onMounted,ref } from "vue";
import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();
onMounted(()=>{
  console.log(sceneEl,THREE);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight, 0.1, 500);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  sceneEl.value?.appendChild( renderer.domElement );
  // 设置 正方体定点信息
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // 设置正方体用到的皮肤。
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // 组成Mesh信息
  const cube = new THREE.Mesh( geometry, material );
  // 添加到场景当中。
  scene.add( cube );
  camera.position.z = 3;

	function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    // renderer进行渲染，关联场景 以及 摄像头
    renderer.render( scene, camera );
  };

  animate();


});

</script>
<style scoped>

</style>

<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref, render } from 'vue'
import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  console.log(sceneEl);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  sceneEl.value?.appendChild( renderer.domElement );

  // 设置生成camera
  const camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight, 1, 500);
  // 设置镜头方向
  camera.position.set( 0, 100, 100 );
  // 看向哪里
  camera.lookAt( 0, 0, 0 );
  // 创建场景
  const scene = new THREE.Scene();

  // 设置材质
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });

  const points = [];

  points.push(new THREE.Vector3(-10,0,0))
  points.push( new THREE.Vector3( 0, 10, 0 ) );
  points.push( new THREE.Vector3( 10, 0, 0 ) );
  /// 生成顶点信息的几何图形
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  const line = new THREE.Line(geometry,material);
  // 加入场景
  scene.add(line);

  renderer.render(scene,camera);

});
</script>

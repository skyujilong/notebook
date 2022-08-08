<template>
   <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {ref,onMounted} from 'vue'
import * as THREE from "three";
import { initHelper,initRender,initCamera } from "../../util";

const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const camera = initCamera();
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();
  initHelper(scene,render,camera);

  // const geometry = new THREE.PlaneGeometry(204,104,4,4);
  const geometry = new THREE.BoxGeometry(40,40,40);

  // 材质对象1
  var material1 = new THREE.MeshPhongMaterial({
    color: 0xffff3f,
    // wireframe:true,
  })
  // 材质对象2
  var material2 = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    // wireframe:true,
  });

  /// 6个面每个面不同的 材质
  const mesh = new THREE.Mesh(geometry,[material1,material2,material2,material2,material2,material2]);

  scene.add(mesh);

  initLight(scene);

  render.render(scene,camera);

})

function initLight(scene:THREE.Scene){
  ///环境光
  let light1 = new THREE.AmbientLight(0x404040);
  scene.add(light1);
  let light2 = new THREE.DirectionalLight(0xFFFFFF,1);
  light2.position.set(50,50,50);
  light2.target = scene;
  scene.add( light2 );
}


</script>
<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue';
import { initHelper,initRender,initCamera } from "../../util/index";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const camera = initCamera();
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();

  initHelper(scene,render,camera);

  initLight(scene);

  const textureLoader =  new THREE.TextureLoader();
  // 加载纹理贴图。 地图的图片是一个2x1的宽高比的图片。  
  textureLoader.load('./img/earth.png',(texture)=>{
    // 创建一个球体
    const ball = new THREE.SphereGeometry(20,100,100);
    // const box = new THREE.BoxGeometry(20,20,20);
    
    const material = new THREE.MeshPhysicalMaterial({
      // 地球的纹理图片映射进入材质。
      map:texture
    });
    /// 材质与 几何图形想结合成mesh。 
    const mesh = new THREE.Mesh(ball,material);
    // const mesh = new THREE.Mesh(box,material);
    scene.add(mesh);
    run(mesh,render,scene,camera);
  });

  render.render(scene,camera);
});

function run(mesh:THREE.Mesh,render:THREE.Renderer,scene:THREE.Scene, camera: THREE.Camera){
  mesh.rotateY(0.01); 
  mesh.rotateZ(0.01);
  render.render(scene, camera);
  const args = [...arguments];
  requestAnimationFrame(()=>{
    run.apply(null,args as any);
  })
}

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
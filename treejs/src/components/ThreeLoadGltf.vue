<template>
  <div class="scene" ref="sceneEl">

  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, render } from 'vue'
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const sceneEl = ref<HTMLDivElement>();
onMounted(()=>{
  console.log(sceneEl);
  const renderer = new THREE.WebGLRenderer({
    antialias:true
  });
  renderer.setSize(window.innerWidth,window.innerHeight);
  sceneEl.value?.appendChild( renderer.domElement );

  const camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight, 0.1, 1000);

  camera.position.set(0,20,40);


  const scene = new THREE.Scene();

  
  // const light = new THREE.AmbientLight(0xffffff);

  // scene.add(light);

  // var light = new THREE.PointLight(0xffffff, 2, 100);
  // light.position.set(0, 1.5, 2);
  // scene.add(light);

  /// 增加鼠标拖拽控制功能。
  let controls = new OrbitControls(camera,renderer.domElement);
  controls.addEventListener('change',()=>{
    camera.lookAt(0,10,0);
    renderer.render(scene,camera);
  });


  const loader = new GLTFLoader();

  loader.load('./higokumaru__honkai_impact_3rd/scene.gltf',(gltf)=>{
    console.log('gltf',gltf);
    const model = gltf.scene;
    scene.add(model);
    console.log('gltf animations:',gltf.animations);
    /// 环境光

    const light1 = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(light1);

    /// 聚光灯
    // var light = new THREE.SpotLight(0xffffff);
    // light.position.set(0, 3, -2);
    // light.target = gltf.scene; // 投射方向指向地板
    // scene.add(light);

    // scene.add( new THREE.AmbientLight( 0x404040) );
 
    var light = new THREE.DirectionalLight( 0xFFFFFF,0.4 );
    light.position.set( 100, 100, 100 );
    scene.add( light );

    
    // camera.rotateY(-0.09);
    camera.lookAt(0,10,0);
    renderer.render(scene,camera);
    console.log('load ok!');

    let i = 0;
    function animate(){
      // camera.rotateY(i++);
      // camera.lookAt(scene.position);
      // camera.lookAt(0,0,0);
      // i= i+0.001;
      gltf.scene.rotateY(0.01);
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }

    animate();



  },void 0, (error)=>{
    console.error('error!',error);
  });

});
</script>
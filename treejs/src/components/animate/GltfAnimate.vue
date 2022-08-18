<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>

import { ref,onMounted  } from "vue";

import { initHelper,initRender,initCamera } from "../../util/index";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const renderer = initRender(sceneEl.value!);
  const camera = initCamera();
  const scene = new THREE.Scene();
  initHelper(scene,renderer,camera);

  // 地面

  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
  mesh.rotation.x = - Math.PI / 2;
  scene.add( mesh );

  const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
  console.log(grid.material);
  // grid.material.opacity = 0.2;
  // grid.material.transparent = true;
  scene.add( grid );

  const loader = new GLTFLoader();
  initLight(scene);
  loader.load('./RobotExpressive.glb',(gltf)=>{

    const group = new THREE.Group();
    let model = gltf.scene;
    group.add(model);
    group.scale.set(20,20,20);
    scene.add(group);
    console.log(gltf.animations);
    const mixer = animate(model,gltf.animations);
    var clock = new THREE.Clock();
    // 渲染函数
    function render() {
      renderer.render(scene, camera); //执行渲染操作
      requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧

      //clock.getDelta()方法获得两帧的时间间隔
      // 更新混合器相关的时间
      mixer.update(clock.getDelta());
    }
    render();
  },(event)=>{
    console.log(event);
  },(e)=>{
    console.error(e);
  });

});


function animate(model:THREE.Object3D, animationClipList:THREE.AnimationClip[]){
  var mixer = new THREE.AnimationMixer(model);
  // var clip = new THREE.AnimationClip("default", duration, animationClipList[0]);

  for(let item of animationClipList){
    console.log(item);
  }

  const AnimationAction = mixer.clipAction(animationClipList[0]);
  //通过操作Action设置播放方式
  AnimationAction.timeScale = 3; //默认1，可以调节播放速度
  // AnimationAction.loop = THREE.LoopOnce; //不循环播放
  AnimationAction.play(); //开始播放

  return mixer;
}

function initLight(scene:THREE.Scene){
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 20, 0 );
  scene.add( hemiLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( 0, 20, 10 );
  scene.add( dirLight );
}


</script>
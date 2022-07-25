<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const camera = initCamera();
  const render = initRender();
  const scene = new THREE.Scene();
  initLight(scene);
  initHelper(scene,render,camera);
  // 创建 box 正方体
  // var geometry = new THREE.BoxGeometry(100, 100, 100);

  // console.log(geometry.attributes);
  // console.log(geometry);

  // geometry.attributes.color = new THREE.BufferAttribute([
  //   0x00ff00,
  //   0xff0000,
  //   0x0000ff,
  //   0x00ff00,
  //   0xff0000,
  //   0x0000ff,
  //   0x00ff00,
  //   0xff0000,    
  // ],1);


  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array([
    0,0,0,
    40,0,0,
    40,40,0,
    0,40,0,
    0,0,40,
    40,0,40,
    40,40,40,
    0,40,40
  ]),3));

  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, //顶点1法向量
    0, 0, 1, //顶点2法向量
    0, 0, 1, //顶点3法向量
    0, 0, 1, //顶点4法向量
    0, 0, 1, //顶点1法向量
    0, 0, 1, //顶点2法向量
    0, 0, 1, //顶点3法向量
    0, 0, 1, //顶点4法向量
  ]),3))

  // geometry.index = new THREE.BufferAttribute()
  // geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([
  //   0,1,2,
  // ]),1))
  // 两个三角形组成一个面
  geometry.index = new THREE.BufferAttribute(new Uint16Array([
    0,1,2,//这个一个面
    2,3,0,
    0,3,7,
    0,4,7
    // 3,7,6,2,
    // 6,5,1,2,
    // 7,3,4,0,
    // 7,4,5,6,
    // 0,4,5,1
  ]),1);
  console.log(geometry);
  const mesh = new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({
    color:0x00ffff,
    side: THREE.DoubleSide
  }));

  scene.add(mesh);

  render.render(scene,camera);
});


function initHelper(scene:THREE.Scene, render: THREE.Renderer, camera: THREE.Camera){
  scene.add(new THREE.AxesHelper(250));
  const listener = new OrbitControls(camera,render.domElement);
  listener.addEventListener('change',()=>{
    render.render(scene,camera);
  });
}

function initCamera(){
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,2000);
  camera.position.set(0,0,150);
  camera.lookAt(0,0,0);
  return camera;
}

function initRender(){
  const render = new THREE.WebGLRenderer({
    antialias: true
  });
  render.setSize(window.innerWidth,window.innerHeight);
  sceneEl.value?.appendChild(render.domElement);
  return render;
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
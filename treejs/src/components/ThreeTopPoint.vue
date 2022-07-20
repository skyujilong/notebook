<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const sceneEl = ref<HTMLDivElement>();


onMounted(()=>{
  const camera = initCamera();
  const render = initRender();

  const scene = new THREE.Scene();
  initLight(scene);
  var geometry = new THREE.BufferGeometry();
  //类型数组创建顶点数据
  var vertices = new Float32Array([
    /// 描述了第一个三角形
    0, 0, 0, //顶点1坐标
    50, 0, 0, //顶点2坐标
    0, 100, 0, //顶点3坐标
    /// 描述了第二个三角形
    0, 0, 10, //顶点4坐标
    0, 0, 100, //顶点5坐标
    50, 0, 10, //顶点6坐标
    /// 描述了第三个三角形
    0, 10, 20, //顶点7坐标
    10, 0, 100, //顶点8坐标
    50, 0, 20, //顶点9坐标
  ]);

  // 创建属性缓冲区对象
  // 3个为一组，表示一个顶点的xyz坐标
  var attribue = new THREE.BufferAttribute(vertices, 3);    
  // 设置几何体attributes属性的位置属性
  geometry.attributes.position = attribue;

  // 三角面(网格)渲染模式
  // var material = new THREE.MeshBasicMaterial({
  //   color: 0x0000ff, //三角面颜色
  //   side: THREE.DoubleSide //两面可见
  // }); //材质对象
  // const mesh = new THREE.Mesh(geometry,material);
  // scene.add(mesh);
  
  
  // 点渲染模式
  var material = new THREE.PointsMaterial({
    color: 0xff0000,
    size: 10.0 //点对象像素尺寸
  }); //材质对象
  var points = new THREE.Points(geometry, material);
  scene.add(points);

  

  

  

  const listener = new OrbitControls(camera,render.domElement);

  listener.addEventListener('change',()=>{
      render.render(scene,camera);
  });

  var axesHelper = new THREE.AxesHelper(250);
  scene.add(axesHelper);

  render.render(scene,camera);
})

function initLight(scene:THREE.Scene){
  ///环境光
  let light1 = new THREE.AmbientLight(0x404040);
  scene.add(light1);
  let light2 = new THREE.DirectionalLight(0xFFFFFF,1);
  light2.position.set(50,50,50);
  light2.target = scene;
  scene.add(light2);
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


</script>
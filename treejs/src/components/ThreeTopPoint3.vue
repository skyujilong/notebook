<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>

/// 运用顶点索引。来减少顶点创建数量，从而减少模型的体积。

import { onMounted,ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const camera = initCamera();
  const render = initRender();
  const scene = new THREE.Scene();
  initLight(scene);
  scene.add(new THREE.AxesHelper(250));
  const listener = new OrbitControls(camera,render.domElement);
  listener.addEventListener('change',()=>{
    render.render(scene,camera);
  });

  normalMakVertices(scene);

  makeCopyVertices(scene);

  render.render(scene,camera);

  // mesh1.position.set(0,0,0);

  // const geometry1 = new THREE.BufferGeometry();

  

});

function normalMakVertices(scene:THREE.Scene){
  /// 空白的几何体
  const geometry = new THREE.BufferGeometry();
  // z轴都是0，所以 这里用两个三角形 展示了一个正方形。
  const vertices = new Float32Array([
    0,0,0,
    40,0,0,
    40,40,0,

    0,0,0,
    40,40,0,
    0,40,0
  ]);

  geometry.attributes.position = new THREE.BufferAttribute(vertices,3);

  var normals = new Float32Array([
    0, 0, 1, //顶点1法向量
    0, 0, 1, //顶点2法向量
    0, 0, 1, //顶点3法向量

    0, 0, 1, //顶点4法向量
    0, 0, 1, //顶点5法向量
    0, 0, 1, //顶点6法向量
  ]);

  geometry.attributes.normal = new THREE.BufferAttribute(normals,3);

    const material = new THREE.MeshPhongMaterial({
      color:0x00ffff,
      side: THREE.DoubleSide
    });

  const mesh = new THREE.Mesh(geometry,material);

  mesh.translateY(45);

  scene.add(mesh);
}

function makeCopyVertices(scene:THREE.Scene){
  ///两个三角形组成一个矩形。

  /// 定义一个 形状
  const geometry = new THREE.BufferGeometry();

  /// buffer 数据 ，3个一组描述一个顶点坐标信息。
  const vertices = new Float32Array([
    0, 0, 0, //顶点1坐标
    40, 0, 0, //顶点2坐标
    40, 40, 0, //顶点3坐标
    0, 40, 0, //顶点4坐标
  ]);
  /// 将buffer顶点数据赋值过来。
  geometry.attributes.position = new THREE.BufferAttribute(vertices,3);



  var normals = new Float32Array([
    0, 0, 1, //顶点1法向量
    0, 0, 1, //顶点2法向量
    0, 0, 1, //顶点3法向量
    0, 0, 1, //顶点4法向量
  ]);

  geometry.attributes.normal = new THREE.BufferAttribute(normals,3);

  const material = new THREE.MeshPhongMaterial({
    color:0x00ffff,
    side: THREE.DoubleSide
  });


  
  // Uint16Array类型数组创建顶点索引数据

  let indexs = new Uint16Array([
    /// 数组的下标代表的是 vertices 顶点数组中对应的 顶点
    0,1,2, /// 0 代表顶点(0,0,0) , 1 代表 (80,0,0), 2代表 (80,80,80)
    0,2,3
  ]);
  /// 这里是geometry的index属性。 设置后，将顶点坐标进行复用。
  geometry.index = new THREE.BufferAttribute(indexs,1);

  const mesh1 = new THREE.Mesh(geometry, material);

  scene.add(mesh1);
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
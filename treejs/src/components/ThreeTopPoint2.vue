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
  
  // buffer 类型，该类型一经申请，长度就固定了无法再增加长度了。
  var geometry = new THREE.BufferGeometry();

  // 定点，数据分成两部分。 定点坐标，以及定点颜色。

  // 类型数组创建顶点数据
  var vertices = new Float32Array([
    /// 描述了第一个三角形
     0, 0, 0, //顶点1坐标
    50, 0, 0, //顶点2坐标
    0, 100, 0, //顶点3坐标
    /// 描述了第二个三角形
    0, 0, 0, //顶点4坐标
    0, 0, 100, //顶点5坐标
    50, 0, 0, //顶点6坐标
    /// 描述了第三个三角形
    // 0, 10, 20, //顶点7坐标
    // 10, 0, 100, //顶点8坐标
    // 50, 0, 20, //顶点9坐标
  ]);

  // 顶点颜色

  const colors = new Float32Array([
    1, 0, 0, //顶点1颜色
    0, 1, 0, //顶点2颜色
    0, 0, 1, //顶点3颜色

    1, 1, 0, //顶点4颜色
    0, 1, 1, //顶点5颜色
    1, 0, 1, //顶点6颜色
  ]);

  // 顶点的法线信息
  var normals = new Float32Array([
    0, 0, 1, //顶点1法向量
    0, 0, 1, //顶点2法向量
    0, 0, 1, //顶点3法向量

    0, 1, 0, //顶点4法向量
    0, 1, 0, //顶点5法向量
    0, 1, 0, //顶点6法向量
  ]);

  // 创建属性缓冲区对象
  // 3个为一组，表示一个顶点的xyz坐标
  var attribue = new THREE.BufferAttribute(vertices, 3);    
  // 设置几何体attributes属性的位置属性
  geometry.attributes.position = attribue;
  //顶点颜色赋值
  geometry.attributes.color = new THREE.BufferAttribute(colors,3);
  // 每个顶点的法向量，顶点有了法向量，有了法线，光照反射的效果才能生效。 没有下面这行代码，不会有明暗的效果。
  geometry.attributes.normal = new THREE.BufferAttribute(normals, 3);
  
  // 三角面(网格)渲染模式
  // var material = new THREE.MeshBasicMaterial({
  //   color: 0x0000ff, //三角面颜色
  //   vertexColors: false, // 根据顶点的颜色，会进行插值计算填充。
  //   side: THREE.DoubleSide //两面可见
  // }); //材质对象

  const material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry,material);
  scene.add(mesh);
  
  
  // 点渲染模式
  // var material = new THREE.PointsMaterial({
  //   // color: 0xff0000,
  //   vertexColors: true, //以顶点颜色为准
  //   size: 10.0 //点对象像素尺寸
  // }); //材质对象
  // var points = new THREE.Points(geometry, material);
  // scene.add(points);

  
  let ball = new THREE.SphereGeometry(10,10,10);
  /// MeshLambertMaterial
  /// MeshBasicMaterial 不会进行光照反射。 的换一个材质。
  // var ballMaterial = new THREE.MeshBasicMaterial({
  //   color: 0x00ffff, //三角面颜色
  //   vertexColors: false, // 根据顶点的颜色，会进行插值计算填充。
  // });

  const ballMaterial = new THREE.MeshLambertMaterial({
    color:  0x00ffff
  });
  const ballMesh = new THREE.Mesh(ball,ballMaterial);
  ballMesh.position.set(30,30,30);
  
  scene.add(ballMesh);
  

  const listener = new OrbitControls(camera,render.domElement);

  listener.addEventListener('change',()=>{
      render.render(scene,camera);
  });

  var axesHelper = new THREE.AxesHelper(250);
  scene.add(axesHelper);
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
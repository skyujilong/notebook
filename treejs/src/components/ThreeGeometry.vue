<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { onMounted,ref } from "vue";
/// 拖拽组件
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  /// 初始化照相机
  const camera = initCamera();
  /// 初始化render engine
  const render = initRender();
  /// 创建场景
  const scene = initScene();

  initLight(scene);

  initGeometrys(scene);

  /// 辅助坐标系。
  var axesHelper = new THREE.AxesHelper(250);
  scene.add(axesHelper);

  const listener = new OrbitControls(camera,render.domElement);

  listener.addEventListener('change',()=>{
      render.render(scene,camera);
  });

  render.render(scene,camera);
});

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

function initScene(){
  return new THREE.Scene();
}

function initGeometrys(scene:THREE.Scene){
  const geometry1 = new THREE.BoxGeometry(10,10,10);
  const material1 = new THREE.MeshLambertMaterial({
    color: 0x0000ff
  });
  
  const mesh1 = new THREE.Mesh(geometry1,material1);

  scene.add(mesh1);

  // 球体网格模型
    var geometry2 = new THREE.SphereGeometry(30, 30, 30);
    var material2 = new THREE.MeshLambertMaterial({
      color: 0xff00ff
    });
    var mesh2 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
    // 通过mesh 可以偏移位置
    mesh2.translateX(20);
    mesh2.translateY(20); //球体网格模型沿Y轴正方向平移120
    mesh2.translateZ(40);
    scene.add(mesh2);

}


function initLight(scene:THREE.Scene){
  ///环境光
  let light1 = new THREE.AmbientLight(0x404040);
  scene.add(light1);
  let light2 = new THREE.DirectionalLight(0xFFFFFF,1);
  light2.position.set(50,50,50);
  light2.target = scene;
  scene.add(light2);
}


</script>

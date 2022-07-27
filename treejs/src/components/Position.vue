<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue'
import { initHelper,initRender,initCamera } from "../util/index";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();
onMounted(()=>{
  const render = initRender(sceneEl.value!);
  const camera = initCamera();
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(20,20,20);
  /// 声明一个三位向量，作为世界坐标
  var worldPosition = new THREE.Vector3();
  /// 执行getWorldPosition方法把模型的世界坐标保存到参数worldPosition中
  
  initHelper(scene,render,camera);

  const m1 = new THREE.MeshPhongMaterial({
    color:0x0000ff
  })

  const mesh = new THREE.Mesh(box,m1);
  /// 本地坐标
  mesh.position.set(20,0,0);

  mesh.name = 'mesh1'

  const groupBox1 = new THREE.Group();
  /// 将mesh对象编入groupBox1对象内。进行分组了相当于
  groupBox1.add(mesh);

  groupBox1.name = 'box1';

  groupBox1.position.set(20,10,0);

  /// 加入到场景中
  scene.add(groupBox1);
  /// 查找object3d
  const getObj = scene.getObjectByName('box1');

  console.log(getObj === groupBox1);
  console.log(getObj?.type);
  console.log(getObj?.id);
  console.log('group组坐标',getObj?.position);
  
  const getMesh1 = scene.getObjectByName('mesh1');
  console.log(getMesh1?.id);
  console.log(getMesh1?.type);
  console.log('mesh本地坐标',getMesh1?.position);
  /// 根据给定的向量，来获取object3d相对的世界坐标。
  /// 得出的结论， mesh的世界坐标是，mesh的本地坐标 + group的本地坐标，的累积和。
  console.log('根据给定的向量，来获取object3d相对的世界坐标:',mesh.getWorldPosition(worldPosition));
  initLight(scene);

  

  render.render(scene,camera);

});

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
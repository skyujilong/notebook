<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {ref,onMounted} from 'vue';
import { initHelper,initRender,initCamera  } from "../util";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();


onMounted(()=>{
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();
  const camera = initCamera();
  
  initHelper(scene,render,camera);

  const geometry = new THREE.BoxGeometry(40, 20, 40);

  var material = new THREE.MeshLambertMaterial({
    color: 0x0000ff
  });

  const mesh1 = new THREE.Mesh(geometry,material);


  scene.add(mesh1);
  /// 设置产生投影的网格模型
  mesh1.castShadow = true;


  //创建一个平面几何体作为投影面

  const groundGeometry = new THREE.PlaneGeometry(300, 200);

  var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x999999
  });

  const mesh2 = new THREE.Mesh(groundGeometry,planeMaterial);

  scene.add(mesh2);
  mesh2.rotateX(-Math.PI / 2); //旋转网格模型
  mesh2.position.y = -20; //设置网格模型y坐标
  // 设置接收阴影的投影面
  mesh2.receiveShadow = true;
  
  /// 设置聚光灯效果。

  // 方向光
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  // 设置光源位置
  directionalLight.position.set(60, 100, 40);

  scene.add(directionalLight);
  // 设置用于计算阴影的光源对象
  directionalLight.castShadow = true;

  // 设置计算阴影的区域，最好刚好紧密包围在对象周围
  // 计算阴影的区域过大：模糊  过小：看不到或显示不完整
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 300;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 200;
  directionalLight.shadow.camera.bottom = -100;
  // 设置mapSize属性可以使阴影更清晰，不那么模糊
  // directionalLight.shadow.mapSize.set(1024,1024)
  console.log(directionalLight.shadow.camera);

  /// 聚光灯设置

  // 聚光光源
  var spotLight = new THREE.SpotLight(0xffffff);
  // 设置聚光光源位置
  spotLight.position.set(50, 50, 50);
  spotLight.target = mesh1;
  // 设置聚光光源发散角度
  spotLight.angle = Math.PI /3;
  scene.add(spotLight); //光对象添加到scene场景中
  // 设置用于计算阴影的光源对象
  spotLight.castShadow = true;
  // 设置计算阴影的区域，注意包裹对象的周围
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 300;
  spotLight.shadow.camera.fov = 20;

  render.render(scene,camera);

});

</script>
<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { initHelper, initRender, initCamera } from "../../util";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();

onMounted(() => {
  const render = initRender(sceneEl.value!);
  const camera = initCamera();
  const scene = new THREE.Scene();
  initHelper(scene, render, camera);
  //使用Catmull-Rom算法， 从一系列的点创建一条平滑的三维样条曲线。
  var path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, -50, -50),
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(8, 50, 50),
    new THREE.Vector3(-5, 0, 100),
  ]);
  // 管状结构
  // path:路径   40：沿着轨迹细分数  2：管道半径   25：管道截面圆细分数
  const tubeGeometry = new THREE.TubeGeometry(path, 40, 2, 25);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const mesh = new THREE.Mesh(tubeGeometry, material);

  scene.add(mesh);

  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(10, 10, 10),
    new THREE.Vector3(10, 30, 50)
  );

  const tubeGeometry2 = new THREE.TubeGeometry(line1, 100, 5, 50);

  const mesh1 = new THREE.Mesh(tubeGeometry2, material);

  scene.add(mesh1);

  console.log("camera");

  // 创建多段线条的顶点数据
  var p1 = new THREE.Vector3(-85.35, -35.36);
  var p2 = new THREE.Vector3(-50, 0, 0);
  var p3 = new THREE.Vector3(0, 50, 0);
  var p4 = new THREE.Vector3(50, 0, 0);
  var p5 = new THREE.Vector3(85.35, -35.36);
  // 创建线条一：直线
  let line1_1 = new THREE.LineCurve3(p1, p2);
  // 重建线条2：三维样条曲线
  var curve = new THREE.CatmullRomCurve3([p2, p3, p4]);
  // 创建线条3：直线
  let line2 = new THREE.LineCurve3(p4, p5);
  var CurvePath = new THREE.CurvePath<THREE.Vector3>(); // 创建CurvePath对象
  CurvePath.curves.push(line1_1, curve, line2); // 插入多段线条
  //通过多段曲线路径创建生成管道
  //通过多段曲线路径创建生成管道，CCurvePath：管道路径
  var geometry2 = new THREE.TubeGeometry(CurvePath, 100, 5, 25, false);

  scene.add(new THREE.Mesh(geometry2, material));

  initLight(scene);


  render.render(scene, camera);
});

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

<style>
</style>
<template>
  <div class="scene" ref="sceneEl"></div>
</template>
<script lang="ts" setup>
import { onMounted,ref } from "vue";
import { initHelper, initRender, initCamera } from "../../util";
import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();

/// 旋转 path 生成形状
onMounted(()=>{
  const camera = initCamera();
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();
  initHelper(scene,render,camera);
  // const R = 10;
  // /// 半圆
  // const cure = new THREE.ArcCurve(0,0,R,0,Math.PI,false);
  // const line1 = new THREE.LineCurve(new THREE.Vector2(-R,30),new THREE.Vector2(-R,0));
  // const line2 = new THREE.LineCurve(new THREE.Vector2(R,0),new THREE.Vector2(R,30));

  // const path = new THREE.CurvePath<THREE.Vector2>();
  // /// 链接
  // path.curves.push(line1,cure,line2);
  
  var points = [
    new THREE.Vector2(50,60),
    new THREE.Vector2(25,0),
    new THREE.Vector2(50,-60)
];

  const gemoetry = new THREE.LatheGeometry(points,30);

  // gemoetry.setFromPoints(path.getPoints(2000));

  var material=new THREE.MeshPhongMaterial({
    color:0x0000ff,//三角面颜色
    side:THREE.DoubleSide//两面可见
  });//材质对象
  // material.wireframe = true;//线条模式渲染(查看细分数)


  // const material = new THREE.MeshBasicMaterial({
  //   color:0x0000ff,
  //   side:THREE.DoubleSide
  // });
  material.wireframe = true;
  const mesh = new THREE.Mesh(gemoetry, material);
  
  scene.add(mesh);
  initLight(scene);



  /// 平滑曲线旋转得到物体

  const shape = new THREE.Shape();

  shape.splineThru([
    new THREE.Vector2(50,60),
    new THREE.Vector2(25,0),
    new THREE.Vector2(50,-60),
  ]);

  const gemetry1 = new THREE.LatheGeometry(shape.getPoints(20),30);

  const mesh1 = new THREE.Mesh(gemetry1,material);

  mesh1.position.set(0, 150, 0);

  scene.add(mesh1);

  render.render(scene,camera);
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
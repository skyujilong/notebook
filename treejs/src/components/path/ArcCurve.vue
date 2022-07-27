<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue'

import * as THREE from "three";

import { initHelper,initRender,initCamera  } from "../../util/index";
import { CurvePath } from 'three';

const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  const camera = initCamera();
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();

  initHelper(scene,render,camera);

  /// 直线、椭圆、圆弧、基类Curve

  //参数：0, 0圆弧坐标原点x，y  100：圆弧半径    0, 2 * Math.PI：圆弧起始角度
  var arc = new THREE.ArcCurve(0, 0, 50, 0, 2 * Math.PI, true);

  const geometry =  new THREE.BufferGeometry();
  console.log(geometry.attributes.position);


  ///arc.getPoints() 默认是分成5段，也就是5个点。 点数越多细节越多越圆
  geometry.setFromPoints(arc.getPoints(100));

  console.log(geometry.attributes.position);

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
	  linewidth: 20,
	  linecap: 'round', //ignored by WebGLRenderer
	  linejoin:  'round' //ignored by WebGLRenderer
  });

  //线条模型对象
  var line = new THREE.Line(geometry, material);
  scene.add(line);


  // 直线绘制

  let line2Geometry = new THREE.BufferGeometry(); 

  let lineCure = new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(10,10,10));
  line2Geometry.setFromPoints(lineCure.getPoints(500));
  
  var line2 = new THREE.Line(line2Geometry,material);

  scene.add(line2);


  /// 曲线绘制

  let geometry2 = new THREE.BufferGeometry();

  let curve = new THREE.CatmullRomCurve3();

  curve.points.push(new THREE.Vector3(-50, 20, 90),
  new THREE.Vector3(-10, 40, 40),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(70, 0, 80));

  geometry2.setFromPoints(curve.getPoints(1000));

  let line3 = new THREE.Line(geometry2, material)


  scene.add(line3);


  /// 通过组合曲线CurvePath可以把多个圆弧线、样条曲线、直线等多个曲线合并成一个曲线。

  let geometry3_1 = new THREE.BufferGeometry();

  // 绘制一个U型轮廓

  let R = 80;//圆弧半径

  let arc1 = new THREE.ArcCurve(0,0,R,0,Math.PI,false);

  // geometry3_1.setFromPoints(arc1.getPoints(2000));
  let line3_1 = new THREE.LineCurve(new THREE.Vector2(-R,0), new THREE.Vector2(-R, 10));

  let line3_2 = new THREE.LineCurve(new THREE.Vector2(R,0), new THREE.Vector2(R, 10));

  const path = new THREE.CurvePath<THREE.Vector2>();

  path.curves.push(line3_1,arc1,line3_2);

  geometry3_1.setFromPoints(path.getPoints(2000));


  let path3 = new THREE.Line(geometry3_1,material);

  path3.position.set(10,10,10);

  scene.add(path3);

  render.render(scene,camera);

})


</script>
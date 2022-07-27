<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue'

import * as THREE from "three";

import { initHelper,initRender,initCamera  } from "../../util/index";

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
	  linewidth: 5,
	  linecap: 'round', //ignored by WebGLRenderer
	  linejoin:  'round' //ignored by WebGLRenderer
  });

  //线条模型对象
  var line = new THREE.Line(geometry, material);
  scene.add(line);

  render.render(scene,camera);

})


</script>
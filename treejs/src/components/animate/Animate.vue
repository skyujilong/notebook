<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { initHelper, initRender, initCamera } from "../../util/index";

import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();

onMounted(() => {
  const renderer = initRender(sceneEl.value!);
  const camera = initCamera();
  const scene = new THREE.Scene();
  initHelper(scene, renderer, camera);
  initLight(scene);

  // 创建球

  const geometry = new THREE.SphereGeometry(10, 100, 100);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color("#efefef"),
  });

  const mesh = new THREE.Mesh(geometry, material);

  /// 创建动画

  // 创建名为Box对象的关键帧数据
  var times = [0, 10]; //关键帧时间数组，离散的时间点序列

  // 缩放
  var posTrack = new THREE.KeyframeTrack(
    "Sphere.scale",
    times,
    [1, 1, 1, 3, 3, 3]
  );

  // duration决定了默认的播放时间，一般取所有帧动画的最大时间
  // duration偏小，帧动画数据无法播放完，偏大，播放完帧动画会继续空播放
  var duration = 20;

  // 多个帧动画作为元素创建一个剪辑clip对象，命名"default"，持续时间20
  var clip = new THREE.AnimationClip("default", duration, [posTrack]);
  /// mesh 作为混合器的参数，可以播放group中所有子对象的帧动画
  var mixer = new THREE.AnimationMixer(mesh);
  /// 剪辑clip作为参数，通过混合器clipAction方法返回一个操作对象AnimationAction
  var AnimationAction = mixer.clipAction(clip);

  //通过操作Action设置播放方式
  AnimationAction.timeScale = 3; //默认1，可以调节播放速度
  // AnimationAction.loop = THREE.LoopOnce; //不循环播放
  AnimationAction.play(); //开始播放

  scene.add(mesh);

  // renderer.render(scene,camera);

  var clock = new THREE.Clock();
  // 渲染函数
  function render() {
    renderer.render(scene, camera); //执行渲染操作
    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧

    //clock.getDelta()方法获得两帧的时间间隔
    // 更新混合器相关的时间
    mixer.update(clock.getDelta());
  }
  render();
});

function initLight(scene: THREE.Scene) {
  ///环境光
  let light1 = new THREE.AmbientLight(0x404040);
  scene.add(light1);
  let light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(50, 50, 50);
  light2.target = scene;
  scene.add(light2);
}
</script>
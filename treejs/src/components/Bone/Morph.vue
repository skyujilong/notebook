<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>

import { ref, onMounted  } from "vue";
import { initHelper,initRender,initCamera  } from "../../util/index";
import * as THREE from "three";

const sceneEl = ref<HTMLDivElement>();

onMounted(()=>{
  /// 拉抻的一种操作， 用途比方说 人脸的面部变化。 从哭到笑等。
  const renderer = initRender(sceneEl.value!);
  const camera = initCamera();
  const scene = new THREE.Scene();
  initHelper(scene,renderer,camera)
  // 创建一个几何体具有8个顶点
  var geometry = new THREE.BufferGeometry(); //立方体几何对象

  let target1 = new THREE.BoxGeometry(100, 5, 100);

  let target2 = new THREE.BoxGeometry(5, 200, 5);
  /// 顶点坐标
  const vertices = new Float32Array([
      25,
      25,
      25, //0
      25,
      25,
      -25, // 1
      25,
      -25,
      25, //2
      25,
      -25,
      -25, //3
      -25,
      25,
      -25, //4
      -25,
      25,
      25, //5
      -25,
      -25,
      -25, //6
      -25,
      -25,
      25, //7
    ]);
 /// 顶点的索引数据   
 var indexes = new Uint16Array([
      0,
      2,
      1,
      2,
      3,
      1,
      4,
      6,
      5,
      6,
      7,
      5,

      4,
      5,
      1,
      5,
      0,
      1,
      7,
      6,
      2,
      6,
      3,
      2,

      5,
      7,
      0,
      7,
      2,
      0,
      1,
      3,
      4,
      3,
      6,
      4,
    ]);
    geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
    geometry.index = new THREE.BufferAttribute(indexes, 1);


    console.log(target1.getAttribute('position').array);
    console.log(target2.getAttribute('position').array);

    geometry.morphAttributes.position = [
      new THREE.BufferAttribute(target1.getAttribute('position').array,3),
      new THREE.BufferAttribute(target2.getAttribute('position').array,3)
    ];    

    var material = new THREE.MeshLambertMaterial({
      // morphTargets: true, //允许变形
      color: 0x0000ff,
    }); //材质对象


    var mesh = new THREE.Mesh(geometry, material); //网格模型对象
    // mesh.morphTargetInfluences = [1]
    scene.add(mesh); 


    /// 动画方案更改 morphTargetInfluences 0 与 1 的值
    var Track1 = new THREE.KeyframeTrack(
      ".morphTargetInfluences[0]",
      [0, 10, 20],
      [0, 1, 0]
    );
    var Track2 = new THREE.KeyframeTrack(
      ".morphTargetInfluences[1]",
      [20, 30, 40],
      [0, 1, 0]
    );

    var clip = new THREE.AnimationClip("default", 40, [Track1, Track2]);
    var mixer = new THREE.AnimationMixer(mesh); //创建混合器
    var AnimationAction = mixer.clipAction(clip); //返回动画操作对象
    AnimationAction.timeScale = 5; //默认1，可以调节播放速度
    AnimationAction.play(); //开始播放
    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);


    var clock = new THREE.Clock();
    // 渲染函数
    function render() {
      renderer.render(scene, camera); //执行渲染操作
      requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧

      if (mixer !== null) {
        //clock.getDelta()方法获得两帧的时间间隔
        // 更新混合器相关的时间
        mixer.update(clock.getDelta());
      }
    }
    render();
    // mesh.morphTargetInfluences[0] = 1;
    // mesh.morphTargetInfluences[1] = 1;
});

</script>
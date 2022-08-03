<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { initHelper, initCamera, initRender } from "../util/index";
import * as THREE from "three";
const sceneEl = ref<HTMLDivElement>();
onMounted(() => {
  const camera = initCamera();
  const render = initRender(sceneEl.value!);
  const scene = new THREE.Scene();
  initHelper(scene, render, camera);

  sceneEl.value?.addEventListener("mousedown", (event) => {
    console.log(event);
    event.preventDefault();
    var vector = new THREE.Vector3(); //三维坐标对象
    vector.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    vector.unproject(camera);
    console.log(vector);
    var raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub(camera.position).normalize()
    );
    console.log('raycaster',raycaster);
    var intersects = raycaster.intersectObjects(scene.children);
    console.log(intersects);
    if (intersects.length > 0) {
      var selected = intersects[0]; //取第一个物体
      console.log("x坐标:" + selected.point.x);
      console.log("y坐标:" + selected.point.y);
      console.log("z坐标:" + selected.point.z);
    }
  });

  render.render(scene, camera);
});
</script>
<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import Three1 from "./components/Three1.vue";
import Three2 from './components/Three2.vue';
import TreeLine from "./components/TreeLine.vue";
import ThreeLoadGltf from "./components/ThreeLoadGltf.vue";
import ThreeGeometry from "./components/ThreeGeometry.vue";
import ThreeTopPoint from "./components/ThreeTopPoint.vue";
import ThreeTopPoint2 from "./components/ThreeTopPoint2.vue";
import ThreeTopPoint3 from "./components/ThreeTopPoint3.vue";
import ThreeFaces from "./components/ThreeFaces.vue";
import Shadow from "./components/Shadow.vue";
import Position from "./components/Position.vue";
import ArcCurve from "./components/path/ArcCurve.vue";
import TubeCurve from "./components/path/TubeCurve.vue";
import Lathe from "./components/path/Lathe.vue";
import DomEvent from "./components/DomEvent.vue";

import { ref,defineComponent,defineAsyncComponent } from "vue";

const components = ref(new Map<string,any>());

components.value.set('three-1',defineComponent(Three1));
components.value.set('three-2',defineComponent(Three2));
components.value.set('tree-line',defineComponent(TreeLine));
components.value.set('three-load-gltf',defineComponent(ThreeLoadGltf));
components.value.set('three-geometry',defineComponent(ThreeGeometry));
components.value.set('three-top-point',defineComponent(ThreeTopPoint));
components.value.set('three-top-point2',defineComponent(ThreeTopPoint2));
components.value.set('three-top-point3',defineComponent(ThreeTopPoint3));
components.value.set('three-faces',defineComponent(ThreeFaces));
components.value.set('shadow',defineComponent(Shadow));
components.value.set('position',defineComponent(Position));
components.value.set('arc-curve',defineComponent(ArcCurve));
components.value.set('tube-curve',defineComponent(TubeCurve));
components.value.set('lathe-curve',defineComponent(Lathe));
components.value.set('dom-event',defineComponent(DomEvent));

// components.value.set('three-1',()=> defineAsyncComponent(()=>import("./components/Three1.vue")));

let showTemplateName = ref('three-load-gltf');

let list:string[] = [
  'three-1',
  'three-2',
  'tree-line',
  'three-load-gltf',
  'three-geometry',
  'three-top-point',
  'three-top-point2',
  'three-top-point3',
  'three-faces',
  'shadow',
  'position',
  'arc-curve',
  'tube-curve',
  'lathe-curve',
  'dom-event'
];

function onClick(val:string){
  showTemplateName.value = val;
}

</script>

<template>
<ul class="menu">
  <li v-for="item in list" :key="item"  @click="onClick(item)">{{item}}</li>
</ul>
<!-- 动态方案需要采用components.get方案来获取，这个定义了一个Map类型。 -->
<component v-if="showTemplateName != ''" :is="components.get(showTemplateName)"></component>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.menu{
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  background:  #fff;
  opacity: 0.8;
  color: black;
  max-height: 150px;
  overflow-y: scroll;
}
</style>

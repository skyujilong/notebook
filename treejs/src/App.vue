<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import Three1 from "./components/Three1.vue";
import { ref,defineComponent,defineAsyncComponent } from "vue";

const components = ref(new Map<string,any>());

components.value.set('three-1',defineComponent(Three1));

// components.value.set('three-1',()=> defineAsyncComponent(()=>import("./components/Three1.vue")));

let showTemplateName = ref('');

let list:string[] = [
  'three-1'
];

function onClick(val:string){
  showTemplateName.value = val;
}

</script>

<template>
<ul v-for="item in list" :key="item">
  <li @click="onClick(item)">{{item}}</li>
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
</style>

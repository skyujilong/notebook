<script lang="ts" setup>
import { ref,onMounted } from 'vue'

let style = 'width:100vw;height:100vh;font-size:16px;';
let countdown = ref(0);
onMounted(()=>{
  console.log('Three1 hello world');
});


function onClick(evt:any){
  console.log(evt.target);
  countdown.value++;
}

</script>

<template>
  <div :style="style">
    <h1 @click="onClick">点击次数为{{countdown}}</h1>
  </div>
</template>
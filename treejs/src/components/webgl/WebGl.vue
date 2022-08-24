<template>
  <div class="scene" ref="sceneEl"></div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue' 
/// javascript的矩阵相关的一个类库
import { mat4 } from "gl-matrix";

const sceneEl = ref<HTMLDivElement>();


/// 传递值给opengl 分析
/**
 * 
 * 之前我们有定义openGl的执行代码部分。 如下：
 * 
 * const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
 * 其中 有三句话如下：
 * attribute vec4 aVertexPosition;
 * uniform mat4 uModelViewMatrix;
 * uniform mat4 uProjectionMatrix;
 * 这三句都是声明了一个变量。 分别是类型vec4的aVertexPosition 
 * 类型mat4的uModelViewMatrix,uProjectionMatrix
 * js环境是如何传递值的。 看下面的代码。
 * gl!.getAttribLocation(shaderProgram!, 'aVertexPosition')
 * 通过该方法，我们其实是拿到了aVertexPosition变量对应的指针地址。 如果没有找到，返回的是-1。
 * 通过如下方法开辟一个缓冲区
 * const positionBuffer = gl.createBuffer();
 * 之后通过gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
 * 绑定缓冲区的对象【把positionBuffer绑定给当前的openGl运行环境上】。 注意这里， openGl的设计模式是状态机模式，所有的api基本上都是围绕着修改状态来设计的。 
 * 之后通过gl.bufferData(target, size, usage)方法向缓冲区，写入数据。
 * gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);
 * 通过bufferData方法，将positions 数组写入到缓冲区内。
 * 之后的操作就是将该缓冲区与变量相结合赋值。
 * const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        /// 将缓冲区的内容赋值到aVertexPosition 变量的指针上。
        gl!.getAttribLocation(shaderProgram!, 'aVertexPosition')
        numComponents, // 一个顶点用几个来描述， 1，2，3，4
        type,
        normalize,
        stride,
        offset);
    /// 启用变量。
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
 * 
 * 
 * 
 */


// Vertex shader program
// 顶点渲染器
const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

// Fragment shader program
// 片段着色器
const fsSource = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 0.5, 1.0);
  }
`;

onMounted(()=>{
  const canvas =  document.createElement('canvas');
  canvas.width=window.innerWidth;
  canvas.height = window.innerHeight;
  sceneEl.value!.appendChild(canvas);
  const gl = canvas.getContext('webgl');
  /// 获取到渲染程序。
  const shaderProgram = initShaderProgram(gl!,vsSource,fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      /// getAttribLocation 返回了给定WebGLProgram对象中某属性的下标指向位置。
      vertexPosition: gl!.getAttribLocation(shaderProgram!, 'aVertexPosition'),
    },
    uniformLocations: {
      /// uniform 是传递值的一种方式
      projectionMatrix: gl!.getUniformLocation(shaderProgram!, 'uProjectionMatrix'),
      modelViewMatrix: gl!.getUniformLocation(shaderProgram!, 'uModelViewMatrix'),
    },
  };

  console.log('programInfo',programInfo);
  
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl!);

  // Draw the scene 绘制场景
  drawScene(gl!, programInfo, buffers!);
});


function drawScene(gl:WebGLRenderingContext, programInfo:any, buffers:{
  position: WebGLBuffer | null
}){
  /// 初始化背景
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  /// 初始化透视相机

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  /// 类似于视觉查看
  const projectionMatrix = mat4.create();
  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  ///Generates a perspective projection matrix with the given bounds. The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1], which matches WebGL/OpenGL's clip volume. Passing null/undefined/no value for far will generate infinite projection matrix.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  

  /// 这里是绘画的区域创建
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();
  console.log('modelViewMatrix before',modelViewMatrix);
  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  
  console.log('modelViewMatrix after',modelViewMatrix);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        /// gl!.getAttribLocation(shaderProgram!, 'aVertexPosition')
        programInfo.attribLocations.vertexPosition, // 
        numComponents, // 一个顶点用几个来描述， 1，2，3，4
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // 正方形顶点颜色
		// const colors = [
		// 	1.0,  0.0,  0.0,  1.0,    // 红色
		// 	0.0,  1.0,  0.0,  1.0,    // 绿色
		// 	0.0,  0.0,  1.0,  1.0,    // 蓝色
		// 	1.0,  1.0,  1.0,  1.0,    // 白色
		// ];

    // let colorBuffer = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // let vertexColor = gl.getAttribLocation(programInfo.program, 'aVertexColor');
    // gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
		// gl.enableVertexAttribArray(vertexColor);


  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);


    

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}


function initBuffers(gl:WebGLRenderingContext){
  // Create a buffer for the square's positions.
  /// 创建一个缓冲区
  const positionBuffer = gl.createBuffer();

   // Now create an array of positions for the square.
  // 因为绘制的是平面内容，因此是两个坐标描述一个点。
  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  /// 向缓冲区中添加 positions 感觉这段没有用那？ gl.bufferData target就是gl.ARRAY_BUFFER 这个是个常量啊？
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);
  console.log('positionBuffer',positionBuffer, gl.ARRAY_BUFFER);
  console.log('缓冲区大小',gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));
  console.log('缓冲区使用',gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE));
  return {
    position: positionBuffer,
  };
}



/// 顶点渲染器和着色器 绑定代码
function initShaderProgram(gl:WebGLRenderingContext,vsSource:string, fsSource:string){
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  const shaderProgram = gl.createProgram();
  /// 向webgl program 上添加顶点着色器和片段着色器
  gl.attachShader(shaderProgram!, vertexShader!);
  gl.attachShader(shaderProgram!, fragmentShader!);
  /// 给定的WebGLProgram，从而完成为程序的片元和顶点着色器准备 GPU 代码的过程。
  gl.linkProgram(shaderProgram!);

  return shaderProgram;
}

function loadShader(gl:WebGLRenderingContext, type:number, codeSource:string){
  const shader = gl.createShader(type);
  // 关联code source
  gl.shaderSource(shader!,codeSource);
  // 编译后才能执行。
  gl.compileShader(shader!);

  return shader;
}

</script>
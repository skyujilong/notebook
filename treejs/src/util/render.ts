import * as THREE from "three";

function initRender(dom:Element) {
  const render = new THREE.WebGLRenderer({
    antialias: true
  });
  render.setSize(window.innerWidth, window.innerHeight);
  /// 启用阴影
  render.shadowMap.enabled = true;
  dom.appendChild(render.domElement);
  return render;
}


export { initRender };


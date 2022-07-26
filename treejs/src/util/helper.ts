import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
function initHelper(scene: THREE.Scene, render: THREE.Renderer, camera: THREE.Camera):void {
  scene.add(new THREE.AxesHelper(250));
  const listener = new OrbitControls(camera, render.domElement);
  listener.addEventListener('change', () => {
    render.render(scene, camera);
  });
}

export { initHelper };


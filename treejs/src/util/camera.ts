
import * as THREE from "three";
function initCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 150);
  camera.lookAt(0, 0, 0);
  return camera;
}

export {initCamera}



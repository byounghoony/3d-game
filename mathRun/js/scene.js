import { wrap } from './main.js';
import * as THREE from './three/three.module.js';

// Three.js 기본 세팅
export const container = document.getElementById('js-gameContainer');
export const scene = new THREE.Scene();

// 배경을 위한 별도의 Scene과 Camera
export const backgroundScene = new THREE.Scene();
export const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

const basicSize = { w: isMobile() ? 360 : 1920, h: isMobile() ? 780 : 1080 };
export const camera = new THREE.PerspectiveCamera(45, setScale(basicSize.w) / setScale(basicSize.h), 0.1, 1000);
camera.position.set(0, 1.8, 10);
camera.lookAt(0, 1.5, 0);

export const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.setSize(setScale(basicSize.w), setScale(basicSize.h));
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // 색상 공간 설정 추가
renderer.domElement.style.top = `calc(50% - ${setScale(basicSize.h)}px / 2)`;
renderer.domElement.style.left = `calc(50% - ${setScale(basicSize.w)}px / 2)`;
document.body.prepend(renderer.domElement)

function setScale(size){
  return size * window.currentZoom;
};

window.addEventListener('resize', () => {
  renderer.setSize(setScale(basicSize.w), setScale(basicSize.h));
  renderer.domElement.style.top = `calc(50% - ${setScale(basicSize.h)}px / 2)`;
  renderer.domElement.style.left = `calc(50% - ${setScale(basicSize.w)}px / 2)`;
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.aspect = setScale(basicSize.w) / setScale(basicSize.h);
  camera.updateProjectionMatrix();
});

const hemi = new THREE.HemisphereLight(0xffffff, 0x88aaff, 2); // 강도를 1에서 2로 증가
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 2); // 강도를 2에서 3으로 증가
dir.position.set(5,10,7);
dir.castShadow = true;
scene.add(dir);

const groundTex = new THREE.TextureLoader().load(
  './textures/road.png'
);
groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
groundTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
groundTex.repeat.set(1,2);

// 중앙 길 생성
const pathGeometry = new THREE.PlaneGeometry(6.2, 200); // 길 폭 2, 길이 200
const pathMaterial = new THREE.MeshStandardMaterial({ map: groundTex, fog: false });
export const centerLoad = new THREE.Mesh(pathGeometry, pathMaterial);
centerLoad.rotation.x = -Math.PI / 2;
centerLoad.position.y = 0.01; // 잔디보다 살짝 위에 위치
scene.add(centerLoad);
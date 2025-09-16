import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { OrbitControls } from './three/OrbitControls.js';
import { RGBELoader } from './three/RGBELoader.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { state, boardSize, halfSize } from './config.js';
import { onPointerDown } from './interaction.js';

export function setup() {
  // 씬, 카메라, 렌더러
  state.scene = new THREE.Scene();
  state.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  state.camera.position.set(0, 10, 10);
  state.camera.lookAt(0, 0, 0);

  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(state.renderer.domElement);

  // 배경 및 환경맵
  new RGBELoader().load('./hdr/space.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    state.scene.background = texture;
    state.scene.environment = texture;
  });

  // 3D 모델 로드
  new GLTFLoader().load('./model.gltf', (gltf) => {
    const table = gltf.scene;
    const scale = 20;
    table.position.set(0, -21, 0);
    table.scale.set(scale, scale, scale);
    state.scene.add(table);
    table.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      };
    });
  });

  // 컨트롤
  state.controls = new OrbitControls(state.camera, state.renderer.domElement);
  state.controls.enablePan = false;
  state.controls.enableZoom = true;
  state.controls.update();

  // 물리 월드
  state.world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  state.world.broadphase = new CANNON.NaiveBroadphase();
  state.world.solver.iterations = 300;

  // 바닥
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load('./wood3.jpg');
  const gMesh = new THREE.Mesh(
    new THREE.BoxGeometry(boardSize, 1, boardSize),
    new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 0.5, metalness: 0.1 })
  );
  gMesh.position.set(0, -0.5, 0);
  state.scene.add(gMesh);

  const groundMaterial = new CANNON.Material('groundMat');
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(boardSize / 2, 0.1, boardSize / 2)),
    material: groundMaterial
  });
  groundBody.position.set(0, -0.1, 0);
  state.world.addBody(groundBody);

  // 바둑판 선
  const lineMat = new THREE.LineBasicMaterial({ color: 0x000, linewidth: 2 });
  const lineGeo = new THREE.BufferGeometry();
  const positions = [];
  const count = (halfSize * 2);
  const step = (halfSize * 2) / (count + 1);

  for (let i = 0; i <= count + 1; i++) {
    let z = -halfSize + i * step;
    positions.push(-halfSize, 0.01, z, halfSize, 0.01, z);
  };
  for (let j = 0; j <= count + 1; j++) {
    let x = -halfSize + j * step;
    positions.push(x, 0.01, -halfSize, x, 0.01, halfSize);
  };
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  state.scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // 조명
  const light = new THREE.DirectionalLight(0xffffff, 2.5);
  light.position.set(10, 20, 10);
  state.scene.add(light);
  state.scene.add(new THREE.AmbientLight(0x888888));

  // 미니맵
  state.miniRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('minimap') });
  state.miniRenderer.setSize(200, 200);
  state.miniCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0, 30);
  state.miniCamera.position.set(0, 20, 0);
  state.miniCamera.lookAt(0, 0, 0);

  // 화살표
  state.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 3, 0xff0000);
  state.arrowHelper.visible = false;
  state.scene.add(state.arrowHelper);

  // 이벤트 리스너
  window.addEventListener('resize', onWindowResize);
  state.renderer.domElement.addEventListener('pointerdown', onPointerDown);
};

function onWindowResize() {
  if (!state.camera || !state.renderer) return;
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
};
import * as THREE from './three/three.module.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { RoundedBoxGeometry } from './three/RoundedBoxGeometry.js';
import { laneX } from './utils.js';
import { scene } from './scene.js';

// 모델 관련 변수
export let animalModel = null;
export let mixer = null;
export let runAction = null;

// GLTF 모델 로드
export const loader = new GLTFLoader();
loader.load(
  './textures/mei.glb',
  gltf => {
    animalModel = gltf.scene;
    animalModel.traverse(node => {
      if(node.isMesh) {
        node.castShadow = true;
        // 캐릭터의 재질을 약간 밝게 만들어 어두워 보이는 현상을 개선합니다.
        if (node.material) {
          // emissive 색상을 약간 밝게 설정하여 자체 발광 효과를 줍니다.
          node.material.emissive = new THREE.Color(0x666666);
        };
      };
    });
    scene.add(animalModel);
    const scleFactor = 0.01;
    animalModel.scale.set(scleFactor, scleFactor, scleFactor);
    animalModel.rotation.y = Math.PI; // 뒤돌아보게
    animalModel.position.set(laneX[1], 0, 3);

    animalModel.fail = () => {
      let blinkCount = 0;
      const blinkMax = 6;
      const blinkInterval = setInterval(() => {
        animalModel.traverse(node => {
          if (node.isMesh && node.material) {
            node.material.transparent = true;
            node.material.opacity = node.material.opacity === 1 ? 0 : 1;
          }
        });
        blinkCount++;
        if (blinkCount > blinkMax) {
          clearInterval(blinkInterval);
          // 최종적으로 원상복귀
          animalModel.traverse(node => {
            if (node.isMesh && node.material) node.material.opacity = 1;
          });
        }
      }, 100); // 0.1초 간격으로 깜빡
    };

    animalModel.success = () => {
      const duration = 300; // 총 점프 시간(ms)
      const height = 0.5;   // 점프 높이
      const startY = animalModel.position.y;
      const startTime = performance.now();

      function jumpAnimation(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const yOffset = Math.sin(progress * Math.PI) * height;
        animalModel.position.y = startY + yOffset;

        if (progress < 1) {
          requestAnimationFrame(jumpAnimation);
        } else {
          animalModel.position.y = startY; // 원위치
        };
      };

      requestAnimationFrame(jumpAnimation);
    };

    // 애니메이션 믹서 설정
    mixer = new THREE.AnimationMixer(animalModel);
    const clips = gltf.animations;
    // 예: run 애니메이션이름이 'Run' 혹은 첫 번째 애니메이션 사용
    runAction = mixer.clipAction(clips[0]);
    runAction.play();
  },
  undefined,
  error => {
    console.error('모델 로드 실패:', error);
  }
);

export const doors = [];
export const doorGeo = new THREE.BoxGeometry(1.6,2.2,0.3);
export const doorMat = new THREE.MeshStandardMaterial({ color:0xffffff, metalness:0.1, roughness:0.8 });

/* 톨게이트(문) 생성 함수 */
export function createTollGate(zPos, question, qNumber, answers) {
  const group = new THREE.Group();

  // 전광판 배경 (둥근 초록색 박스)
  const backgroundBoard = new THREE.Mesh(
    new RoundedBoxGeometry(6.2, 1.4, 0.1, 5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x00cc99 })
  );
  backgroundBoard.position.set(0, 3.2, 0.16);
  group.add(backgroundBoard);

  // 전광판 (문제 텍스트)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 180px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${question}`, 512, 128); // 텍스트 위치는 그대로 유지
  const tex = new THREE.CanvasTexture(canvas);
  const board = new THREE.Mesh(
    new RoundedBoxGeometry(6, 1.2, 0.1, 5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, transparent: true, alphaTest: 0.5 })
  );
  board.position.set(0, 3.2, 0.22);
  group.add(board);

  // 번호판 박스 추가
  const numCanvas = document.createElement('canvas');
  numCanvas.width = 128;
  numCanvas.height = 128;
  const numCtx = numCanvas.getContext('2d');
  numCtx.fillStyle = '#ffffff';
  numCtx.font = 'bold 100px sans-serif';
  numCtx.textAlign = 'center';
  numCtx.textBaseline = 'middle';
  numCtx.fillText(String(qNumber), 64, 64);
  const numTex = new THREE.CanvasTexture(numCanvas);

  // 번호판 배경 (초록색)
  const numBackground = new THREE.Mesh(
    new RoundedBoxGeometry(0.8, 0.8, 0.1, 5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x00cc99 })
  );
  numBackground.position.set(-3.4, 3.4, 0.16);
  group.add(numBackground);

  // 번호판 텍스트 (흰색)
  const numBoard = new THREE.Mesh(
    new RoundedBoxGeometry(0.8, 0.8, 0.2, 5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: numTex, transparent: true, alphaTest: 0.5 })
  );
  // 전광판 왼쪽에 배치
  numBoard.position.set(-3.4, 3.35, 0.22);
  group.add(numBoard);

  // 보기 3개 (레인별)
  for (let i = 0; i < 3; i++) {
    const lane = laneX[i];
    const gate = createMiniGate(lane, 0, answers[i].val, answers[i].correct, i);
    group.add(gate);
  };

  // 위치 조정
  group.position.set(0, 0, zPos);
  scene.add(group);
  return group;
};

/* 미니 게이트(보기) 생성 함수 */
function createMiniGate(x, z, val, isCorrect, index) {
  const g = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 340;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = index == 0 ? '#FAE67C' : index == 1 ? '#96DEF9' : '#FAA984';
  ctx.fillRect(0, 0, 256, 340);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 150px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(val), 128, 170);
  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.4),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  mesh.position.set(0, 1.2, 0.16);

  // 레인 기둥
  const pillarGeo = new THREE.BoxGeometry(0.2, 2.8, 0.3);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const l = new THREE.Mesh(pillarGeo, mat);
  const r = new THREE.Mesh(pillarGeo, mat);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.3), mat);
  t.position.set(0, 2.4, 0);
  l.position.set(-1, 1.1, 0);
  r.position.set(1, 1.1, 0);
  g.add(l, r, t, mesh);
  g.position.set(x, 0, z);
  g.userData = { correct: isCorrect, isMiniGate: true, index: index}; // 정답 여부와 미니 게이트 표시
  return g;
};
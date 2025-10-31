import * as THREE from './three/three.module.js';
import { clock, startGame } from './game.js';
import { scoreVal, updateStageLabel } from './ui.js';
import { moveToLane, score, setSpawning, setScore, incrementCurrentStage, setIsRouletteActive, clearTimers, addScore, removeScore } from './utils.js';
import { scene } from './scene.js';

export let rouletteGroup, rouletteWheelMesh, roulettePointerMesh;
export let isSpinning = false;
export let rouletteSpinSpeed = 0;

export const rouletteUiContainer = document.getElementById('rouletteUiContainer');
export const spinBtn = document.getElementById('spinBtn');
export const rouletteResult = document.getElementById('rouletteResult');

export const rouletteOptions = [
  { value: 'plus', number: 10, text: "+10점" },
  { value: 'plus', number: 20, text: "+20점" },
  { value: 'plus', number: 30, text: "+30점" },
  { value: 'minus', number: 10, text: "-10점" },
  { value: 'minus', number: 20, text: "-20점" },
  { value: 'minus', number: 30, text: "-30점" },
  { value: 'double', text: "점수 두배" },
  { value: 'half', text: "점수 반감" },
];

export function create3DRoulette() {
  if (rouletteGroup) return; // 이미 생성되었으면 반환

  rouletteGroup = new THREE.Group();

  // 룰렛 텍스처 생성
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 512;
  const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
  const angleStep = (Math.PI * 2) / 8;

  for (let i = 0; i < 8; i++) {
    const angle = i * angleStep;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.arc(256, 256, 250, angle, angle + angleStep);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
  };

  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';

  for (let i = 0; i < 8; i++) {
    const angle = i * angleStep;
    ctx.save();
    ctx.translate(256, 256); // 캔버스 중심으로 이동
    ctx.rotate(angle + angleStep / 2); // 섹션의 중간 각도로 회전
    ctx.fillText(rouletteOptions[i].text, 0, -180); // 텍스트 그리기
    ctx.restore(); // 텍스트 그린 후 캔버스 상태 복원
  };

  const texture = new THREE.CanvasTexture(canvas);
  
  // 룰렛 휠 (원기둥)
  const wheelGeo = new THREE.CylinderGeometry(2, 2, 0.2, 32);
  const wheelMat = new THREE.MeshStandardMaterial({ map: texture });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
  rouletteWheelMesh = new THREE.Mesh(wheelGeo, [sideMat, wheelMat, sideMat]);
  rouletteWheelMesh.rotation.x = Math.PI / 2; // 180도 뒤집기
  rouletteGroup.add(rouletteWheelMesh);

  // 포인터 (원뿔)
  const pointerGeo = new THREE.ConeGeometry(0.1, 0.5, 16);
  const pointerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  roulettePointerMesh = new THREE.Mesh(pointerGeo, pointerMat);
  roulettePointerMesh.position.set(0, 2, 0.1);
  roulettePointerMesh.rotation.x = Math.PI;
  rouletteGroup.add(roulettePointerMesh);

  rouletteGroup.position.set(0, 3, 0);
  rouletteGroup.visible = false;
  scene.add(rouletteGroup);
};
create3DRoulette();

export function pauseForRoulette() {
  moveToLane(1);
  setSpawning(false);
  clearTimers();
  setIsRouletteActive(true); // 룰렛 활성화 상태로 설정
  setTimeout(() => {
    rouletteGroup.visible = true;
    rouletteWheelMesh.rotation.y = Math.PI * 2 / 8 * 2.5;

    // UI 보이기
    rouletteUiContainer.style.display = 'flex';
    rouletteResult.textContent = '';
    spinBtn.disabled = false;
  }, 100);
}; // 3D 룰렛 보이기

spinBtn.addEventListener('click', () => {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;
  rouletteUiContainer.style.display = 'none';

  const randomIndex = Math.floor(Math.random() * rouletteOptions.length);
  const angleStep = Math.PI * 2 / 8;
  const baseRotation = (Math.PI * 2) * 5; // 기본 회전 수 (애니메이션 효과)
  const targetRotation = baseRotation + (randomIndex * angleStep) + (angleStep * 2.5);

  let currentRotation = rouletteWheelMesh.rotation.y;
  const duration = 4; // 4초
  const startTime = clock.getElapsedTime();

  function animateSpin() {
    const elapsedTime = clock.getElapsedTime() - startTime;
    if (elapsedTime < duration) {
      const t = elapsedTime / duration;
      // ease-out-cubic
      const easedT = 1 - Math.pow(1 - t, 3);
      rouletteWheelMesh.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, easedT);
      requestAnimationFrame(animateSpin);
    } else {
      rouletteWheelMesh.rotation.y = targetRotation;
      isSpinning = false;
      applyRouletteResult(rouletteOptions[randomIndex]);
      
      setTimeout(() => {
        rouletteGroup.visible = false;

        incrementCurrentStage();
        setIsRouletteActive(false); // 룰렛 비활성화 상태로 설정
        updateStageLabel();
        startGame();
      }, 1000);
    };
  };
  animateSpin();
});

function applyRouletteResult(option) {
  rouletteResult.textContent = option.text;
  let newScore = score;
  if (option.value === 'plus') addScore(option.number);
  else if (option.value === 'minus') removeScore(option.number);
  else if (option.value === 'double') newScore *= 2;
  else if (option.value === 'half') newScore = Math.floor(newScore / 2);
  setScore(newScore);
  scoreVal.textContent = score;
};
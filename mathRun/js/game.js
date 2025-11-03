import * as THREE from './three/three.module.js';
import { bgmBtn, finalScore, gameOverContainer, wrap } from "./main.js";
import { animalModel, createTollGate, doors, mixer } from "./model.js";
// import { pauseForRoulette, rouletteGroup, rouletteSpinSpeed } from "./roulette.js";
import { camera, centerLoad, renderer, scene, backgroundScene, backgroundCamera } from "./scene.js";
import { renderLives, scoreVal, stageDefs, updateStageLabel } from "./ui.js";
import { currentStage, isEndGame, laneIndex, lives, moveToLane, questionNumber, score, spawning, addScore, decreaseLives, resetGameStatus, setSpawning, setIsEndGame, incrementQuestionNumber, shuffle, setLastSpawnTime, getLastSpawnTime, spawnInterval, playEfSound } from "./utils.js";
import { pauseForStage } from './bonusStage.js';

export const clock = new THREE.Clock();
const gameoverText = document.getElementById('js-gameoverText');

export function spawnDoors() {
  setLastSpawnTime(Date.now());
  // 스테이지 전환 로직은 checkDoors에서 처리
  const gen = stageDefs[currentStage-1].gen;
  const correct = gen();
  const wrong1 = gen(); 
  if(wrong1.ans === correct.ans) wrong1.ans++;
  const wrong2 = gen(); 
  if(wrong2.ans === correct.ans || wrong2.ans === wrong1.ans) wrong2.ans += 2;
  if(wrong2.ans === correct.ans || wrong2.ans === wrong1.ans) wrong2.ans += 2;
  const answers = shuffle([
    {val: correct.ans, correct: true},
    {val: wrong1.ans, correct: false},
    {val: wrong2.ans, correct: false}
  ]);

  // 이전 문(tollgateGroup)들을 모두 제거
  doors.forEach(d => {
    if (d.parentGroup && d.parentGroup.parent) scene.remove(d.parentGroup);
  });
  doors.length = 0;
  // 각 문은 자신의 레인 인덱스와 정답 여부를 가집니다.
  const tollgateGroup = createTollGate(-40, correct.q, questionNumber, answers);
  tollgateGroup.children.forEach((child) => {
    // 기둥과 전광판을 제외하고, 3개의 문만 doors 배열에 추가합니다.
    if (child.userData.isMiniGate) {
      doors.push({ mesh: child, lane: child.userData.index, data: { correct: child.userData.correct }, reached: false, parentGroup: tollgateGroup });
    };
  });

  incrementQuestionNumber();
};

let time = 0;
let aniIndex = 0;
let bgIndex = 0;

// 배경 텍스처 로드
const textureLoader = new THREE.TextureLoader();
const bgTextures = [
  [
    // textureLoader.load('./images/tree_1.png'),
    // textureLoader.load('./images/tree_2.png'),
    textureLoader.load('./images/bg/bg_1.png'),
    textureLoader.load('./images/bg/bg_2.png'),
    // textureLoader.load('./images/bg/bg_3.png'),
    // textureLoader.load('./images/bg/bg_4.png'),
  ],
  [
    textureLoader.load('./images/bg/bg_1.png'),
    textureLoader.load('./images/bg/bg_2.png'),
  ],
  [
    textureLoader.load('./images/bg/bg_1.png'),
    textureLoader.load('./images/bg/bg_2.png'),
  ],
  [
    textureLoader.load('./images/bg/bg_1.png'),
    textureLoader.load('./images/bg/bg_2.png'),
  ],
  [
    textureLoader.load('./images/bg/bg_1.png'),
    textureLoader.load('./images/bg/bg_2.png'),
  ],
];

// 배경 텍스처를 2개로 늘리고, 각 배경을 위한 Mesh를 생성합니다.
const bgTexture1 = textureLoader.load('./images/game_bg.png'); // 전체 배경
const bgMaterial1 = new THREE.MeshBasicMaterial({ map: bgTexture1 });
const bgMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial1);
backgroundScene.add(bgMesh1);

const bgMaterial2 = new THREE.MeshBasicMaterial({
  map: bgTextures[currentStage - 1][0],
  transparent: true, // 투명도 사용
});
const bgMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial2);
backgroundScene.add(bgMesh2);

export async function checkDoors(delta){
  aniIndex++;
  if (aniIndex % 12 === 0) {
    bgIndex++;
    const bg = bgTextures[currentStage -1];
    bgMesh2.material.map = bg[bgIndex % bg.length]; // 두 번째 배경 Mesh의 텍스처를 교체합니다.
  };

  // 문 생성 로직
  if (Date.now() - getLastSpawnTime() > spawnInterval) {
    if (spawning) spawnDoors();
  };

  centerLoad.material.map.offset.y += delta * 0.3;

  for(const d of doors){
    // 각 문(과 부모 그룹)을 함께 움직입니다.
    if (!d.parentGroup) return;
    d.parentGroup.position.z += delta * 5;

    // 플레이어 위치(z=4)를 문이 통과했는지 확인합니다.
    const doorZPosition = d.parentGroup.position.z + d.mesh.position.z;
    if(!d.reached && doorZPosition > 3){
      d.reached = true;
      
      // 플레이어의 현재 레인과 문이 있는 레인이 일치하는지 확인합니다.
      if(animalModel && d.lane === laneIndex) {
        if (d.parentGroup && d.parentGroup.parent) scene.remove(d.parentGroup);

        if(d.data.correct){
          playEfSound('success');
          animalModel.success();
          addScore(10);
        } else {
          playEfSound('fail');
          animalModel.fail();
          setSpawning(false);
          decreaseLives();
          renderLives();

          await new Promise((resolve) => {
            setTimeout(() => {
              setSpawning(true);
              if(lives <= 0) endGame(false);

              resolve();
            }, 1500);
          });
        };
        
        if (questionNumber % 10 === 1 && !isEndGame) {
          if (currentStage < stageDefs.length) {
            pauseForStage();
            return;
          } else {
            endGame(true);
          };
        };
      };
    };
  };

  for(let i = doors.length - 1; i >= 0; i--){
    if(!doors[i].parentGroup || !doors[i].parentGroup.parent) doors.splice(i,1);
  };

  // 달리기 애니메이션이 있으면 mixer 업데이트
  if (mixer) mixer.update(delta);

  time += delta;
};

export function startGame() {
  setIsEndGame(false);
  setSpawning(true);
  spawnDoors(); // 게임 시작 시 첫 문 즉시 생성
  renderLives();
  updateStageLabel();
  wrap.classList.add('startGame');
};

export function resetGame(){
  if (doors[0] && doors[0].parentGroup && doors[0].parentGroup.parent) scene.remove(doors[0].parentGroup);
  gameOverContainer.classList.remove('winGame');
  gameOverContainer.classList.remove('loseGame');
  gameOverContainer.classList.remove('aniFinish');
  moveToLane(1);
  resetGameStatus();
  scoreVal.textContent = 0;
  renderLives();
  updateStageLabel();
};

export function endGame(win){
  bgmBtn.off();
  if (doors[0] && doors[0].parentGroup && doors[0].parentGroup.parent) scene.remove(doors[0].parentGroup);
  setSpawning(false);
  setIsEndGame(true);
  win ? winGame() : loseGame();
  moveToLane(1);
  gameoverText.querySelectorAll('span')[0].textContent = currentStage;
  gameoverText.querySelectorAll('span')[1].textContent = score;
};

function winGame(){
  playEfSound('win');
  gameOverContainer.classList.add('winGame');
  setTimeout(() => {
    gameOverContainer.classList.add('aniFinish');
  }, 1500);
};

function loseGame(){
  playEfSound('lose');
  gameOverContainer.classList.add('loseGame');
  setTimeout(() => {
    gameOverContainer.classList.add('aniFinish');
  }, 2500);
};

export function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // 배경 Scene을 먼저 렌더링하고, 메인 Scene을 겹쳐서 렌더링합니다.
  renderer.autoClear = false;
  renderer.clear();
  renderer.render(backgroundScene, backgroundCamera); // 배경 렌더링
  renderer.clearDepth(); // 뎁스 버퍼만 초기화
  renderer.render(scene, camera);

  if (spawning) checkDoors(delta);
};
animate();
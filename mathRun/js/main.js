import { bonusStageBtn } from "./bonusStage.js";
import { resetGame, startGame } from "./game.js";
import { renderer } from "./scene.js";
import { overEvent, spawning, setSpawning, getLastSpawnTime, setRemainingTime, getRemainingTime, spawnInterval, setLastSpawnTime, bgmSound, playEfSound, imagePath, isMobile } from "./utils.js";

// wrap
export const wrap = document.getElementById('app');
// boot
export const bootContainer = document.getElementById('js-bootContainer');
export const bootLogo = document.getElementById('js-bootLogo');
// loading
export const loadingContainer = document.getElementById('js-loadingContainer');
// intro
export const mainContainer = document.getElementById('js-mainContainer');
export const startBtn = document.getElementById('js-startBtn');
export const howBtn = document.getElementById('js-howBtn');
export const closeHowBtn = document.getElementById('js-closeHowBtn');
// main game
export const playBtn = document.getElementById('js-playBtn');
export const bgmBtn = document.getElementById('js-bgmBtn');
// gameover
export const gameOverContainer = document.getElementById('js-gameOverContainer');
export const finalScore = document.getElementById('js-finalScore');
export const retryBtn = document.getElementById('js-restartBtn');

isMobile() && wrap.classList.add('isMobile');

// 버튼 호버 이펙트
const overEventList = [startBtn, howBtn, closeHowBtn, retryBtn, bonusStageBtn];
overEventList.forEach(btn => overEvent(btn));

/* 이미지 선로딩 */
const imagesToPreload = [
  `${imagePath}bonus_bg.png`,
  `${imagePath}startBtn_hover.png`,
  `${imagePath}howBtn_hover.png`,
  `${imagePath}close_hover.png`,
  `${imagePath}resetBtn_hover.png`,
  `${imagePath}left_hover.png`,
  `${imagePath}right_hover.png`,
  `${imagePath}boxBtn_hover.png`,
];

imagesToPreload.forEach(src => {
  const img = new Image();
  img.src = src;
});

/* boot 애니메이션 후 로딩화면 전환 */
bootLogo.addEventListener('animationend', () => {
  bootContainer.classList.add('aniStart');
  loadingContainer.classList.add('aniStart');
});
/* 로딩 애니메이션 후 인트로 전환 */
loadingContainer.querySelector('#js-loadingAni').addEventListener('animationend', () => {
  mainContainer.classList.add('aniStart');
});

/* 인트로에서 시작 버튼 클릭 시 게임 시작 */
startBtn.addEventListener('click', () =>{
  if(!spawning){
    if (!bgmBtn.hasAttribute('data-bg')) {
      bgmSound.currentTime = 0;
      bgmBtn.on();
    };
    playEfSound();
    resetGame();
    startGame();
    renderer.domElement.classList.add('on');
    loadingContainer.classList.remove('aniStart');
    mainContainer.classList.remove('aniStart');
    mainContainer.classList.add('opacity');
  };
});

/* 인트로에서 게임 방법 버튼 클릭 시 게임 방법창 표시 */
howBtn.addEventListener('click', () => {
  playEfSound();
  wrap.classList.add('showHow');
});
closeHowBtn.addEventListener('click', () => {
  playEfSound();
  wrap.classList.remove('showHow');
});

/* 게임오버에서 재시작 버튼 클릭 시 게임 리셋 */
retryBtn.addEventListener('click', () =>{
  playEfSound();
  wrap.classList.remove('startGame');
  resetGame();
});


/* BGM 버튼 토글 */
bgmBtn.on = () => {
  bgmBtn.classList.remove('off');
  bgmSound.play();
  bgmBtn.removeAttribute('data-bg');
};
bgmBtn.off = (set) => {
  bgmBtn.classList.add('off');
  bgmSound.pause();
  if (set) bgmBtn.setAttribute('data-bg', false);
};
bgmBtn.addEventListener('click', () => {
  if (bgmBtn.classList.contains('off')) bgmBtn.on();
  else bgmBtn.off(true);
});

// playBtn.addEventListener('click', () => {
//   if (spawning) {
//     setSpawning(false);
//     const elapsed = Date.now() - getLastSpawnTime();
//     setRemainingTime(spawnInterval - elapsed);
//     playBtn.classList.remove('off');
//   } else {
//     setSpawning(true);
//     // lastSpawnTime을 보정하여 일시정지 시간만큼 문 생성 시간을 뒤로 미룸
//     setLastSpawnTime(Date.now() - (spawnInterval - getRemainingTime()));
//     playBtn.classList.add('off');
//   };
// });
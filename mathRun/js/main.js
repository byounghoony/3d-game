import { resetGame, startGame } from "./game.js";
import { renderer } from "./scene.js";
import { overEvent, spawning, setSpawning, getLastSpawnTime, setRemainingTime, getRemainingTime, spawnInterval, setLastSpawnTime, bgmSound, playEfSound } from "./utils.js";

export const wrap = document.getElementById('app');

// 기본 UI 요소
export const startBtn = document.getElementById('js-startBtn');
export const howBtn = document.getElementById('js-howBtn');
export const closeHowBtn = document.getElementById('js-closeHowBtn');
export const mainContainer = document.getElementById('js-mainContainer');
export const gameOverContainer = document.getElementById('js-gameOverContainer');
export const finalScore = document.getElementById('js-finalScore');
export const retryBtn = document.getElementById('js-restartBtn');
export const playBtn = document.getElementById('js-playBtn');
export const bgmBtn = document.getElementById('js-bgmBtn');

export const bootContainer = document.getElementById('js-bootContainer');
export const bootLogo = document.getElementById('js-bootLogo');

overEvent(startBtn);
overEvent(howBtn);
overEvent(closeHowBtn);
overEvent(retryBtn);

/* boot 애니메이션 후 메인화면 전환 */
bootLogo.addEventListener('animationend', () => {
  bootContainer.classList.add('aniStart');
  mainContainer.classList.add('aniStart');
});

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
    mainContainer.classList.remove('aniStart');
    mainContainer.classList.add('opacity');
  };
});

retryBtn.addEventListener('click', () =>{
  playEfSound();
  wrap.classList.remove('startGame');
  resetGame();
});

howBtn.addEventListener('click', () => {
  playEfSound();
  wrap.classList.add('showHow');
});
closeHowBtn.addEventListener('click', () => {
  playEfSound();
  wrap.classList.remove('showHow');
});

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
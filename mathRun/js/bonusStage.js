import { startGame } from "./game.js";
import { renderLives, updateStageLabel } from "./ui.js";
import { addScore, clearTimers, currentStage, incrementCurrentStage, lives, moveToLane, overEvent, playEfSound, score, setLives, setSpawning, shuffle } from "./utils.js";

export const stageEndContainer = document.getElementById('js-stageEndContainer');
export const bonusStageBtn = document.getElementById('js-bonusStageBtn');

export const bonusStageContainer = document.getElementById('js-bonusStageContainer');

const bonusList = ['heart', 10, 30, 50, 100];

/* 스테이지 종료 및 보너스 스테이지 안내 */
export function pauseForStage() {
  moveToLane(1);
  setSpawning(false);
  clearTimers();
  stageEndContainer.classList.add('on');
  stageEndContainer.querySelector('div').querySelectorAll('span')[0].textContent = `${currentStage}단계`;
  stageEndContainer.querySelector('div').querySelectorAll('span')[1].textContent = score;
}; 

/* 보너스 스테이지 시작 */
function startBonusStage() {
  bonusStageContainer.classList.add('on');
  setTimeout(() => {
    stageEndContainer.classList.remove('on');
  }, 10);
  createBox();
};

/* 보너스 상자 생성 */
function createBox() {
  shuffle(bonusList);
  for (let i = 0; i < bonusList.length; i++) {
    const box = document.createElement('div');
    box.classList.add('box');
    const inner = document.createElement('div');
    inner.classList.add('inner');
    const light = document.createElement('div');
    light.classList.add('light');
    const bonus = document.createElement('div');
    bonus.classList.add('bonus');
    bonus.classList.add(bonusList[i] === 'heart' ? 'heart' : `score${bonusList[i]}`);
    const front = document.createElement('div');
    front.classList.add('front');
    const roof = document.createElement('div');
    roof.classList.add('roof');
    box.appendChild(inner);
    box.appendChild(light);
    box.appendChild(bonus);
    box.appendChild(front);
    box.appendChild(roof);
    bonusStageContainer.appendChild(box);
    overEvent(box);

    box.addEventListener('click', () => {
      playEfSound('box_open');
      box.classList.add('open'); 
      openBox(bonusList[i]); 
    });
  };
};

/* 보너스 상자 열기 */
function openBox(bonus) {
  bonusStageContainer.classList.add('opened');
  if (bonus === 'heart') {
    if (lives < 3){
      setLives(lives + 1);
      renderLives();
    };
  } else addScore(bonus);

  setTimeout(() => {
    bonusStageContainer.classList.remove('on');
    bonusStageContainer.classList.remove('opened');
    bonusStageContainer.innerHTML = '';
    incrementCurrentStage();
    updateStageLabel();
    startGame();
  }, 3000);
};

/* 보너스 스테이지 버튼 클릭 시 보너스 스테이지 시작 */
bonusStageBtn.addEventListener('click', () => {
  playEfSound();
  startBonusStage();
}); 
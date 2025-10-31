import { startGame } from "./game.js";
import { renderLives, updateStageLabel } from "./ui.js";
import { addScore, clearTimers, currentStage, incrementCurrentStage, lives, moveToLane, overEvent, score, setLives, setSpawning, shuffle } from "./utils.js";

export const stageEndContainer = document.getElementById('js-stageEndContainer');
export const bonusStageBtn = document.getElementById('js-bonusStageBtn');

export const bonusStageContainer = document.getElementById('js-bonusStageContainer');

overEvent(bonusStageBtn);

const bonusList = ['heart', 10, 30, 50, 100];

export function pauseForStage() {
  moveToLane(1);
  setSpawning(false);
  clearTimers();
  stageEndContainer.classList.add('on');
  stageEndContainer.querySelector('div').querySelectorAll('span')[0].textContent = `${currentStage}단계`;
  stageEndContainer.querySelector('div').querySelectorAll('span')[1].textContent = score;
}; // 보너스 스테이지

function startBonusStage() {
  stageEndContainer.classList.remove('on');
  bonusStageContainer.classList.add('on');
  createBox();
};

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
      box.classList.add('open'); 
      openBox(bonusList[i]); 
    });
  };
};

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

bonusStageBtn.addEventListener('click', () => {
  playEfSound();
  startBonusStage();
}); // 보너스 스테이지 시작 버튼
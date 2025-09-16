import { state } from './config.js';
import { startGame } from './game.js';
import { charge, hit } from './interaction.js';

// UI 요소 객체
export const ui = {
  p1Input: document.getElementById('p1'),
  p2Input: document.getElementById('p2'),
  startBtn: document.getElementById('startBtn'),
  turnDiv: document.getElementById('turn'),
  infoDiv: document.getElementById('info'),
  scoreDiv: document.getElementById('score'),
  chargeBtn: document.getElementById('chargeBtn'),
  hitBtn: document.getElementById('hitBtn'),
  winnerDiv: document.getElementById('winner'),
  chargeBarContainer: document.getElementById('chargeBarContainer'),
  chargeBar: document.getElementById('chargeBar'),
};

// UI 이벤트 리스너 초기화
export function initUI() {
  [ui.p1Input, ui.p2Input].forEach(input => {
    input.addEventListener('input', () => {
      ui.startBtn.disabled = !(ui.p1Input.value && ui.p2Input.value);
    });
  });

  ui.startBtn.addEventListener('click', startGame);
  ui.chargeBtn.addEventListener('click', charge);
  ui.hitBtn.addEventListener('click', hit);
};

// 턴, 정보, 점수 UI 업데이트
export function updateTurnUI() {
  if (!state.players[state.turn]) return;
  ui.turnDiv.textContent = `턴: ${state.players[state.turn].name}`;
  ui.infoDiv.textContent = `${state.players[0].name}: ${state.players[0].stones.length}개 남음 / ${state.players[1].name}: ${state.players[1].stones.length}개 남음`;
  ui.scoreDiv.textContent = `점수: ${state.players[0].name} ${state.scores[0]}점 / ${state.players[1].name} ${state.scores[1]}점`;
};

// 게이지 바 위치 업데이트
export function updateChargeBarPosition() {
  if (state.charging && state.selectedStone) {
    const screenPosition = state.selectedStone.mesh.position.clone();
    screenPosition.project(state.camera);

    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

    ui.chargeBarContainer.style.left = `${x - ui.chargeBarContainer.offsetWidth / 2}px`;
    ui.chargeBarContainer.style.top = `${y + 30}px`;
  };
};
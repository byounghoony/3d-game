import { currentStage, laneIndex, lives, moveToLane, r } from "./utils.js";

/* UI 관련 요소들 */
export const leftBtn = document.getElementById('js-leftBtn');
export const rightBtn = document.getElementById('js-rightBtn');
export const scoreVal = document.getElementById('js-scoreVal');
export const livesEl = document.getElementById('js-lives').querySelectorAll('span');
export const stageLabel = document.getElementById('js-stageLabel');

/* 좌우 이동 버튼 이벤트 */
leftBtn.addEventListener('click', () => moveToLane(laneIndex - 1, true));
rightBtn.addEventListener('click', () => moveToLane(laneIndex + 1, true));
leftBtn.addEventListener('mousedown', () => leftBtn.classList.add('hover'));
leftBtn.addEventListener('touchstart', () => leftBtn.classList.add('hover'));
rightBtn.addEventListener('mousedown', () => rightBtn.classList.add('hover'));
rightBtn.addEventListener('touchstart', () => rightBtn.classList.add('hover'));

document.addEventListener('mouseup', () => {
  leftBtn.classList.remove('hover');
  rightBtn.classList.remove('hover')
});
document.addEventListener('touchend', () => {
  leftBtn.classList.remove('hover');
  rightBtn.classList.remove('hover')
});

window.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft') {
    leftBtn.classList.add('hover');
    moveToLane(laneIndex - 1, true);
  };
  if(e.key === 'ArrowRight') {
    rightBtn.classList.add('hover');
    moveToLane(laneIndex + 1, true);
  };
});

window.addEventListener('keyup', e => {
  if(e.key === 'ArrowLeft') leftBtn.classList.remove('hover');
  if(e.key === 'ArrowRight') rightBtn.classList.remove('hover');
});

/* 단계별 문제 정의 */
export const stageDefs = [
  { label:'한 자리 수 덧셈', gen:()=>{ const a = r(1,9), b = r(1, 9); return { q:`${a}+${b}`, ans:a+b }; } },
  { label:'한 자리 수 뺄셈', gen:()=>{ const a = r(1,9), b = r(1, a); return { q:`${a}-${b}`, ans:a-b }; } },
  { label:'두 자리 수 + 한 자리 수', gen:()=>{ const a = r(10, 99), b = r(1, 9); return { q:`${a}+${b}`, ans:a+b }; } },
  { label:'두 자리 수 - 한 자리 수', gen:()=>{ const a = r(10, 99), b = r(1, 9); return { q:`${a}-${b}`, ans:a-b }; } },
  { label:'한 자리 수 곱셈', gen:()=>{ const a = r(1, 9), b = r(1, 9); return { q:`${a}×${b}`, ans:a*b }; } },
  { label:'한 자리 수 나눗셈', gen:()=>{ const b = r(1, 9), a = b * r(1, 9); return { q:`${a}÷${b}`, ans:a/b }; } },
  { label:'(몇십)×(몇)', gen:()=>{ const a = r(1, 9) * 10, b = r(2, 9); return { q:`${a}×${b}`, ans:a*b }; } },
  { label:'두 자리 수 ÷ 한 자리 수', gen:()=>{ const b = r(2, 9), a = b * r(2, 9); return { q:`${a}÷${b}`, ans:a/b }; } },
  { label:'올림 없는 (몇십몇)×(몇)', gen:()=>{ const b = r(2, 4); const a = r(10, 99 / b) * b; return { q:`${a}×${b}`, ans:a*b }; } },
  { label:'세 자리 수 ÷ 한 자리 수', gen:()=>{ const b = r(2, 9), a = b * r(10, 99); return { q:`${a}÷${b}`, ans:a/b }; } },
];

/* 목숨 표시 업데이트 */
export function renderLives(){
  livesEl.forEach((span, idx) => {
    span.classList.remove('off');
    if(idx >= lives) span.classList.add('off');
  });
};

/* 단계 표시 업데이트 */
export function updateStageLabel(){
  const stageLabelSpan = stageLabel.querySelectorAll('span');
  stageLabelSpan[0].textContent = currentStage + '단계';
  stageLabelSpan[1].textContent = stageDefs[currentStage - 1].label;
};
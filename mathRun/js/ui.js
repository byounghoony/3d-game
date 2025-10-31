import { currentStage, laneIndex, lives, moveToLane, overEvent, r } from "./utils.js";

export const leftBtn = document.getElementById('js-leftBtn');
export const rightBtn = document.getElementById('js-rightBtn');
export const scoreVal = document.getElementById('js-scoreVal');
export const livesEl = document.getElementById('js-lives').querySelectorAll('span');
export const stageLabel = document.getElementById('js-stageLabel');

overEvent(leftBtn);
overEvent(rightBtn);

leftBtn.addEventListener('click', () => moveToLane(laneIndex - 1, true));
rightBtn.addEventListener('click', () => moveToLane(laneIndex + 1, true));
window.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft') moveToLane(laneIndex - 1, true);
  if(e.key === 'ArrowRight') moveToLane(laneIndex + 1, true);
});

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

export function renderLives(){
  livesEl.forEach((span, idx) => {
    span.classList.remove('off');
    if(idx >= lives) span.classList.add('off');
  });
};

export function updateStageLabel(){
  const stageLabelSpan = stageLabel.querySelectorAll('span');
  stageLabelSpan[0].textContent = currentStage + '단계';
  stageLabelSpan[1].textContent = stageDefs[currentStage-1].label;
};
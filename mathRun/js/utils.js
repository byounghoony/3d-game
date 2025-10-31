import { animalModel } from "./model.js"; 
import { scoreVal } from "./ui.js";

export let score = 0, lives = 3, currentStage = 1, questionNumber = 1;
export const spawnInterval = 3200;
export let lastSpawnTime = 0;
export let remainingTime = 0;

export let spawning = false, spawnTimer = null, resumeTimer = null, isRouletteActive = false, laneIndex = 1, isEndGame = false;

export const effectSound = new Audio();
effectSound.isPlayed = false;

export const bgmSound = new Audio();
bgmSound.isPlayed = false;
bgmSound.loop = true;

// 레인 X축 좌표
export const laneX = [-2, 0, 2];

// 상태 변경 함수들
export function setScore(newScore) { score = newScore; }
export function addScore(points) { 
  score += points;
  scoreVal.textContent = score;
}
export function removeScore(points) { score -= points; }
export function setLives(newLives) { lives = newLives; }
export function decreaseLives() { lives--; }
export function setCurrentStage(newStage) { currentStage = newStage; }
export function incrementCurrentStage() { currentStage++; }
export function setQuestionNumber(newNumber) { questionNumber = newNumber; }
export function incrementQuestionNumber() { questionNumber++; }
export function setSpawning(value) { spawning = value; }
export function setResumeTimer(timer) { resumeTimer = timer; }
export function getResumeTimer() { return resumeTimer; }
export function setLastSpawnTime(time) { lastSpawnTime = time; }
export function getLastSpawnTime() { return lastSpawnTime; }
export function setRemainingTime(time) { remainingTime = time; }
export function getRemainingTime() { return remainingTime; }
export function setLaneIndex(index) { laneIndex = index; }
export function setIsEndGame(value) { isEndGame = value; }
export function clearTimers() {
  clearInterval(spawnTimer);
  clearTimeout(resumeTimer);
};

export const playEfSound = (name = 'button') => {
  effectSound.src = `./media/${name}.mp3`;
  effectSound.load();
  effectSound.onloadedmetadata = () => effectSound.play();
};

function playedSound(audio) {
  if (!audio.isPlayed) {
    audio.src = `./media/mute.mp3`;
    audio.play();
    audio.isPlayed = true;

    window.removeEventListener('mousedown', addSound);
    window.removeEventListener('touchstart', addSound);

    bgmSound.src = `./media/bgm.mp3`;
    bgmSound.load();
  };
};
window.addEventListener('mousedown', addSound);
window.addEventListener('touchstart', addSound);

function addSound() {
  [bgmSound, effectSound].forEach(playedSound);
};

export function resetGameStatus() {
  score = 0;
  lives = 3;
  currentStage = 1;
  questionNumber = 1;
  isEndGame = false;
};

export function moveToLane(i, controlled) {
  if (controlled && !spawning) return;

  laneIndex = Math.max(0, Math.min(2, i));
  if (animalModel) animalModel.position.x = laneX[laneIndex];
};

export function r(a,b) { 
  return Math.floor( Math.random() * (b - a + 1)) + a; 
};

export function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  };
  return a;
};

export function overEvent(target){
  target.addEventListener('mouseover', () => target.classList.add('hover'));
  target.addEventListener('mouseout', () => target.classList.remove('hover'));
};
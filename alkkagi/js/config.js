import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export const boardSize = 18;
export const halfSize = (boardSize - 1) / 2;
export const stoneRadius = 0.3;

export const state = {
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  stones: [], // Stone 인스턴스의 배열
  selectedStone: null, // Stone 인스턴스
  players: [],
  knockedOutOpponentStoneThisTurn: false,
  turn: 0,
  chargePower: 0,
  charging: false,
  isTurnPlaying: false,
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  miniRenderer: null,
  miniCamera: null,
  tween: null,
  arrowHelper: null,
  controls: null,
  scores: [0, 0],
  lastTime: undefined,
};
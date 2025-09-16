import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { state, halfSize } from './config.js';
import { Stone } from './Stone.js';
import { ui, updateTurnUI } from './ui.js';
import { selectStone } from './interaction.js';

export function startGame() {
  state.players = [
    { name: ui.p1Input.value || 'Player 1', color: 0x000000, stones: [] },
    { name: ui.p2Input.value || 'Player 2', color: 0xffffff, stones: [] }
  ];
  ui.startBtn.disabled = true;
  ui.p1Input.disabled = true;
  ui.p2Input.disabled = true;
  createStones();
  updateTurnUI();
  ui.chargeBtn.disabled = false;
};

function createStones() {
  const stoneMat = new CANNON.Material('stoneMat');
  const groundMaterial = state.world.bodies.find(b => b.material && b.material.name === 'groundMat').material;

  state.world.addContactMaterial(new CANNON.ContactMaterial(stoneMat, groundMaterial, { friction: 0.01, restitution: 0.1 }));
  state.world.addContactMaterial(new CANNON.ContactMaterial(stoneMat, stoneMat, { friction: 0.01, restitution: 1 }));

  const count = 8, spacing = 1.9;
  const startPositions = [{ xStart: -halfSize + 1, playerIndex: 0 }, { xStart: halfSize - 1, playerIndex: 1 }];

  startPositions.forEach(p => {
    for (let i = 0; i < count; i++) {
      const x = p.xStart;
      const z = (i - (count - 1) / 2) * spacing;
      const stone = new Stone(p.playerIndex, { x, y: 0.1, z }, stoneMat);

      state.scene.add(stone.mesh);
      state.world.addBody(stone.body);

      state.stones.push(stone);
      state.players[p.playerIndex].stones.push(stone);
    };
  });
};

export function removeStone(stone) {
  const owner = stone.playerIndex;
  if (owner !== state.turn) {
    state.scores[state.turn] += 1;
    state.knockedOutOpponentStoneThisTurn = true;
  };

  state.world.removeBody(stone.body);
  state.scene.remove(stone.mesh);

  state.players[owner].stones = state.players[owner].stones.filter(s => s !== stone);
  const stoneIndex = state.stones.indexOf(stone);
  if (stoneIndex > -1) {
    state.stones.splice(stoneIndex, 1);
  };
  updateTurnUI();
};

export function endTurn() {
  if (state.players[0].stones.length === 0 || state.players[1].stones.length === 0) {
    const winner = state.players[0].stones.length === 0 ? state.players[1] : state.players[0];
    ui.winnerDiv.textContent = `${winner.name} 승리!`;
    ui.winnerDiv.style.display = 'block';
    ui.chargeBtn.disabled = true;
    return;
  };

  if (!state.knockedOutOpponentStoneThisTurn) {
    state.turn = 1 - state.turn;
  };

  // 다음 턴의 플레이어 돌 중 하나를 무작위로 선택
  const nextPlayerStones = state.players[state.turn].stones;
  if (nextPlayerStones.length > 0) {
    const randomStone = nextPlayerStones[Math.floor(Math.random() * nextPlayerStones.length)];
    selectStone(randomStone);
  }
  updateTurnUI();
  ui.chargeBtn.disabled = false;
};
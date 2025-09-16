import { update as TWEENUpdate } from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { state, boardSize } from './js/config.js';
import { setup } from './js/setup.js';
import { initUI, updateChargeBarPosition } from './js/ui.js';
import { removeStone, endTurn } from './js/game.js';
import { updateArrowHelper } from './js/interaction.js';

function init() {
  setup();
  initUI();
  animate();
};

function animate(time) {
  requestAnimationFrame(animate);

  // 물리 엔진 업데이트
  if (state.lastTime !== undefined) {
    let dt = (time - state.lastTime) / 1000;
    dt = Math.min(dt, 0.1); // 프레임 드랍 시 시뮬레이션 안정성 확보
    state.world.step(1 / 360, dt, 10);
  };
  state.lastTime = time;

  // 돌 상태 업데이트 (위치, 제거 등)
  updateStones();

  // 턴 종료 조건 확인
  if (state.isTurnPlaying && state.stones.every(s => !s || s.body.velocity.lengthSquared() < 0.001)) {
    state.isTurnPlaying = false;
    endTurn();
  };

  // UI 업데이트
  if (state.selectedStone && !state.isTurnPlaying) {
    updateArrowHelper();
  } else {
    state.arrowHelper.visible = false;
  };

  if (state.charging) {
    updateChargeBarPosition();
  };

  // 렌더링
  TWEENUpdate(time);
  state.controls.update();
  state.renderer.render(state.scene, state.camera);
  state.miniRenderer.render(state.scene, state.miniCamera);
};

function updateStones() {
  for (let i = state.stones.length - 1; i >= 0; i--) {
    const stone = state.stones[i];
    if (!stone) continue;

    stone.update();

    const boardHalfSize = boardSize / 2 + 0.15;
    if (stone.isOutOfBoard(boardHalfSize)) {
      const pos = Math.abs(stone.body.position.x) > boardHalfSize ? 'x' : 'z';
      stone.fall(pos);
    };

    // 떨어지는 돌에 중력 효과 적용
    if (stone.littleFalling) {
      stone.body.applyForce(new CANNON.Vec3(0, -20, 0), stone.body.position);
    };
      
    if (stone.body.position.y < -0.8) {
      removeStone(stone);
    };
  };
};

init();
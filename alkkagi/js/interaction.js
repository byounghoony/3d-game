import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { Tween, Easing } from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { state } from './config.js';
import { ui } from './ui.js';

export function onPointerDown(event) {
  if (!state.players[state.turn] || state.isTurnPlaying) return;

  state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  state.raycaster.setFromCamera(state.mouse, state.camera);

  const validStoneMeshes = state.players[state.turn].stones.map(s => s.mesh);
  if (validStoneMeshes.length === 0) return;

  const intersects = state.raycaster.intersectObjects(validStoneMeshes);
  if (intersects.length > 0) {
    if (state.selectedStone) {
      state.selectedStone.mesh.material.emissive.setHex(0x000000);
    };
    // userData에 저장된 Stone 인스턴스를 가져옵니다.
    const stone = intersects[0].object.userData.stone;
    selectStone(stone);
  };
};

export function selectStone(stone) {
  if (state.selectedStone) {
    state.selectedStone.mesh.material.emissive.setHex(0x000000);
  };
  state.selectedStone = stone;
  if (state.selectedStone) {
    state.selectedStone.mesh.material.emissive.setHex(0x00ff00);
    // 카메라 부드럽게 이동
    const xPos = state.selectedStone.playerIndex === 0 ? -5 : 5; // 플레이어에 따라 카메라 z 위치 변경
    const pos = state.selectedStone.mesh.position.clone();
    new Tween(state.camera.position)
      .to({ x: pos.x + xPos, y: pos.y + 2, z: pos.z }, 500) // zPos를 적용
      .easing(Easing.Cubic.Out).start();
    new Tween(state.controls.target).to({ x: pos.x, y: pos.y, z: pos.z }, 500).easing(Easing.Cubic.Out).start();
  };
};

export function charge() {
  if (!state.selectedStone || state.charging) return;

  state.charging = true;
  state.chargePower = 0;
  ui.chargeBarContainer.style.display = 'block';

  const obj = { val: 0 };
  state.tween = new Tween(obj)
    .to({ val: 1 }, 500)
    .easing(Easing.Linear.None)
    .yoyo(true)
    .repeat(Infinity)
    .onUpdate(() => {
      state.chargePower = obj.val;
      ui.chargeBar.style.width = `${state.chargePower * 100}%`;
    })
    .start();

  ui.hitBtn.disabled = false;
};

export function hit() {
  if (!state.selectedStone || !state.charging) return;

  state.charging = false;
  if (state.tween) state.tween.stop();
  ui.hitBtn.disabled = true;
  ui.chargeBarContainer.style.display = 'none';
  state.selectedStone.mesh.material.emissive.setHex(0x000);

  state.knockedOutOpponentStoneThisTurn = false;
  const body = state.selectedStone.body;

  const dir = new THREE.Vector3();
  state.camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();

  const force = 60 * state.chargePower;
  body.applyImpulse(new CANNON.Vec3(dir.x * force, 0, dir.z * force), body.position);

  state.selectedStone = null;
  state.isTurnPlaying = true;
  ui.chargeBtn.disabled = true;
};

export function updateArrowHelper() {
  const dir = new THREE.Vector3().subVectors(state.controls.target, state.camera.position);
  dir.y = 0;
  dir.normalize();

  state.arrowHelper.position.copy(state.selectedStone.mesh.position);
  state.arrowHelper.setDirection(dir);
  state.arrowHelper.visible = true;
};
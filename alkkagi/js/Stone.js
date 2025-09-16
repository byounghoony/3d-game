import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { state, stoneRadius } from './config.js';

export class Stone {
  constructor(playerIndex, position, stoneMaterial) {
    this.playerIndex = playerIndex;
    const { color } = state.players[playerIndex];
    // this.isFalling = false;

    // Three.js Mesh
    const geo = new THREE.SphereGeometry(stoneRadius, 32, 32);
    geo.scale(1, 0.4, 1);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1, emissive: 0x000 }));
    this.mesh.position.copy(position);

    // Cannon-es Body
    const bodyShape = new CANNON.Cylinder(stoneRadius, stoneRadius, stoneRadius * 0.4, 16);
    this.body = new CANNON.Body({
      mass: 0.8,
      shape: bodyShape,
      position: new CANNON.Vec3().copy(position),
      material: stoneMaterial,
      linearDamping: 0.99,
      angularDamping: 1
    });

    this.body.linearFactor.set(1, 0, 1);
    this.body.angularFactor.set(0, 0, 0);
    this.body.ccdSpeedThreshold = 5;
    this.body.ccdSweptSphereRadius = stoneRadius;

    // 데이터 연결
    this.mesh.userData.stone = this; // Mesh에서 Stone 인스턴스에 접근
    this.body.userData = {stone: this};
  };

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  };

  isOutOfBoard(boardHalfSize) {
    return Math.abs(this.body.position.x) > boardHalfSize || Math.abs(this.body.position.z) > boardHalfSize;
  };

  fall(pos) {
    this.body.linearFactor.set(1, 1, 1);
    this.body.angularFactor.set(1, 1, 1);
    this.body.velocity.y = -2;

    this.littleFalling = Math.abs(this.body.velocity[pos]) < 0.5;
    // this.body.velocity[pos] = Math.abs(this.body.velocity[pos]) < 0.5 ? (this.body.position[pos] > 0 ? 0.5 : -0.5) : this.body.velocity[pos]; // 바깥쪽으로 밀어내기
  };
};
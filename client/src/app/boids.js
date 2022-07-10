// "use strict";
// Class for controlling individual cards (boids)
import * as THREE from "three";
import { randomNumber } from "./utils";
import TWEEN, { Group } from "@tweenjs/tween.js";

const defaultParams = {
  sizing: { x: 20, y: 20, z: 0.1 },
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0.01, y: 0.01, z: 0.01 },
  acceleration: { x: 0.01, y: 0, z: 0 },
  rotation: { x: 1, y: 1, z: 1 },
  direction: { x: 1, y: 1, z: 1 },
  maxSpeed: 0.1,
  maxForce: 0.1,
  radius: 0.1,
  suit: "HEART",
  pip: "2",
};

const txtLoader = new THREE.TextureLoader();
const colorLight = new THREE.Color(0xffffff);
let faceDownTexture = txtLoader.load("/cards/RED_BACK.svg");
let darkMaterial = new THREE.MeshPhongMaterial({
  transparent: true,
  opacity: 0,
});
let faceDownMaterial = new THREE.MeshPhongMaterial({
  transparent: true,
  map: faceDownTexture,
  shininess: 40,
});

export class Boid extends THREE.Object3D {
  /**
   * @param scene THREEJS.Scene
   * @param params Object?
   */
  constructor(scene, params) {
    super();
    this.scene = scene;
    this.params = { ...defaultParams, ...params };
    let faceUpTexture = txtLoader.load(
      `/cards/${this.params.suit}-${this.params.pip}.svg`
    );

    this.name = `${this.params.suit}-${this.params.pip}`;

    let faceUpMaterial = new THREE.MeshPhongMaterial({
      color: colorLight,
      map: faceUpTexture,
      transparent: true,
      shininess: 40,
    });
    this.position.set(
      this.params.position.x,
      this.params.position.y,
      this.params.position.z
    );

    this.rotation.set(
      this.params.rotation.x,
      this.params.rotation.y,
      this.params.rotation.z
    );
    this.direction = new THREE.Vector3(
      this.params.direction.x,
      this.params.direction.y,
      this.params.direction.z
    );
    this.velocity = new THREE.Vector3(
      this.params.velocity.x,
      this.params.velocity.y,
      this.params.velocity.z
    );
    this.acceleration = new THREE.Vector3(
      this.params.acceleration.x,
      this.params.acceleration.y,
      this.params.acceleration.z
    );
    this.mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(
        this.params.sizing.x,
        this.params.sizing.y,
        this.params.sizing.z
      ),
      [
        darkMaterial,
        darkMaterial,
        darkMaterial,
        darkMaterial,
        faceUpMaterial,
        faceDownMaterial,
      ]
    );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.scale.x = 0.65;
    this.mesh.castShadow = true;
    // this.mesh.rotation.x -= 90;

    // Group
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.position.set(...this.position);

    this.uuid = this.mesh.uuid;
    // this.group.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.scene.add(this.group);
  }

  applyWander() {
    const direction = this.direction;
    const m = new THREE.Matrix4();
    m.lookAt(new THREE.Vector3(0, 0, 0), direction, new THREE.Vector3(0, 1, 0));
    this.group.quaternion.setFromRotationMatrix(m);
    this.velocity.add(this.acceleration);
    this.group.position.add(this.velocity);
    this.acceleration = new THREE.Vector3(0, 0, 0);
  }

  lookAt(target) {
    this.group.lookAt(target);
  }

  setFaceValue(suit, pip) {
    this.name = `${suit}-${pip}`;
    let faceUpTexture = txtLoader.load(`/cards/${suit}-${pip}.svg`);
    let faceUpMaterial = new THREE.MeshPhongMaterial({
      color: colorLight,
      map: faceUpTexture,
      transparent: true,
      shininess: 40,
    });
    this.mesh.material = [
      darkMaterial,
      darkMaterial,
      darkMaterial,
      darkMaterial,
      faceUpMaterial,
      faceDownMaterial,
    ];

    this.mesh.material.needsUpdate = true;
  }

  moveTo(target, duration, facingDirection, callback) {
    if (this.tween) this.tween.stop();
    this.tween = new TWEEN.Tween(this.group.position)
      .to(target, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        // if (facingDirection) {
        //   this.lookTo(facingDirection, 10000);
        // }
        if (callback) callback();
        this.tween = null;
      })
      .start();
    if (facingDirection) {
      this.lookAway(facingDirection, duration, target);
    }
  }

  lookAwayFrom(object, target) {
    let v = new THREE.Vector3();
    v.subVectors(object.position, target).add(object.position);
    object.lookAt(v);
  }

  tweenRotation(newRotation, durationMs) {
    new TWEEN.Tween(this.group.rotation)
      .to(
        {
          x: newRotation.x,
          y: newRotation.y,
          z: newRotation.z,
        },
        durationMs
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }

  lookTo(target, durationMs, fromPosition = null) {
    const groupCopy = this.group.clone();
    if (fromPosition) {
      groupCopy.position.set(fromPosition.x, fromPosition.y, fromPosition.z);
    }
    groupCopy.lookAt(target);

    this.tweenRotation(groupCopy.rotation, durationMs);
  }

  lookAway(target, durationMs, fromPosition = null) {
    const groupCopy = this.group.clone();
    if (fromPosition) {
      groupCopy.position.set(fromPosition.x, fromPosition.y, fromPosition.z);
    }
    this.lookAwayFrom(groupCopy, target);

    this.tweenRotation(groupCopy.rotation, durationMs);
  }

  step(time) {
    // this.applyWander();
    // this.mesh.rotation.y += 0.01;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.z += 0.01;
    // this.group.position.x += 0.1;
    // this.group.position.x += randomNumber(
    //   -this.params.velocity.x,
    //   this.params.velocity.x
    // );
    // this.group.position.y += randomNumber(
    //   -this.params.velocity.y,
    //   this.params.velocity.y
    // );
    // this.group.position.z += randomNumber(
    //   -this.params.velocity.z,
    //   this.params.velocity.z
    // );
  }
}

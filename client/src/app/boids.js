import * as THREE from "three";

const defaultParams = {
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  acceleration: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
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

let pips = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11-JACK",
  "12-QUEEN",
  "13-KING",
];
let suits = ["CLUB", "HEART", "SPADE", "DIAMOND"];

export class Boid {
  /**
   * @param scene THREEJS.Scene
   * @param params Object?
   */
  constructor(scene, params) {
    this.scene = scene;
    this.params = { ...defaultParams, ...params };
    console.log(this.params);
    let faceUpTexture = txtLoader.load(
      `/cards/${this.params.suit}-${this.params.pip}.svg`
    );

    let faceUpMaterial = new THREE.MeshPhongMaterial({
      color: colorLight,
      map: faceUpTexture,
      transparent: true,
      shininess: 40,
    });

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 0.01), [
      darkMaterial,
      darkMaterial,
      darkMaterial,
      darkMaterial,
      faceUpMaterial,
      faceDownMaterial,
    ]);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.scale.x = 0.65;
    this.mesh.castShadow = true;
    // this.mesh.rotation.x -= 90;
    this.mesh.position.x = Math.random() * 4 - 2;
    this.mesh.position.y = Math.random() * 4 - 5;
    this.mesh.position.z = Math.random() * 4 - 1;
    // Group
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.position.set(
      this.params.position.x,
      this.params.position.y,
      this.params.position.z
    );
    this.group.rotation.set(
      this.params.rotation.x,
      this.params.rotation.y,
      this.params.rotation.z
    );
    this.scene.add(this.group);
  }
}

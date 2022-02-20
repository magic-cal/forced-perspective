import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import io from "socket.io-client";
import { Boid } from "./boids";

let camera, scene, renderer, orbitControls;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let cameraPosition;
let cameraRotation;
const socket = io("https://localhost:80", { secure: true });

const targets = { sphere: [] };
const cardSizing = { x: 20, y: 20, z: 0.1 };

socket.on("camera-update", (msg) => {
  let pos = msg.pos;
  let rot = msg.rot;
  camera.position.set(pos.x, pos.y, pos.z);
  camera.rotation.set(rot.x, rot.y, rot.z, rot.order);

  // Make sure event is not fired again
  cameraRotation = {
    x: camera.rotation.x,
    y: camera.rotation.y,
    z: camera.rotation.z,
    order: camera.rotation.order,
  };
  cameraPosition = Object.assign({}, camera.position);
});

// let scene;

let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();

const clock = new THREE.Clock();
const cards = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x505050);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 0, 50);
  camera.zoom = 0.1;
  cameraPosition = Object.assign({}, camera.position);

  // scene = new THREE.LineSegments(
  //   new BoxLineGeometry(6, 6, 6, 10, 10, 10),
  //   new THREE.LineBasicMaterial({ color: 0x808080 })
  // );
  // scene.geometry.translate(0, 3, 0);
  // scene.add(scene);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const colorLight = new THREE.Color(0xffffff);

  const txtLoader = new THREE.TextureLoader();
  let card;

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
    "11",
    "12",
    "13",
  ];
  let suits = ["C", "H", "S", "D"];
  let i = 0;
  for (const pip of pips) {
    for (const suit of suits) {
      i++;

      // card.position.x =
      // card.position.y =
      // card.position.z =

      const position = {
        x: Math.random() * 10 - 5,
        y: Math.random() * 5 - 5,
        z: Math.random() * 4 - 10,
      };

      // card.position.x = 0.09 * i;
      // card.position.y = 0;
      // card.position.z = 0.05 * i;

      const boid = new Boid(scene, { position, suit, pip });

      boid.lookAt(camera.position);
      cards.push(boid);
    }
  }

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  orbitControls = new OrbitControls(camera, renderer.domElement);

  //

  // if ('xr' in navigator  &&navigator.xr?.isSessionSupported("immersive-vr")) {
  //   console.log("XR supported");
  //   document.body.appendChild(VRButton.createButton(renderer));
  // }
  // controllers

  function onSelectStart() {
    this.userData.isSelecting = true;
  }

  function onSelectEnd() {
    this.userData.isSelecting = false;
  }

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controller1.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller1.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller2.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  scene.add(controller2);

  // The XRControllerModelFactory will automatically fetch controller models
  // that match what the user is holding as closely as possible. The models
  // should be attached to the object returned from getControllerGrip in
  // order to match the orientation of the held device.

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  //

  window.addEventListener("resize", onWindowResize);
}

function buildController(data) {
  let geometry, material;

  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Line(geometry, material);

    case "gaze":
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
      });
      return new THREE.Mesh(geometry, material);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  orbitControls.update();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleController(controller) {
  if (controller.userData.isSelecting) {
    const object = scene.children[count++];

    object.position.copy(controller.position);
    object.userData.velocity.x = (Math.random() - 0.5) * 3;
    object.userData.velocity.y = (Math.random() - 0.5) * 3;
    object.userData.velocity.z = Math.random() - 9;
    object.userData.velocity.applyQuaternion(controller.quaternion);

    if (count === scene.children.length) count = 0;
  }
}

function setCardsSphere() {
  for (let i = 0, l = cards.length; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;
    // const object = new THREE.Object3D();
    const newPosition = new THREE.Vector3();
    const object = cards[i];

    object.moveTo(
      newPosition.setFromSphericalCoords(50, phi, theta),
      2000,
      camera.position
    );
    // object.moveTo(newPosition.setFromSphericalCoords(3, phi, theta), 2000);
    // object.lookAt(camera.position);
    // lookAwayFrom(object, camera);
    // targets.sphere.push(object);
  }
}

function setCardsHelix() {
  for (let i = 0, l = cards.length; i < l; i++) {
    const theta = i * 0.119 + Math.PI;
    const y = 0;

    const object = cards[i];

    object.moveTo(
      object.position.setFromCylindricalCoords(50, theta, y),
      5000,
      camera.position
    );

    // vector.x = object.position.x * 2;
    // vector.y = object.position.y;
    // vector.z = object.position.z * 2;

    // object.lookAt(camera.position);

    // targets.helix.push(object);
  }
}

function setCardDeck(duration) {
  setCardGrid(undefined, 0.06, 1, duration);
}

function setCardRise(duration = 10000, cardName) {
  setCardGrid(undefined, 0.06, 1, duration);
  const card = cards.find((card) => card.name === cardName);
  console.log({ card });
  card.moveTo(
    card.group.position.clone().add(new THREE.Vector3(0, 10, 0)),
    duration
  );
}

function setCardGrid(
  cardWidthOffset = 15,
  cardZOffset = 13,
  cardsPerRow = 4,
  duration = 1000
) {
  const positionSkew = cardsPerRow / 2 - 0.5;

  for (let i = 0; i < cards.length; i++) {
    const object = cards[i];
    let newPosition = new THREE.Vector3();

    newPosition = newPosition.set(
      (i % cardsPerRow) * cardWidthOffset - positionSkew * cardWidthOffset,
      0,
      -Math.floor(i / cardsPerRow) * cardZOffset
    );

    // console.log({ newPosition });
    const lookAtPosition = newPosition
      .clone()
      .add(new THREE.Vector3(0, 0, 1000));
    object.moveTo(newPosition, duration, lookAtPosition);
  }
}

function lookAwayFrom(object, target) {
  var v = new THREE.Vector3();
  v.subVectors(object.position, target.position).add(object.position);
  object.lookAt(v);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function cameraMapping() {
  if (
    cameraPosition.x != camera.position.x ||
    cameraPosition.y != camera.position.y ||
    cameraPosition.z != camera.position.z ||
    cameraRotation.x != camera.rotation.x ||
    cameraRotation.y != camera.rotation.y ||
    cameraRotation.z != camera.rotation.z
  ) {
    cameraPosition = Object.assign({}, camera.position);
    cameraRotation = {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
      order: camera.rotation.order,
    };

    socket.emit("camera-changed", {
      pos: cameraPosition,
      rot: cameraRotation,
    });
  }
}

function render() {
  handleController(controller1);
  handleController(controller2);
  cameraMapping();
  TWEEN.update();

  renderer.render(scene, camera);
}

function transform(targets, duration) {
  TWEEN.removeAll();

  for (let i = 0; i < cards.length; i++) {
    const object = cards[i];
    const target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start();
}
// table sphere helix grid

document
  .getElementById("table")
  .addEventListener("click", () => setCardDeck(1000));
document.getElementById("sphere").addEventListener("click", setCardsSphere);
document.getElementById("helix").addEventListener("click", setCardsHelix);
document
  .getElementById("grid")
  .addEventListener("click", () => setCardGrid(undefined));
// setCardGrid(undefined, 0.01);
// setCardDeck(1000);
setCardsSphere();

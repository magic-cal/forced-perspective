import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import io from "socket.io-client";

let camera, scene, renderer, orbitControls;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let cameraPosition;
let cameraRotation;
const socket = io("https://192.168.1.19:80", { secure: true });

const targets = { sphere: [] };

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
    100
  );
  camera.position.set(0, 1.6, 3);
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

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const colorDark = new THREE.Color(0xb0b0b0);
  const colorLight = new THREE.Color(0xffffff);

  const material = new THREE.MeshPhongMaterial({
    opacity: 0.5,
    transparent: true,
  });

  const txtLoader = new THREE.TextureLoader();
  let card;

  let faceDownTexture = txtLoader.load("/cards/RED_BACK.svg");
  // faceUpTexture.flipY = false;
  let darkMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0,
  });

  let transparent = new THREE.MeshPhongMaterial({
    // transparent: true,
    opacity: 0,
  });

  let faceDownMaterial = new THREE.MeshPhongMaterial({
    // color: colorDark,
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
  let i = 0;
  for (const pip of pips) {
    for (const suit of suits) {
      i++;
      let faceUpTexture = txtLoader.load(`/cards/${suit}-${pip}.svg`);

      let faceUpMaterial = new THREE.MeshPhongMaterial({
        color: colorLight,
        map: faceUpTexture,
        transparent: true,
        shininess: 40,
      });

      card = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 0.01), [
        darkMaterial,
        darkMaterial,
        darkMaterial,
        darkMaterial,
        faceUpMaterial,
        faceDownMaterial,
      ]);
      card.scale.x = 0.65;
      card.castShadow = true;
      // card.rotation.x -= 90;
      card.position.x = Math.random() * 4 - 2;
      card.position.y = Math.random() * 4 - 5;
      card.position.z = Math.random() * 4 - 1;

      // card.position.x = 0.09 * i;
      // card.position.y = 0;
      // card.position.z = 0.05 * i;

      card.lookAt(camera.position);
      cards.push(card);
      scene.add(card);
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

  document.body.appendChild(VRButton.createButton(renderer));

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

  setCardsSphere();
  transform(targets.sphere, 2000);
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
    const phi = Math.acos(-1 + (3 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;
    const object = cards[i];

    object.position.setFromSphericalCoords(3, phi, theta);
    object.lookAt(camera.position);
    // lookAwayFrom(object, camera);
    targets.sphere.push(object);
  }
}

function setCardGrid() {
  for (let i = 0; i < cards.length; i++) {
    const object = cards[i];

    object.position.x = (i % 4) * 4 - 6;
    object.position.y = -(Math.floor(i / 4) % 13) * 2 + 8;
    object.position.z = Math.floor(i / 13);
    object.lookAt(camera.position);
  }
}

function lookAwayFrom(me, target) {
  var v = new THREE.Vector3();
  v.subVectors(me.position, target.position).add(me.position);
  me.lookAt(v);
}

//

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
    // console.log("Changed", camera.position);
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
  setCardsSphere();

  // setCardGrid();
  //

  // const delta = clock.getDelta() * 0.8; // slow down simulation

  // const range = 3 - radius;

  // for (let i = 0; i < scene.children.length; i++) {
  //   const object = scene.children[i];

  //   object.position.x += object.userData.velocity.x * delta;
  //   object.position.y += object.userData.velocity.y * delta;
  //   object.position.z += object.userData.velocity.z * delta;

  //   // keep objects inside scene

  //   if (object.position.x < -range || object.position.x > range) {
  //     object.position.x = THREE.MathUtils.clamp(
  //       object.position.x,
  //       -range,
  //       range
  //     );
  //     object.userData.velocity.x = -object.userData.velocity.x;
  //   }
  // }

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

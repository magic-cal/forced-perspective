import * as THREE from "./build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

import { BoxLineGeometry } from "./assets/jsm/geometries/BoxLineGeometry.js";
import { VRButton } from "./assets/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "./assets/jsm/webxr/XRControllerModelFactory.js";

let camera, scene, renderer, orbitControls;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let cameraPosition;
let cameraRotation;
const socket = io("https://10.0.0.60:80", { secure: true });

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

let room;

let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();

const clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x505050);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10
  );
  camera.position.set(0, 1.6, 3);
  cameraPosition = Object.assign({}, camera.position);

  room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10),
    new THREE.LineBasicMaterial({ color: 0x808080 })
  );
  room.geometry.translate(0, 3, 0);
  scene.add(room);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // for (let i = 0; i < 200; i++) {
  // const geometry = new THREE.BoxGeometry(100, 100, 100);
  // const edges = new THREE.EdgesGeometry(geometry);
  // const line = new THREE.LineSegments(
  //   edges,
  //   new THREE.LineBasicMaterial({ color: 0xffffff })
  // );
  // scene.add(line);
  const colorDark = new THREE.Color(0xb0b0b0);
  const colorLight = new THREE.Color(0xffffff);

  const material = new THREE.MeshPhongMaterial({
    opacity: 0.5,
    transparent: true,
  });

  const txtLoader = new THREE.TextureLoader();
  let card;

  let faceUpTexture = txtLoader.load("/cards/JC.svg");
  let faceDownTexture = txtLoader.load("/cards/RED_BACK.svg");
  // faceUpTexture.flipY = false;
  let darkMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0,
  });
  let faceUpMaterial = new THREE.MeshPhongMaterial({
    color: colorLight,
    map: faceUpTexture,
    transparent: true,

    shininess: 40,
  });
  let faceDownMaterial = new THREE.MeshPhongMaterial({
    // color: colorDark,
    transparent: true,
    map: faceDownTexture,
    shininess: 40,
  });
  card = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 0.01, 2), [
    darkMaterial, // left
    darkMaterial, // right
    faceDownMaterial, // facedown
    faceUpMaterial, // faceup
    darkMaterial, //
    darkMaterial, //
  ]);
  card.scale.x = 0.65;
  card.castShadow = true;
  scene.add(card);

  // card.position.x = Math.random() * 4 - 2;
  card.position.y = 1;
  // card.position.z = Math.random() * 4 - 2;
  // card.rotateX = 0;
  card.rotation.x -= 90;

  // object.userData.velocity = new THREE.Vector3();
  // object.userData.velocity.x = Math.random() * 0.01 - 0.005;
  // object.userData.velocity.y = Math.random() * 0.01 - 0.005;
  // object.userData.velocity.z = Math.random() * 0.01 - 0.005;

  // room.add(object);
  // }

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
    const object = room.children[count++];

    object.position.copy(controller.position);
    object.userData.velocity.x = (Math.random() - 0.5) * 3;
    object.userData.velocity.y = (Math.random() - 0.5) * 3;
    object.userData.velocity.z = Math.random() - 9;
    object.userData.velocity.applyQuaternion(controller.quaternion);

    if (count === room.children.length) count = 0;
  }
}

//

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  handleController(controller1);
  handleController(controller2);
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

  //

  const delta = clock.getDelta() * 0.8; // slow down simulation

  const range = 3 - radius;

  for (let i = 0; i < room.children.length; i++) {
    const object = room.children[i];

    object.position.x += object.userData.velocity.x * delta;
    object.position.y += object.userData.velocity.y * delta;
    object.position.z += object.userData.velocity.z * delta;

    // keep objects inside room

    if (object.position.x < -range || object.position.x > range) {
      object.position.x = THREE.MathUtils.clamp(
        object.position.x,
        -range,
        range
      );
      object.userData.velocity.x = -object.userData.velocity.x;
    }

    if (object.position.y < radius || object.position.y > 6) {
      object.position.y = Math.max(object.position.y, radius);

      object.userData.velocity.x *= 0.98;
      object.userData.velocity.y = -object.userData.velocity.y * 0.8;
      object.userData.velocity.z *= 0.98;
    }

    if (object.position.z < -range || object.position.z > range) {
      object.position.z = THREE.MathUtils.clamp(
        object.position.z,
        -range,
        range
      );
      object.userData.velocity.z = -object.userData.velocity.z;
    }

    for (let j = i + 1; j < room.children.length; j++) {
      const object2 = room.children[j];

      normal.copy(object.position).sub(object2.position);

      const distance = normal.length();

      if (distance < 2 * radius) {
        normal.multiplyScalar(0.5 * distance - radius);

        object.position.sub(normal);
        object2.position.add(normal);

        normal.normalize();

        relativeVelocity
          .copy(object.userData.velocity)
          .sub(object2.userData.velocity);

        normal = normal.multiplyScalar(relativeVelocity.dot(normal));

        object.userData.velocity.sub(normal);
        object2.userData.velocity.add(normal);
      }
    }

    object.userData.velocity.y -= 9.8 * delta;
  }

  renderer.render(scene, camera);
}

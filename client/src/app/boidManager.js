// "use strict";

import Boids from "./boids";

export const boidsTick = (boids) => {
  boids.forEach((boid) => {
    boid.step(1);
  });
};

export const boidsLookAt = (boids, position) => {
  boids.forEach((boid) => {
    // boid.lookTo(position, 10);
  });
};

export const getBoidById = (uuid, boids) => {
  return (
    boids.find((boid) => {
      return boid.uuid === uuid;
    }) ?? null
  );
};

export const selectBoid = (boid, cameraPosition) => {
  boid.lookTo(cameraPosition, 1000);
};

export const getSphere = (center, radius, boids) => {
  // Return points on the sphere for the given boids to go to
  // https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere

  let points = [];
  let inc = Math.PI * (3 - Math.sqrt(5));
  let off = 2 / boids.length;
  for (let k = 0; k < boids.length; k++) {
    let y = k * off - 1 + off / 2;
    let r = Math.sqrt(1 - y * y);
    let phi = k * inc;
    let x = Math.cos(phi) * r;
    let z = Math.sin(phi) * r;
    points.push(new THREE.Vector3(x, y, z).multiplyScalar(radius).add(center));
  }
  return points;
};

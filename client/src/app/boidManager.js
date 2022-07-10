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
  boid.setV;
};

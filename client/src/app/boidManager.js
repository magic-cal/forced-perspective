// "use strict";
export const boidsTick = (boids) => {
  boids.forEach((boid) => {
    boid.step(1);
  });
};

export const boidsLookAt = (boids, camera) => {
  boids.forEach((boid) => {
    boid.lookAt(camera);
  });
};

export const getBoidById = (uuid, boids) => {
  return (
    boids.find((boid) => {
      return boid.uuid === uuid;
    }) ?? null
  );
};

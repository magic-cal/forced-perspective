# Forced-perspective

This is a test to run two separate instances of a VR environnement which are linked by a socket
This allows two screens to be directly linked providing similar content to each.

## TODO:

- [x] Add HTTPS Support to use on external devices
- [ ] fix jittery issues with updates
- [ ] Get controller raycast to match UI
- [ ] Provide a cleaner UI to interact with
- [ ] Make a interface for perspective mirroring
- [ ] Decouple the Dom and interactive elements - Tidy up
- [ ] Move the socket to a separate file
- [ ] Move the cards logic to a boids manager
- [ ] Add better animations for the cards
- [ ] Not connecting with phone
- [ ] Certificate issue with local dev

## How to run

- install dependencies `npm install`
- Run dev server BE `npm run serve`
- go to `https://localhost:3000` or `https://<IP>:3000` - Has to be secure

### Alternative running for dev

- follow above instructions
- Run FE dev server `npm run start`

## Extras and Maintenance

- Certs created using openssl
- `openssl req -nodes -new -x509 -keyout server.key -out server.cert`
- Ensure BE is run before FE to make the certs work

## New proposed Structure

- Scene Manager
- - Scene
- - Camera
- - Background
- - Lights
- Boids Manager
- - Boids

All should have access to the scene.
BoidsManager should deal with the boids logic movement direction but not the actual movement.
Boids manager should be able to plot the positions of the boids and pass to a method to tween the movement.
Boids manager should be able to check intersections with the raycast and collisions within the scene
Boids should deal with the movement and the interaction with the scene.
Boids should have access to neighbours and the scene.
Controllers should be able to interact with the scene but not directly with the boids.

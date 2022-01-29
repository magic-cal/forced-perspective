# Forced-perspective

This is a test to run two separate instances of a VR environnement which are linked by a socket
This allows two screens to be directly linked providing similar content, without having to be a direct mirror

## TODO:

- [x] Add HTTPS Support to use on external devices
- [ ] fix jittery issues with updates
- [ ] Provide a cleaner UI to interact with
- [ ] Make a interface for perspective mirroring

## How to run

- install dependencies `npm i`
- Run dev server BE `npm run serve`
- go to `https://localhost:8080` or `https://<IP>:8080` - Has to be secure

## Extras and Maintenance

- Certs created using openssl

# Forced-perspective

This is a test to run two separate instances of a VR environnement which are linked by a socket
This allows two screens to be directly linked providing similar content, without having to be a direct mirror

## TODO:

- [x] Add HTTPS Support to use on external devices
- [ ] fix jittery issues with updates
- [ ] Provide a cleaner UI to interact with
- [ ] Make a interface for perspective mirroring
- [ ] Decouple the Dom and interactive elements - Tidy up

## How to run

- install dependencies `npm install`
- Run dev server BE `npm run serve`
- go to `https://localhost:3000` or `https://<IP>:3000` - Has to be secure

## Extras and Maintenance

- Certs created using openssl

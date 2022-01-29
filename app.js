var express = require("express"),
  path = require("path"),
  app = express();

var fs = require("fs");
var http = require("http").Server(app);
var https = require("https");
var cors = require("cors");
const SocketService = require("./socket");
const { connect } = require("http2");

app.set("port", process.env.PORT || 8080);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/client/src/public/cards.html"));
});

app.use(express.static(path.join(__dirname, "/client")));

const options = {
  key: fs.readFileSync("key.pem", "utf8"),
  cert: fs.readFileSync("certificate.pem", "utf8"),
  passphrase: process.env.HTTPS_PASSPHRASE || "",
};
const server = https.createServer(options, app).listen(app.get("port"), () => {
  console.log(`Listening on *:${app.get("port")}`);
});

const socketServer = new SocketService(80, 80);
socketServer.startServer();
socketServer.io.on("connection", (socket) => {
  socket.on("camera-changed", (data) => {
    // console.log({ data });
    let update = { pos: data.pos, rot: data.rot };
    socket.broadcast.emit("camera-update", update);
  });
});

// console.log(findPrimes(100));

// // find primes below 1000 using the Sieve of Eratosthenes
// function findPrimes(n) {
//   var sieve = [],
//     i,
//     j,
//     primes = [];
//   for (i = 2; i <= n; i++) {
//     if (!sieve[i]) {
//       // i has not been marked -- it is prime
//       primes.push(i);
//       for (j = i << 1; j <= n; j += i) {
//         console.log(j);
//         sieve[j] = true;
//       }
//     }
//   }
//   return primes;
// }

//

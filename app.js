var express = require("express"),
  path = require("path"),
  app = express();

var fs = require("fs");
var http = require("http").Server(app);
var https = require("https");
var cors = require("cors");
const SocketService = require("./socket");

app.set("port", process.env.PORT || 8080);

app.use(express.static("public"));

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
  console.log("NEEWW");
  socket.on("camera-changed", (data) => {
    // console.log({ data });
    let update = { pos: data.pos, rot: data.rot };
    socket.broadcast.emit("camera-update", update);
  });
});

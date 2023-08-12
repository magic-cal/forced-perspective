const fs = require("fs");
const https = require("https");
const socketIO = require("socket.io");
class SocketService {
  constructor(app, port) {
    this.options = {
      key: fs.readFileSync("example.key", "utf8"),
      cert: fs.readFileSync("example.crt", "utf8"),
      // passphrase: process.env.HTTPS_PASSPHRASE || "",
    };
    this.port = port;
    this.server = https.createServer(this.options);
  }

  startServer() {
    this.io = socketIO(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      rejectUnauthorized: false,
    });

    this.server.listen(this.port, (err) => {
      if (err) {
        return console.error("Server could not start:", err);
      }
      console.log("Server is running");
    });
  }
}

module.exports = SocketService;

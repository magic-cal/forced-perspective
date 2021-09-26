var express = require("express"),
  path = require("path"),
  app = express();

var http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var cors = require("cors");

// app.use(cors());
app.set("port", process.env.PORT || 8080);

app.use(express.static("public"));

app.listen(app.get("port"), function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Running on port: " + app.get("port"));
  }
});

io.on("connection", (socket) => {
  console.log(`A user connected with socket id ${socket.id}`);

  socket.on("camera-changed", (data) => {
    // console.log({ data });
    let update = { pos: data.pos, rot: data.rot };
    socket.broadcast.emit("camera-update", update);
  });
});

http.listen(3000, () => {
  console.log("Listening on *:3000");
});

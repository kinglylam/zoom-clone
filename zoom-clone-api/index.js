const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");

const corsOptions = {
  origin: process.env.URL,
  methods: ["GET", "POST", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

let users = [];

const port = 4000;
app.get("/", (req, res) => {
  res.send("Holla World");
});

const addUsers = (userName, roomId) => {
  users.push({
    userName: userName,
    roomId: roomId,
  });
};

const getRoomUsers = (roomId) => {
  return users.filter((user) => user.roomId == roomId);
};

const userLeave = (userName) => {
  users = users.filter((user) => user.userName != userName);
};

io.on("connection", (socket) => {
  console.log("Someone connected");
  socket.on("join-room", ({ roomId, userName }) => {
    console.log("User joined room");
    console.log(roomId);
    console.log(userName);
    if (roomId && userName) {
      socket.join(roomId);
      addUsers(userName, roomId);
      socket.to(roomId).emit("user-connected", userName);
      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    }

    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.leave(roomId);
      userLeave(userName);
      io.to(roomId).emit("all-user", getRoomUsers(roomId));
    });
  });
});

server.listen(port, () => {
  console.log("zoom clone api listening on port 4000");
});

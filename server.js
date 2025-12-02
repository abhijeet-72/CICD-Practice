// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// 🧠 STATE MANAGEMENT
// We need to store who is who.
// Key = Socket ID, Value = Username
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`🔌 New socket connected: ${socket.id}`);

  // ==> Causing Duplicate User Issue <==
  // 1. Listen for a user "logging in"
  // socket.on("join", (username) => {
  //   // Map the ID to the Name
  //   onlineUsers[socket.id] = username;

  //   console.log(`👤 ${username} joined!`);

  //   // Broadcast the updated list to EVERYONE
  //   io.emit("updateUserList", Object.values(onlineUsers));
  // });

  // 1. Listen for a user "logging in" (Added validation for Duplicate Username)
  socket.on("join", (username) => {
    // 🔍 VALIDATION STEP
    // Object.values(onlineUsers) gives us an array like ['Vedant', 'Mentor']
    // .find checks if the new username matches any existing one
    const userExists = Object.values(onlineUsers).find(
      (user) => user === username
    );

    if (userExists) {
      // Send an error ONLY to the person trying to join
      socket.emit("joinError", "⚠️ Name already taken! Please choose another.");
      return; // Stop execution here
    }

    // ... rest of your code (mapping ID and broadcasting)
    onlineUsers[socket.id] = username;
    console.log(`👤 ${username} joined!`);
    io.emit("updateUserList", Object.values(onlineUsers));
  });

  // 2. Handle Disconnect
  socket.on("disconnect", () => {
    const userWhoLeft = onlineUsers[socket.id];

    if (userWhoLeft) {
      console.log(`👋 ${userWhoLeft} left.`);

      // Remove them from the list
      delete onlineUsers[socket.id];

      // Broadcast the new list
      io.emit("updateUserList", Object.values(onlineUsers));
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose"); // Make sure to import mongoose
const bcrypt = require("bcrypt"); // Make sure to import bcrypt
const jwt = require("jsonwebtoken"); // Make sure to import jwt
require("dotenv").config();
 const User =require("./models/User")

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,

})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, message: "Logged in Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

// Compile Route
app.post("/compile", async (req, res) => {
  const { code, language } = req.body;

  // Check if both code and language are provided
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  // Ensure language exists in languageConfig
  const versionIndex = languageConfig[language]?.versionIndex;
  if (!versionIndex) {
    return res.status(400).json({ error: "Invalid language" });
  }

  try {
    // Make the API call to JDoodle
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: code,
      language: language,
      versionIndex: versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    });

    // Return the response from JDoodle
    res.json(response.data);
  } catch (error) {
    console.error('JDoodle API Error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to compile code" });
  }
});

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

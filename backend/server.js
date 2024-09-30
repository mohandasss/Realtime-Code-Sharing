// server.js

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const ACTIONS = require("./Actions");
const User = require("./models/User");

// Middleware setup
app.use(cors());
app.use(express.json());

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Language configuration for JDoodle API
const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};

// Socket.IO logic
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
  console.log("Socket connected:", socket.id);

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
   socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
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
  });
});

// User registration
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

// User login
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

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

// Code compilation route using JDoodle API
app.post("/compile", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const versionIndex = languageConfig[language]?.versionIndex;
  if (!versionIndex) {
    return res.status(400).json({ error: "Invalid language" });
  }

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: code,
      language,
      versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    res.json(response.data);
  } catch (error) {
    console.error("JDoodle API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to compile code" });
  }
});

// Server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

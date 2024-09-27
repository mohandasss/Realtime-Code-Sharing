const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const ACTIONS = require("./Actions");
require("dotenv").config();
const { exec } = require("child_process");

const app = express();
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
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// User Model
const User = require("./models/User");
app.post("/compile", (req, res) => {
  const { code, language } = req.body;

  // You might want to sanitize and validate the input here.

  // Temporary files to write the code and output
  const filename = `temp.${language}`; // e.g., temp.py for Python
  const outputFile = "output.txt";

  // Write the code to a temporary file
  require("fs").writeFileSync(filename, code);

  // Execute the code using the appropriate command based on the language
  let command;

  switch (language) {
    case "python3":
      command = `python3 ${filename} > ${outputFile}`;
      break;
    case "nodejs":
      command = `node ${filename} > ${outputFile}`;
      break;
    // Add more cases for other languages...
    default:
      return res.status(400).json({ error: "Unsupported language" });
  }

  exec(command, (err) => {
    if (err) {
      return res.status(500).json({ error: "Execution error" });
    }

    // Read the output from the output file
    const output = require("fs").readFileSync(outputFile, "utf-8");
    res.json({ output });

    // Cleanup: delete temporary files if necessary
    require("fs").unlinkSync(filename);
    require("fs").unlinkSync(outputFile);
  });
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware for JWT verification
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(403); // Forbidden

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Socket.IO Connection
const userSocketMap = {};
io.on("connection", (socket) => {
  const token = socket.handshake.query.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      socket.disconnect(); // Disconnect if JWT is invalid
      return;
    }

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

    // Other socket events...
  });
});

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

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

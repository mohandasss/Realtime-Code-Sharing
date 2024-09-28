const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const ACTIONS = require("./Actions");
const { exec } = require("child_process");
const dotenv = require("dotenv").config();
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

// Function to execute code
const executeCode = (filename, language, res) => {
  const outputFile = "output.txt";

  let command;

  switch (language) {
    case "python3":
      command = `python3 ${filename} > ${outputFile}`;
      break;
    case "nodejs":
      command = `node ${filename} > ${outputFile}`;
      break;
    case "java":
      command = `javac ${filename} && java ${filename.replace('.java', '')} > ${outputFile}`;
      break;
    case "r":
      command = `Rscript ${filename} > ${outputFile}`;
      break;
    case "c":
      command = `gcc ${filename} -o ${filename.replace('.c', '')} && ./${filename.replace('.c', '')} > ${outputFile}`;
      break;
    case "cpp":
      command = `g++ ${filename} -o ${filename.replace('.cpp', '')} && ./${filename.replace('.cpp', '')} > ${outputFile}`;
      break;
    case "ruby":
      command = `ruby ${filename} > ${outputFile}`;
      break;
    case "go":
      command = `go run ${filename} > ${outputFile}`;
      break;
    case "scala":
      command = `scalac ${filename} && scala ${filename.replace('.scala', '')} > ${outputFile}`;
      break;
    case "bash":
      command = `bash ${filename} > ${outputFile}`;
      break;
    case "sql":
      command = `sqlcmd -i ${filename} -o ${outputFile}`; // Example for SQL Server
      break;
    case "pascal":
      command = `fpc ${filename} && ./${filename.replace('.pas', '')} > ${outputFile}`;
      break;
    case "csharp":
      command = `mcs ${filename} && mono ${filename.replace('.cs', '')}.exe > ${outputFile}`;
      break;
    case "php":
      command = `php ${filename} > ${outputFile}`;
      break;
    case "swift":
      command = `swift ${filename} > ${outputFile}`;
      break;
    case "rust":
      command = `rustc ${filename} && ./${filename.replace('.rs', '')} > ${outputFile}`;
      break;
    default:
      return res.status(400).json({ error: "Unsupported language" });
  }

  exec(command, (err) => {
    if (err) {
      return res.status(500).json({ error: "Execution error" });
    }

    const output = require("fs").readFileSync(outputFile, "utf-8");
    res.json({ output });

    // Cleanup: delete temporary files
    require("fs").unlinkSync(filename);
    require("fs").unlinkSync(outputFile);
  });
};

// Compile Route
app.post("/compile", (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const filename = `temp.${language}`;
  require("fs").writeFileSync(filename, code);

  executeCode(filename, language, res);
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

// JWT Verification Middleware
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

// Get all connected clients
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

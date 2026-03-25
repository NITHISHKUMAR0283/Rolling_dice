import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// MongoDB connection (fallback to in-memory if not set)
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));
} else {
  console.log("No MongoDB URI provided, using in-memory storage.");
}

// In-memory storage fallback
const inMemory = {
  users: [],
  rounds: [],
  leaderboard: {},
  votes: {},
  history: []
};

// Weighted dice logic
const weights = [0.1, 0.15, 0.2, 0.1, 0.15, 0.3];
function weightedRoll(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (rand < weights[i]) return i + 1;
    rand -= weights[i];
  }
}

// Game state
let currentPhase = "waiting"; // waiting | voting | rolling | result
let roundVotes = {};
let roundResult = null;
let roundTimer = null;
let roundNumber = 0;
const VOTING_DURATION = 15; // seconds
const HISTORY_SIZE = 10;

// REST endpoint: get leaderboard
app.get("/api/leaderboard", (req, res) => {
  res.json(inMemory.leaderboard);
});

// REST endpoint: get history
app.get("/api/history", (req, res) => {
  res.json(inMemory.history);
});

// REST endpoint: get avatars
app.get("/api/avatars", (req, res) => {
  res.json([
    "avatar1.gif",
    "avatar2.gif",
    "avatar3.gif",
    "avatar4.gif",
    "avatar5.gif",
    "avatar6.gif"
  ]);
});

// WebSocket logic
io.on("connection", (socket) => {
  // User joins
  socket.on("join", ({ name, avatar }) => {
    inMemory.users.push({ id: socket.id, name, avatar, score: 0 });
    io.emit("users", inMemory.users);
  });

  // User votes
  socket.on("vote", (number) => {
    if (currentPhase !== "voting") return;
    roundVotes[socket.id] = number;
    const voteCounts = countVotes(roundVotes);
    io.emit("voteUpdate", voteCounts);
  });

  // User disconnects
  socket.on("disconnect", () => {
    inMemory.users = inMemory.users.filter(u => u.id !== socket.id);
    delete roundVotes[socket.id];
    io.emit("users", inMemory.users);
  });
});

function countVotes(votes) {
  const counts = [0, 0, 0, 0, 0, 0];
  Object.values(votes).forEach(n => {
    if (n >= 1 && n <= 6) counts[n - 1]++;
  });
  const total = Object.keys(votes).length;
  return counts.map((count, i) => ({
    number: i + 1,
    count,
    percent: total ? Math.round((count / total) * 100) : 0
  }));
}

// Game loop
function startRound() {
  currentPhase = "voting";
  roundVotes = {};
  roundResult = null;
  roundNumber++;
  io.emit("phase", { phase: "voting", round: roundNumber, timer: VOTING_DURATION });
  io.emit("voteUpdate", countVotes(roundVotes));
  roundTimer = setTimeout(() => {
    currentPhase = "rolling";
    io.emit("phase", { phase: "rolling", round: roundNumber });
    setTimeout(() => {
      // Roll dice
      roundResult = weightedRoll(weights);
      currentPhase = "result";
      // Update leaderboard
      Object.entries(roundVotes).forEach(([id, vote]) => {
        const user = inMemory.users.find(u => u.id === id);
        if (user && vote === roundResult) {
          user.score = (user.score || 0) + 1;
        }
      });
      // Update history
      inMemory.history.unshift(roundResult);
      if (inMemory.history.length > HISTORY_SIZE) inMemory.history.pop();
      // Update leaderboard
      inMemory.leaderboard = Object.fromEntries(
        inMemory.users.map(u => [u.name, u.score || 0])
      );
      io.emit("phase", { phase: "result", round: roundNumber, result: roundResult });
      io.emit("leaderboard", inMemory.leaderboard);
      io.emit("history", inMemory.history);
      setTimeout(startRound, 5000); // 5s result phase
    }, 2000); // 2s dice roll animation
  }, VOTING_DURATION * 1000);
}

// Start game loop
startRound();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

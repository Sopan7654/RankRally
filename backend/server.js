require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/user.model");
const History = require("./models/history.model");

const app = express();
const server = http.createServer(app);

// Set up CORS options to allow both local and deployed frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Your live frontend URL from Vercel environment variables
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or from our allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const io = new Server(server, {
  cors: corsOptions,
});

const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    seedDatabase();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Helper function to emit updates to all clients ---
const emitUpdates = async () => {
  try {
    const users = await User.find().sort({ points: -1 });
    const history = await History.find().sort({ timestamp: -1 }).limit(10);
    io.emit("update", { users, history });
  } catch (error) {
    console.error("Error emitting updates:", error);
  }
};

// --- API Endpoints ---
app.get("/", (req, res) => {
  res.send("Welcome to the Rank Royale API! The server is running.");
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.post("/api/users", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser)
      return res.status(409).json({ message: "User already exists." });

    const newUser = new User({
      name,
      img: `https://placehold.co/100x100/8b5cf6/ffffff?text=${name
        .charAt(0)
        .toUpperCase()}`,
    });
    await newUser.save();

    emitUpdates();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Error adding user" });
  }
});

app.post("/api/claim", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pointsGained = Math.floor(Math.random() * 10) + 1;
    user.points += pointsGained;
    await user.save();

    const historyRecord = new History({
      userId: user._id,
      userName: user.name,
      pointsGained,
    });
    await historyRecord.save();

    emitUpdates();
    res.json({ message: `${user.name} gained ${pointsGained} points!` });
  } catch (err) {
    res.status(500).json({ message: "Error claiming points" });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

// --- Socket.io Connection Handler ---
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// --- Start the Server ---
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// --- Helper function to seed initial data ---
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found, seeding database with 10 users...");
      const initialUsers = [
        { name: "Rahul", points: 68, img: "https://placehold.co/100x100/f87171/ffffff?text=R" },
        { name: "Kamal", points: 96, img: "https://placehold.co/100x100/60a5fa/ffffff?text=K" },
        { name: "Sanak", points: 40, img: "https://placehold.co/100x100/34d399/ffffff?text=S" },
        { name: "Sai", points: 86, img: "https://placehold.co/100x100/c084fc/ffffff?text=S" },
        { name: "Priya", points: 75, img: "https://placehold.co/100x100/fbbf24/ffffff?text=P" },
        { name: "Amit", points: 55, img: "https://placehold.co/100x100/a3e635/ffffff?text=A" },
        { name: "Deepika", points: 92, img: "https://placehold.co/100x100/22d3ee/ffffff?text=D" },
        { name: "Vikram", points: 30, img: "https://placehold.co/100x100/f472b6/ffffff?text=V" },
        { name: "Anjali", points: 88, img: "https://placehold.co/100x100/818cf8/ffffff?text=A" },
        { name: "Rohan", points: 62, img: "https://placehold.co/100x100/f97316/ffffff?text=R" }
      ];
      await User.insertMany(initialUsers);
      console.log("Database seeded!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

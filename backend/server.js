require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/user.model');
const History = require('./models/history.model');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  seedDatabase();
})
.catch(err => console.error('MongoDB connection error:', err));


// --- Helper function to emit updates to all clients ---
const emitUpdates = async () => {
    try {
        const users = await User.find().sort({ points: -1 });
        const history = await History.find().sort({ timestamp: -1 }).limit(10);
        io.emit('update', { users, history });
    } catch (error) {
        console.error("Error emitting updates:", error);
    }
};


// --- API Endpoints ---

// GET /users - Fetch all users, sorted by points
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// POST /users - Add a new user
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) return res.status(409).json({ message: 'User already exists.' });

    const newUser = new User({
      name,
      img: `https://placehold.co/100x100/8b5cf6/ffffff?text=${name.charAt(0).toUpperCase()}`
    });
    await newUser.save();
    
    emitUpdates();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Error adding user' });
  }
});

// POST /claim - Claim points for a user
app.post('/api/claim', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // REMOVED: The entire cooldown logic block has been deleted.
    
    const pointsGained = Math.floor(Math.random() * 10) + 1;
    user.points += pointsGained;
    await user.save();

    const historyRecord = new History({ userId: user._id, userName: user.name, pointsGained });
    await historyRecord.save();

    emitUpdates();
    res.json({ message: `${user.name} gained ${pointsGained} points!` });

  } catch (err) {
    res.status(500).json({ message: 'Error claiming points' });
  }
});

// GET /history - Fetch claim history
app.get('/api/history', async (req, res) => {
    try {
        const history = await History.find().sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// --- Socket.io Connection Handler ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
      console.log('No users found, seeding database...');
      const initialUsers = [
        { name: "Rahul", points: 50, img: "https://placehold.co/100x100/f87171/ffffff?text=R" },
        { name: "Kamal", points: 80, img: "https://placehold.co/100x100/60a5fa/ffffff?text=K" },
        { name: "Sanak", points: 25, img: "https://placehold.co/100x100/34d399/ffffff?text=S" },
      ];
      await User.insertMany(initialUsers);
      console.log('Database seeded!');
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

const express   = require('express');
const dotenv    = require('dotenv');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const marketRoutes = require("./routes/market");



dotenv.config();
connectDB();

const app = express();

app.use(helmet());
// app.use(cors()); // ← allows ALL origins

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Only auth for now
app.use('/api/auth', require('./routes/auth'));
app.use("/api/market", marketRoutes);

app.get('/', (req, res) => res.json({ status: 'AgriSense Backend Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

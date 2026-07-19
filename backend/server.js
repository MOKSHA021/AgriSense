const express   = require('express');
const dotenv    = require('dotenv');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const cookieParser = require('cookie-parser');
const { globalLimiter } = require('./middleware/rateLimiter');
const connectDB = require('./config/db');
const marketRoutes = require("./routes/market");
const expenseRoutes = require("./routes/expenses");
const inputAdvisorRoutes = require("./routes/inputAdvisor");
const referenceRoutes = require("./routes/reference");
const mlRoutes = require("./routes/ml");
const weatherRoutes = require("./routes/weather");
const pestRoutes = require("./routes/pest");


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
app.use(cookieParser());

app.use('/api/', globalLimiter);

// 🔍 DEBUG ROUTE: Let's you physically see the rate limit counter!
app.get('/api/debug-rate-limit', (req, res) => {
  // express-rate-limit automatically attaches this 'rateLimit' object 
  // to the request after it checks the MemoryStore
  res.json({
    message: "Here is your exact status in the Rate Limiter RAM:",
    yourIP: req.ip,
    rateLimitData: req.rateLimit
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use("/api/market", marketRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/input-advisor", inputAdvisorRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/pest", pestRoutes);

app.get('/', (req, res) => res.json({ status: 'AgriSense Backend Running' }));

// Catch-all route for unknown API endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

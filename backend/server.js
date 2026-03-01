 
const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/soil',  require('./routes/soil'));
app.use('/api/crop',  require('./routes/crop'));
app.use('/api/price', require('./routes/price'));

app.get('/', (req, res) => res.json({ status: 'AgriSense Backend Running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-finance-planner'
  )
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/statements', require('./routes/statements'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/investments', require('./routes/investments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart AI Finance Planner API is running',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

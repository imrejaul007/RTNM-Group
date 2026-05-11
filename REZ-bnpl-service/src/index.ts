import express from 'express';
import mongoose from 'mongoose';
import bnplRoutes from './routes/bnpl';
import {
  scheduleEMIReminders,
  processOverdueAccounts,
  updateCreditScores
} from './workers/bnpl-worker';

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(express.json());

// Routes
app.use('/api/bnpl', bnplRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rez-bnpl-service' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rez_bnpl';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Schedule daily jobs
    setInterval(processOverdueAccounts, 24 * 60 * 60 * 1000); // Daily
    scheduleEMIReminders();
    updateCreditScores();

    app.listen(PORT, () => {
      console.log(`BNPL Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

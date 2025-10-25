import { config } from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { logInfo } from './utils/logger';

// Load environment variables
config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

logInfo('Starting server initialization...', { environment: NODE_ENV });

// Connect to database
logInfo('Connecting to database...');
connectDB();

// Start server
app.listen(PORT, () => {
  logInfo('Server started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    environment: NODE_ENV,
  });
});

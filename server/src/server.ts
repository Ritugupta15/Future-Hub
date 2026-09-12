import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { getDatabase, initializeDatabase } from './database/db.js';
import { seedDatabase } from './database/seed.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    const db = getDatabase();
    initializeDatabase(db);

    // Check if careers table has records, if not seed it
    const countRow = db.prepare('SELECT COUNT(*) as count FROM careers').get() as { count: number };
    if (countRow.count === 0) {
      console.log('Database empty. Running initial seed...');
      seedDatabase(db);
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` FutureHub REST API Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    const shutdown = () => {
      console.log('Gracefully shutting down FutureHub server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal error during server bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();

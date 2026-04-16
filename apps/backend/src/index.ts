import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './firebase-admin'; // Ensure Firebase Admin is initialized
import routes from './routes';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SupplyLink LK Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌿 SupplyLink LK API running on http://localhost:${PORT}`);
});

export default app;

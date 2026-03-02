import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import formsRoutes from './routes/forms.js';
import workflowsRoutes from './routes/workflows.js';
import submissionsRoutes from './routes/submissions.js';
import usersRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';
import notificationsRoutes from './routes/notifications.js';
import publicRoutes from './routes/public.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Prisma Client (singleton for serverless to avoid too many connections)
const globalForPrisma = globalThis;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}
export const prisma = globalForPrisma.prisma;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes (auth)
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Protected routes
app.use('/api/forms', authMiddleware, formsRoutes);
app.use('/api/workflows', authMiddleware, workflowsRoutes);
app.use('/api/submissions', authMiddleware, submissionsRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server only when not on Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    app._router.stack.forEach(layer => {
      if (layer.route) {
        console.log(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
      } else if (layer.name === 'router') {
        const base = layer.regexp.toString().replace('/^', '').replace('(?=\\/|$)/i', '').replace('\\/', '/');
        layer.handle.stack.forEach(subLayer => {
          if (subLayer.route) {
            console.log(`${Object.keys(subLayer.route.methods).join(',').toUpperCase()} ${base}${subLayer.route.path}`);
          }
        });
      }
    });
  });
}

export default app;

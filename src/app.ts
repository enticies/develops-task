// src/app.ts
import express from 'express';
import path from 'path';
import { config } from './config/config';
import agentRoutes from './routes/agent.routes';
import uiRoutes from './routes/ui.routes';
import { specs, swaggerUi } from './config/swagger';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Redirect root to Swagger docs
app.get('/', (_, res) => {
  res.redirect('/api-docs');
});

// Routes
app.use(agentRoutes);
app.use(uiRoutes);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;

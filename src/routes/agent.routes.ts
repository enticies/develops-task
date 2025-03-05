// src/routes/agent.routes.ts
import { Router } from 'express';
import { handleAgentQuery } from '../controllers/agent.controller';

const router = Router();

/**
 * @swagger
 * /agent:
 *   post:
 *     summary: Query the news article agent
 *     description: Ask questions about news articles or request article summaries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The query to ask the agent
 *                 example: "Tell me the latest news about Justin Trudeau"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: The agent's response to the query
 *                 sources:
 *                   type: array
 *                   description: Sources used to generate the answer
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: Article title
 *                       url:
 *                         type: string
 *                         description: Article URL
 *                       date:
 *                         type: string
 *                         description: Article publication date
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/agent', handleAgentQuery);

export default router;

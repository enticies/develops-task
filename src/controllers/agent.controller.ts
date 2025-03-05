import { Request, Response } from 'express';
import { processQuery } from '../services/agent.service';

export async function handleAgentQuery(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }
    
    const response = await processQuery(query);
    return res.json(response);
  } catch (error) {
    console.error('Error handling agent query:', error);
    return res.status(500).json({ error: 'Failed to process query' });
  }
}

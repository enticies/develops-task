// src/services/agent.service.ts
import { OpenAI } from 'openai';
import { config } from '../config/config';
import { Article, extractAndCleanArticle } from './article.service';
import { searchArticles } from './vector-db.service';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface AgentResponse {
  answer: string;
  sources: {
    title: string;
    url: string;
    date: string;
  }[];
}

export async function processQuery(query: string): Promise<AgentResponse> {
  try {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = query.match(urlRegex);
    
    let relevantArticles: Article[] = [];
    
    if (urls && urls.length > 0) {
      const articleData = await extractAndCleanArticle(urls[0]);
      if (articleData) {
        relevantArticles = [articleData];
      }
    } else {
      relevantArticles = await searchArticles(query, 3);
    }
    
    const context = relevantArticles.map(article => 
      `Title: ${article.title}\n\nURL: ${article.url}\n\nDate: ${article.date}\n\nContent: ${article.content}`
    ).join('\n\n---\n\n');
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL as string, 
      messages: [
        {
          role: "system",
          content: `You are a helpful news assistant. Answer the user's question based on the provided news article context.
          Be concise and accurate. If the context doesn't contain relevant information to answer the question,
          acknowledge that you don't have enough information.`
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ]
    });
    
    const answer = completion.choices[0].message.content ?? '';
    
    const sources = relevantArticles.map(article => ({
      title: article.title,
      url: article.url,
      date: article.date
    }));
    
    return {
      answer,
      sources
    };
  } catch (error) {
    console.error('Error processing query:', error);
    throw error;
  }
}

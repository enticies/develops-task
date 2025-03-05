import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from "@langchain/openai"
import { config } from '../config/config';
import { Article } from './article.service';

const pinecone = new Pinecone({
  apiKey: config.pinecone.apiKey,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: config.openai.apiKey,
  modelName: 'text-embedding-3-large',
  dimensions: 1024
});

export async function storeArticleInVectorDB(
  article: Article
): Promise<void> {
  try {
    const index = pinecone.Index(config.pinecone.index);

    const text = `${article.title} ${article.content}`;
    const embedding = await embeddings.embedQuery(text);

    const id = Buffer.from(article.url).toString('base64');

    const a = await index.upsert([
      {
        id,
        values: embedding,
        metadata: {
          title: article.title,
          url: article.url,
          date: article.date,
          content: article.content.substring(0, 8000),
        },
      },
    ]);

    console.log(`Stored article in vector DB: ${article.title}`);
  } catch (error) {
    console.error('Error storing article in vector DB:', error);
    throw error;
  }
}

export async function searchArticles(
  query: string,
  limit: number = 3
): Promise<Article[]> {
  try {
    const queryEmbedding = await embeddings.embedQuery(query);
    const index = pinecone.Index(config.pinecone.index);
    const results = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      title: match.metadata!.title as string,
      url: match.metadata!.url as string,
      date: match.metadata!.date as string,
      content: match.metadata!.content as string,
    }));
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
}

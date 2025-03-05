import axios from 'axios';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { config } from '../config/config';
import { storeArticleInVectorDB } from './vector-db.service';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface Article {
  title: string;
  content: string;
  url: string;
  date: string;
}


export async function processArticleUrl(url: string): Promise<void> {
  try {
    const article = await extractAndCleanArticle(url);

    if (article) {
      await storeArticleInVectorDB(article);
      console.log(`Successfully processed and stored article: ${article.title}`);
    }
  } catch (error) {
    console.error(`Error processing article URL ${url}:`, error);
    throw error;
  }
}

export async function extractAndCleanArticle(url: string): Promise<Article | null> {
  try {
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided:', url);
      return null;
    }

    let validUrl: string;
    try {
      new URL(url);
      validUrl = url;
    } catch (urlError) {
      console.error(`Invalid URL format: ${url}`);
      return null;
    }

    console.log(`Fetching content from: ${validUrl}`);
    const response = await axios.get(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });

    const html = response.data;

    const $ = cheerio.load(html);

    $('script, style, nav, footer, header, aside, .ads, .comments').remove();

    const pageTitle = $('title').text().trim();

    let rawText = '';
    $('article, main, .content, .article, .post, p').each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        rawText += text + '\n\n';
      }
    });

    if (!rawText) {
      rawText = $('body').text().trim();
    }

    const truncatedText = rawText.substring(0, 15000);

    console.log(`Extracted raw content (${truncatedText.length} chars). Using LLM to clean...`);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL as string, 
      messages: [
        {
          role: "system",
          content: `You are a news article processor. Extract and structure the following news article content into a clean format.
          Return ONLY a JSON object with the following fields:
          - title: The article title
          - content: The cleaned article content (remove ads, navigation, etc.)
          - url: The original URL
          - date: The publication date in ISO format (YYYY-MM-DD). If not found, use today's date.`
        },
        {
          role: "user",
          content: `URL: ${url}\n\nPage Title: ${pageTitle}\n\nRaw content: ${truncatedText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const articleData = JSON.parse(completion.choices[0].message.content ?? '') as Article;

    // Ensure URL is included
    articleData.url = url;

    return articleData;
  } catch (error) {
    console.error(`Error extracting article from ${url}`);
    return null;
  }
}

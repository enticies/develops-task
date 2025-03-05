// src/services/kafka.service.ts
import { Kafka, Consumer } from 'kafkajs';
import { config } from '../config/config';
import { processArticleUrl } from './article.service';

interface ArticleEvent {
  event: string;
  value: {
    url: string;
  };
}

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'news-article-agent',
      brokers: [config.kafka.broker],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: config.kafka.username,
        password: config.kafka.password,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: `${config.kafka.groupIdPrefix}${Date.now()}`,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: config.kafka.topicName,
        fromBeginning: true,
      });
      this.isConnected = true;
      console.log('Connected to Kafka');
    } catch (error) {
      console.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async startConsuming(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = message.value?.toString();
          if (!messageValue) {
            console.log('Received empty message, skipping');
            return;
          }

          console.log(`Received message: ${messageValue}`);
          
          try {
            const parsedMessage = JSON.parse(messageValue);
            
            if (parsedMessage.event === 'new-article' && parsedMessage.value?.url) {
              const url = parsedMessage.value.url;
              console.log(`Processing article URL: ${url}`);
              await processArticleUrl(url);
            } 
            else if (parsedMessage.url) {
              const url = parsedMessage.url;
              console.log(`Processing article URL: ${url}`);
              await processArticleUrl(url);
            }
            else if (typeof parsedMessage === 'string' && parsedMessage.startsWith('http')) {
              console.log(`Processing article URL: ${parsedMessage}`);
              await processArticleUrl(parsedMessage);
            }
            else {
              const findUrl = (obj: any): string | null => {
                if (!obj || typeof obj !== 'object') return null;
                
                for (const key in obj) {
                  const value = obj[key];
                  if (typeof value === 'string' && value.startsWith('http')) {
                    return value;
                  } else if (typeof value === 'object') {
                    const nestedUrl = findUrl(value);
                    if (nestedUrl) return nestedUrl;
                  }
                }
                return null;
              };
              
              const url = findUrl(parsedMessage);
              if (url) {
                console.log(`Found URL in message: ${url}`);
                await processArticleUrl(url);
              } else {
                console.log('No URL found in message, skipping');
              }
            }
          } catch (parseError) {
            if (messageValue.startsWith('http')) {
              console.log(`Processing article URL: ${messageValue}`);
              await processArticleUrl(messageValue);
            } else {
              console.log('Message is not JSON and not a URL, skipping');
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    console.log('Kafka consumer started');
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    this.isConnected = false;
    console.log('Disconnected from Kafka');
  }
}

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  kafka: {
    broker: process.env.KAFKA_BROKER || '',
    username: process.env.KAFKA_USERNAME || '',
    password: process.env.KAFKA_PASSWORD || '',
    topicName: process.env.KAFKA_TOPIC_NAME || 'news',
    groupIdPrefix: process.env.KAFKA_GROUP_ID_PREFIX || 'test-task-',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    index: process.env.PINECONE_INDEX || 'develops',
    host: process.env.PINECONE_HOST || 'https://develops-l068dq5.svc.aped-4627-b74a.pinecone.io'
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
};

export function validateConfig() {
  const requiredConfigs = [
    { key: 'kafka.broker', value: config.kafka.broker },
    { key: 'kafka.username', value: config.kafka.username },
    { key: 'kafka.password', value: config.kafka.password },
    { key: 'openai.apiKey', value: config.openai.apiKey },
    { key: 'pinecone.apiKey', value: config.pinecone.apiKey },
    { key: 'pinecone.environment', value: config.pinecone.environment },
  ];

  const missingConfigs = requiredConfigs
    .filter(({ value }) => !value)
    .map(({ key }) => key);

  if (missingConfigs.length > 0) {
    throw new Error(
      `Missing required configuration: ${missingConfigs.join(', ')}`
    );
  }
}

import app from './app';
import { config, validateConfig } from './config/config';
import { KafkaService } from './services/kafka.service';

async function startServer() {
  try {
    validateConfig();
    
    const server = app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
    
    const kafkaService = new KafkaService();
    await kafkaService.startConsuming();
    
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close();
      await kafkaService.disconnect();
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

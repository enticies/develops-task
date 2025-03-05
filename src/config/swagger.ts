import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News Article Agent API',
      version: '1.0.0',
      description: 'A RAG-based news article query system',
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], 
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

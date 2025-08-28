import swaggerAutogen from 'swagger-autogen';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import CONFIG from './config/dotenvConfig';

const outputFile = path.join(__dirname, 'swagger_output.json');
const endpointsFiles = [path.join(__dirname, 'index.ts')];

const doc = {
  info: {
    title: 'memory game test API',
    description: 'memory game',
  },
  host: 'localhost:8000',
  basePath: '/api',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  responses: {
    Success: { description: 'Request completed successfully.' },
    InvalidInput: { description: 'Invalid input provided.' },
    Unauthorized: { description: 'Unauthorized access.' },
  },
};

export function setupSwagger(app: Express, url: string): void {
  swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
    const swaggerFile = require(outputFile);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    console.log(`Swagger docs available at ${CONFIG.DEV_HOST}:${CONFIG.DEV_PORT}/api-docs`);
  });
}

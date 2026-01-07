import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
  },
  apis: ['../controllers/userController.js'],
};

const spec = swaggerJsdoc(options);
console.log('Paths found:', Object.keys(spec.paths).length);
console.log('Paths:', Object.keys(spec.paths));

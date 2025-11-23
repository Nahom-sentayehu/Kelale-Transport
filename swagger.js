const swaggerJSDoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kelale Transport API',
      version: '1.0.0',
      description: 'API documentation for Kelale Transport backend'
    }
  },
  apis: ['./routes/*.js','./models/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

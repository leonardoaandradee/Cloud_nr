const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Carrega o arquivo swagger.yaml da raiz do back
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

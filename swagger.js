// swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pizza Show API',
      version: '1.0.0',
      description: 'API para gerenciamento de pizzaria',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      schemas: {
        Cliente: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            telefone: { type: 'string', example: '11999999999' },
            CEP: { type: 'string', example: '12345678' },
            rua: { type: 'string', example: 'Rua das Flores' },
            bairro: { type: 'string', example: 'Centro' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            complemento: { type: 'string', example: 'Apto 123' }
          }
        },
        Produto: {
          type: 'object',
          properties: {
            sabor: { type: 'string', example: 'Margherita' },
            descricao: { type: 'string', example: 'Molho, mussarela, manjericão' },
            categoria: { type: 'string', example: 'Pizzas Tradicionais' },
            tamanho: { type: 'string', example: 'Grande' },
            preco: { type: 'number', example: 45.90 }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            clientes_id: { type: 'integer', example: 1 },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  produtos_id: { type: 'integer', example: 1 },
                  quantidade: { type: 'integer', example: 2 },
                  preco_unitario: { type: 'number', example: 45.90 }
                }
              }
            },
            preco_total: { type: 'number', example: 91.80 },
            endereco_entrega: { type: 'string', example: 'Rua das Flores, 123' }
          }
        }
      }
    }
  },
  apis: ['./back/routes/*.js'], // Caminho para os arquivos com anotações JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

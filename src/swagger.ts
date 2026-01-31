import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'welive project API',
      version: '1.0.0',
      description: 'team2의 위리브 프로젝트 api입니다.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['./src/domain/**/controller/*.ts'],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };

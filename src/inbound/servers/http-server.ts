import express from 'express';
import http from 'http';
import { Middlewares } from '../i-middelwares';
import { Controllers } from '../i-controllers';
import { getEnv } from '../../shared/utils/env-util';

export const createHttpServer = (middlewares: Middlewares, controllers: Controllers) => {
  const app = express();
  const defaultHttpServer = http.createServer(app);

  // middlewares
  app.use(express.json());

  //controllers
  for (const controllerKey in controllers) {
    const controller = controllers[controllerKey as keyof Controllers];
    app.use(controller.path, controller.router);
    console.log(
      `Controller mounted at path: ${controller.path}, controllerKey: ${controller.router}`,
    );
  }

  //errors
  app.use(middlewares.globalError);
  app.use(middlewares.notFound);

  const listen = () => {
    defaultHttpServer.listen(getEnv().PORT, () => {
      console.log(`Listening on port ${getEnv().PORT}`);
    });
  };

  return { app, defaultHttpServer, listen };
};

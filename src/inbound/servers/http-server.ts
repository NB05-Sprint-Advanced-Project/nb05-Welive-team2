import express from 'express';
import http from 'http';
import { Middlewares } from '../i-middelwares';
import { Controllers } from '../i-controllers';
import { IUtils } from '../../shared/i-utils';

export const createHttpServer = (
  middlewares: Middlewares,
  controllers: Controllers,
  utils: IUtils,
) => {
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
    defaultHttpServer.listen(utils.config.PORT, () => {
      console.log(`Listening on port ${utils.config.PORT}`);
    });
  };

  return { app, defaultHttpServer, listen };
};

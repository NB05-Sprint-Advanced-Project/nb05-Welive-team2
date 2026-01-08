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

  //controllers

  //errors

  const listen = () => {
    defaultHttpServer.listen(utils.config.PORT, () => {
      console.log(`Listening on port ${utils.config.PORT}`);
    });
  };

  return { app, defaultHttpServer, listen };
};

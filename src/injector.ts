import { createGlobalErrorMiddleware } from './inbound/middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './inbound/middlewares/not-found-middleware';
import { createHttpServer } from './inbound/servers/http-server';
import { loadConfig } from './shared/utils/config-util';

export const createInjector = () => {
  const config = loadConfig();

  const utils = {
    config,
  };

  //middleware
  const globalErrorMiddleware = createGlobalErrorMiddleware(utils);
  const notFoundMiddleware = createNotFoundMiddleware();

  const middlewares = {
    globalErrorMiddleware,
    notFoundMiddleware,
  };

  //controller

  //service

  // const httpServer = createHttpServer(middlewares, controllers, utils);

  //  const wsServer = createWsServer(
  //   httpServer.defaultHttpServer,
  //   middlewares,
  //   gateways,
  //   utils,
  // );

  return {
    // httpServer,
    // wsServer,
    utils,
  };
};

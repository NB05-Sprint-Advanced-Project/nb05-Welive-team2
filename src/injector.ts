import { createGlobalErrorMiddleware } from './inbound/middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './inbound/middlewares/not-found-middleware';
import { loadConfig } from './shared/utils/config-util';

export const createInjector = () => {
  const config = loadConfig();

  const utils = {
    config,
  };

  const globalErrorMiddleware = createGlobalErrorMiddleware(utils);
  const notFoundMiddleware = createNotFoundMiddleware(utils);

  const middlewares = {
    globalErrorMiddleware,
    notFoundMiddleware,
  };

  return {
    utils,
  };
};

import { GlobalErrorMiddleware } from './middlewares/global-error-middleware';

export type Middlewares = {
  globalError: GlobalErrorMiddleware;
};

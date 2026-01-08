import { GlobalErrorMiddleware } from './middlewares/global-error-middleware';
import { NotFoundMiddleware } from './middlewares/not-found-middleware';

export type Middlewares = {
  globalError: GlobalErrorMiddleware;
  notFound: NotFoundMiddleware;
};

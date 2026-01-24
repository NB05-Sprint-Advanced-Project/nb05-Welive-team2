import { AuthMiddleware } from '../../middlewares/auth-middleware';
import { GlobalErrorMiddleware } from '../../middlewares/global-error-middleware';
import { MulterMiddleware } from '../../middlewares/multer-middleware';
import { NotFoundMiddleware } from '../../middlewares/not-found-middleware';

export type Middlewares = {
  globalError: GlobalErrorMiddleware;
  notFound: NotFoundMiddleware;
  auth: AuthMiddleware;
  multer: MulterMiddleware;
};

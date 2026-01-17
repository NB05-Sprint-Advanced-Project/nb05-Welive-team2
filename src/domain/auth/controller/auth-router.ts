import { Router } from 'express';
import { AuthHandlers } from './auth-handler';

export const registerAuthRoutes = (router: Router, handlers: AuthHandlers) => {
  router.post('/login', handlers.login);
  router.post('/logout', handlers.logout);
  router.post('/refresh', handlers.refreshToken);
};

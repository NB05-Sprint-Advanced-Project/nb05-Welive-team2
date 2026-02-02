import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { UserHandlers } from './user-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerUserRoutes = (
  router: Router,
  handlers: UserHandlers,
  middlewares: Middlewares,
) => {
  // 슈퍼 관리자
  router.post('/super-admins', catchHandler(handlers.createSuperAdmin));

  // 관리자
  router.post('/admins', catchHandler(handlers.createAdmin));

  router.get(
    '/admins',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.getAdministrators),
  );

  router.patch(
    '/admins/join-status',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdminsJoinStatuses),
  );

  router.delete(
    '/admins/rejected',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.deleteRejectedAdmins),
  );

  router.patch(
    '/admins/:id/join-status',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdminJoinStatus),
  );

  router.patch(
    '/admins/:adminId',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdmin),
  );

  router.delete(
    '/admins/:adminId',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.deleteAdmin),
  );

  // 입주민 계정
  router.post('/residents', catchHandler(handlers.signUpResidentAccount));

  router.get(
    '/residents',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.getResidentAccounts),
  );

  router.patch(
    '/residents/join-status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResidentAccountJoinStatuses),
  );

  router.patch(
    '/residents/:id/join-status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResidentAccountJoinStatus),
  );

  router.delete(
    '/residents/rejected',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.deleteResidentAccounts),
  );

  router.patch(
    '/me/avatar',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(middlewares.multer.image()),
    catchHandler(handlers.updateAvatarUrl),
  );

  router.patch(
    '/me/password',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updatePassword),
  );
};

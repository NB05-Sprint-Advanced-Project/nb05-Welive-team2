import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { UserHandlers } from './user-handler';

export const registerUserRoutes = (router: Router, handlers: UserHandlers) => {
  router.post('/super-admins', catchHandler(handlers.createSuperAdmin));
  router.post('/admins', catchHandler(handlers.createAdmin));

  router.patch('/me/password', catchHandler(handlers.updatePassword));

  // 관리자 계정
  router.get('/admins', catchHandler(handlers.getAdministrators));
  router.patch('/admins/join-status', catchHandler(handlers.updateAdminsJoinStatuses));
  router.delete('/admins/rejected', catchHandler(handlers.deleteRejectedAdmins));
  router.patch('/admins/:id/join-status', catchHandler(handlers.updateAdminJoinStatus));
  router.patch('/admins/:adminId', catchHandler(handlers.updateAdmin));
  router.delete('/admins/:adminId', catchHandler(handlers.deleteAdmin));

  // 입주민 계정
  router.post('/residents', catchHandler(handlers.signUpResidentAccount));
  router.get('/residents', catchHandler(handlers.getResidentAccounts));
  router.patch('/residents/join-status', catchHandler(handlers.updateResidentAccountJoinStatuses));
  router.patch(
    '/residents/:id/join-status',
    catchHandler(handlers.updateResidentAccountJoinStatus),
  );
  router.delete('/residents/rejected', catchHandler(handlers.deleteResidentAccounts));

  router.patch(
    '/me/avatar',
    //catchHandler(middlewares.multer.uploadS3),
    catchHandler(handlers.updateAvatarUrl),
  );
};

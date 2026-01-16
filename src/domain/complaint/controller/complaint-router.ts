import { Router } from 'express';
import { ComplaintHanders } from './complaint-handler';
import { catchHandler } from '../../../utils/controller-util';

export const registerComplaintRouters = (router: Router, handlers: ComplaintHanders) => {
  router.get('/:complaintId', catchHandler(handlers.getComplaint));

  router.get('/', catchHandler(handlers.getAllComplaints));

  router.post('/', catchHandler(handlers.createComplaint));

  router.patch('/:complaintId', catchHandler(handlers.updateComplaint));

  router.delete('/:complaintId', catchHandler(handlers.deleteComplaint));

  router.patch('/:complaintId/status', catchHandler(handlers.updateComplaintStatus));
};

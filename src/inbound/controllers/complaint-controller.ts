import { Middlewares } from '../i-middelwares';
import express, { Request, Response, NextFunction } from 'express';
import { catchHandler, validate } from './controller-util';
import { ComplaintQueryService } from '../../application/query/services/complaint-query-service';
import {
  createComplaintReqBodySchema,
  deleteComplaintReqParamsSchema,
  getAllConplaintsReqParamsSchema,
  getComplaintReqParamsSchema,
  updateComplaintReqBodySchema,
  updateComplaintStatusReqBodySchema,
} from '../requests/complaint-request';
import { ComplaintCommandService } from '../../application/command/services/complaint-command-service';
import { ComplaintMapper } from '../responses/complaint-response';

export const createComplaintController = (
  middlewares: Middlewares,
  complaintQueryService: ComplaintQueryService,
  complaintCommandService: ComplaintCommandService,
) => {
  const path: string = '/complaints';
  const router = express.Router();

  const getComplaint = async (req: Request, res: Response) => {
    const { params } = validate(getComplaintReqParamsSchema, req.params);
    const complaint = await complaintQueryService.getComplaint(params.complaintId);

    return res.status(200).json(complaint);
  };

  const getAllComplaints = async (req: Request, res: Response) => {
    /*
    인증 미들웨어 추가 시 
    const apartmentId = req.user.apartmentId;
    */
    const { params } = validate(getAllConplaintsReqParamsSchema, req.params);
    // const complaints = await complaintQueryService.getAllComplaints(apartmentId, params);

    // return res.status(200).json(complaints);
  };

  const createComplaint = async (req: Request, res: Response) => {
    /*
   인증 미들웨어 추가 시 
   const userId = req.user.userId;
   */
    const { body } = validate(createComplaintReqBodySchema, req.body);
    // const entity = await complaintCommandService.createComplaint(userId, body);
    // const complaint = ComplaintMapper.toResponse(entity);

    // return res.status(201).json(complaint);
  };

  const updateComplaint = async (req: Request, res: Response) => {
    const { params, body } = validate(updateComplaintReqBodySchema, { ...req.params, ...req.body });

    // await complaintCommandService.updateComplaint(params.complaintId, body);

    return res.status(204).json();
  };

  const deleteComplaint = async (req: Request, res: Response) => {
    const { params } = validate(deleteComplaintReqParamsSchema, req.params);
    await complaintCommandService.deleteComplaint(params.complaintId);

    return res.status(204).json();
  };

  const updateComplaintStatus = async (req: Request, res: Response) => {
    const { params, body } = validate(updateComplaintStatusReqBodySchema, {
      ...req.params,
      ...req.body,
    });
    await complaintCommandService.updateComplaintStatus(params.complaintId, body.status);

    return res.status(204).json();
  };

  router.get('/:complaintId', catchHandler(getComplaint));

  router.get('/', catchHandler(getAllComplaints));

  router.post('/', catchHandler(createComplaint));

  router.patch('/:complaintId', catchHandler(updateComplaint));

  router.delete('/:complaintId', catchHandler(deleteComplaint));

  router.patch('/:complaintId/status', catchHandler(updateComplaintStatus));

  return { path, router };
};

export type ComplaintController = ReturnType<typeof createComplaintController>;

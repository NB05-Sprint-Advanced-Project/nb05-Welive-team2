import { Request, Response } from 'express';
import { validate } from '../../../utils/controller-util';
import {
  createComplaintReqBodySchema,
  deleteComplaintReqParamsSchema,
  getAllConplaintsReqParamsSchema,
  getComplaintReqParamsSchema,
  updateComplaintReqBodySchema,
  updateComplaintStatusReqBodySchema,
} from '../dto/complaint-request';
import { ComplaintCommandService } from '../service/complaint-command';
import { ComplaintQueryService } from '../service/complaint-query';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const createComplaintHandlers = (
  middlewares: Middlewares,
  complaintQueryService: ComplaintQueryService,
  complaintCommandService: ComplaintCommandService,
) => {
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
    /*
  인증 미들웨어 추가 시 
  const userId = req.user.userId;
  */
    const { params, body } = validate(updateComplaintReqBodySchema, { ...req.params, ...req.body });

    // await complaintCommandService.updateComplaint(userId, params.complaintId, body);

    return res.status(204).json();
  };

  const deleteComplaint = async (req: Request, res: Response) => {
    /*
  인증 미들웨어 추가 시 
  const userId = req.user.userId;
  */
    const { params } = validate(deleteComplaintReqParamsSchema, req.params);
    // await complaintCommandService.deleteComplaint(userId, params.complaintId);

    return res.status(204).json();
  };

  const updateComplaintStatus = async (req: Request, res: Response) => {
    /*
  인증 미들웨어 추가 시 
  const requesterRole = req.role?;
  */
    const { params, body } = validate(updateComplaintStatusReqBodySchema, {
      ...req.params,
      ...req.body,
    });
    // await complaintCommandService.updateComplaintStatus(requesterRole, params.complaintId, body.status);

    return res.status(204).json();
  };

  return {
    getComplaint,
    getAllComplaints,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    updateComplaintStatus,
  };
};
export type ComplaintHanders = ReturnType<typeof createComplaintHandlers>;

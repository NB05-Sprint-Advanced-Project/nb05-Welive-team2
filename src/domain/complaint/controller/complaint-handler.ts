import { Request, Response } from 'express';
import { validate } from '../../../utils/controller-util';
import {
  createComplaintReqBodySchema,
  deleteComplaintReqParamsSchema,
  getAllConplaintsReqQuerySchema,
  getComplaintReqParamsSchema,
  updateComplaintReqBodySchema,
  updateComplaintStatusReqBodySchema,
} from '../dto/complaint-request';
import { ComplaintCommandService } from '../service/complaint-command';
import { ComplaintQueryService } from '../service/complaint-query';
import { ComplaintMapper } from '../dto/complaint-response';

export const createComplaintHandlers = (
  complaintQueryService: ComplaintQueryService,
  complaintCommandService: ComplaintCommandService,
) => {
  const getComplaint = async (req: Request, res: Response) => {
    const { params } = validate(getComplaintReqParamsSchema, { params: req.params });
    const complaint = await complaintQueryService.getComplaint(params.complaintId);

    return res.status(200).json(complaint);
  };

  const getAllComplaints = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { query } = validate(getAllConplaintsReqQuerySchema, { query: req.query });
    const complaints = await complaintQueryService.getAllComplaints(userId, query);

    return res.status(200).json(complaints);
  };

  const createComplaint = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { body } = validate(createComplaintReqBodySchema, { body: req.body });
    const entity = await complaintCommandService.createComplaint(userId, body);
    const complaint = ComplaintMapper.toResponse(entity);

    return res.status(201).json(complaint);
  };

  const updateComplaint = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { params, body } = validate(updateComplaintReqBodySchema, {
      params: req.params,
      body: req.body,
    });
    await complaintCommandService.updateComplaint(userId, params.complaintId, body);

    return res.status(204).json();
  };

  const deleteComplaint = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const requesterRole = req.user?.role as string;
    const { params } = validate(deleteComplaintReqParamsSchema, { params: req.params });
    await complaintCommandService.deleteComplaint(userId, requesterRole, params.complaintId);

    return res.status(204).json();
  };

  const updateComplaintStatus = async (req: Request, res: Response) => {
    const requesterRole = req.user?.role as string;
    const { params, body } = validate(updateComplaintStatusReqBodySchema, {
      params: req.params,
      body: req.body,
    });
    await complaintCommandService.updateComplaintStatus(
      requesterRole,
      params.complaintId,
      body.status,
    );

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

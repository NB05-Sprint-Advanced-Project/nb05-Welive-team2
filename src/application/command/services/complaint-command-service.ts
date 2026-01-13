import { IComplaintCommandRepo } from '../../ports/repos/command/i-complaint-command-repo';
import { ComplaintEntity, ComplaintStatus } from '../entities/complaint-entity';

export const createComplaintCommandService = (complaintRepo: IComplaintCommandRepo) => {
  const createComplaint = async (
    userId: string,
    args: { title: string; content: string; isPublic: boolean; apartmentId: string },
  ) => {
    const { title, content, isPublic, apartmentId } = args;

    const entity = ComplaintEntity.create({
      title,
      content,
      isPublic,
      apartmentId,
      userId: userId,
    });

    return await complaintRepo.create(entity);
  };

  const updateComplaint = async (
    complaintId: string,
    complaint: { title: string; content: string; isPublic: boolean },
  ) => {
    const beforeContext = await complaintRepo.findById(complaintId);
    const entity = ComplaintEntity.update(beforeContext, complaint);
    await complaintRepo.update(entity);
  };

  const deleteComplaint = async (complaintId: string) => {
    await complaintRepo.remove(complaintId);
  };

  const updateComplaintStatus = async (complaintId: string, status: ComplaintStatus) => {
    const beforeContext = await complaintRepo.findById(complaintId);
    const entity = ComplaintEntity.updateStatus(beforeContext, { status });
    await complaintRepo.updateStatus(entity);
  };

  return { createComplaint, updateComplaint, deleteComplaint, updateComplaintStatus };
};

export type ComplaintCommandService = ReturnType<typeof createComplaintCommandService>;

import { PrismaClient } from '@prisma/client';
import { ComplaintProps } from '../complaint-entity';

export const createComplaintCommandRepo = (prisma: PrismaClient) => {
  const findById = async (complaintId: string) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    return complaint;
  };

  const create = async (entity: ComplaintProps) => {
    const complaint = await prisma.complaint.create({
      data: { ...entity },
      include: {
        complainant: { select: { id: true, name: true } },
      },
    });

    return complaint;
  };

  const update = async (entity: ComplaintProps) => {
    await prisma.complaint.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        content: entity.content,
        isPublic: entity.isPublic,
        updatedAt: entity.updatedAt,
      },
    });
  };

  const remove = async (complaintId: string) => {
    await prisma.complaint.delete({
      where: { id: complaintId },
    });
  };

  const updateStatus = async (entity: ComplaintProps) => {
    await prisma.complaint.update({
      where: { id: entity.id },
      data: {
        status: entity.status,
        updatedAt: entity.updatedAt,
      },
    });
  };

  return { findById, create, update, remove, updateStatus };
};

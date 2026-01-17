import { Prisma, PrismaClient } from '@prisma/client';
import { ComplaintProps } from '../complaint-entity';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { IComplaintCommandRepo } from '../interface/i-complaint-command-repo';

export const createComplaintCommandRepo = (prisma: PrismaClient): IComplaintCommandRepo => {
  const findById = async (complaintId: string) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    return complaint ? complaint : null;
  };

  const create = async (entity: ComplaintProps) => {
    try {
      const complaint = await prisma.complaint.create({
        data: { ...entity },
        include: {
          complainant: { select: { id: true, name: true } },
        },
      });
      return complaint;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = ['Complaint_apartmentId_fkey', 'Complaint_userId_fkey'];

          if (targetConstraints.some((c) => fieldName.includes(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
      throw err;
    }
  };

  const update = async (entity: ComplaintProps) => {
    try {
      await prisma.complaint.update({
        where: { id: entity.id, version: entity.version },
        data: {
          title: entity.title,
          content: entity.content,
          isPublic: entity.isPublic,
          updatedAt: entity.updatedAt,
          version: { increment: 1 },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = ['Complaint_apartmentId_fkey', 'Complaint_userId_fkey'];

          if (targetConstraints.some((c) => fieldName.includes(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
      throw err;
    }
  };

  const deleteComplaint = async (complaintId: string) => {
    try {
      await prisma.complaint.delete({
        where: { id: complaintId },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
      }
      throw err;
    }
  };

  const updateStatus = async (entity: ComplaintProps) => {
    try {
      await prisma.complaint.update({
        where: { id: entity.id, version: entity.version },
        data: {
          status: entity.status,
          updatedAt: entity.updatedAt,
          version: { increment: 1 },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = ['Complaint_apartmentId_fkey', 'Complaint_userId_fkey'];

          if (targetConstraints.some((c) => fieldName.includes(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
      throw err;
    }
  };

  return { findById, create, update, delete: deleteComplaint, updateStatus };
};

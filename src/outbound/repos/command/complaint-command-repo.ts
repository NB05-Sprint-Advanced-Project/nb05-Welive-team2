import { Prisma, PrismaClient } from '@prisma/client';
import { ComplaintProps } from '../../../application/command/entities/complaint-entity';
import { TechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';

export const createComplaintCommandRepo = (prisma: PrismaClient) => {
  const findById = async (complaintId: string) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    return complaint;
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

          if (targetConstraints.some((c) => fieldName.include(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
    }
  };

  const update = async (entity: ComplaintProps) => {
    try {
      await prisma.complaint.update({
        where: { id: entity.id },
        data: {
          title: entity.title,
          content: entity.content,
          isPublic: entity.isPublic,
          updatedAt: entity.updatedAt,
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

          if (targetConstraints.some((c) => fieldName.include(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
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
    }

    const updateStatus = async (entity: ComplaintProps) => {
      try {
        await prisma.complaint.update({
          where: { id: entity.id },
          data: {
            status: entity.status,
            updatedAt: entity.updatedAt,
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
        }
      }
    };

    return { findById, create, update, delete: deleteComplaint, updateStatus };
  };
};

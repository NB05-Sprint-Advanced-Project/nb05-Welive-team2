import { Prisma, PrismaClient } from '@prisma/client';
import { ComplaintListFilter, IComplaintQueryRepo } from '../interface/i-complaint-query-repo';
import { ComplaintView } from '../dto/complaint-veiw';
import { PageView } from '../../../shared/interface/i-page-view';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';

export const createComplaintQueryRepo = (prisma: PrismaClient): IComplaintQueryRepo => {
  const findById = async (complaintId: string): Promise<ComplaintView> => {
    try {
      const complaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: { viewsCount: { increment: 1 } },
        include: {
          apartment: true,
          complainant: true,
          _count: {
            select: { comment: true },
          },
        },
      });

      const commentCount = complaint._count.comment;

      return {
        id: complaint.id,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        title: complaint.title,
        content: complaint.content,
        status: complaint.status,
        isPublic: complaint.isPublic,
        viewsCount: complaint.viewsCount,
        apartmentId: complaint.apartmentId,
        complainant: {
          id: complaint.complainant.id,
          name: complaint.complainant.name,
        },
        commentCount,
      };
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

  const findAll = async (
    apartmentId: number,
    page: number,
    limit: number,
    filter: ComplaintListFilter,
  ): Promise<PageView<ComplaintView>> => {
    try {
      const skip = (page - 1) * limit;

      const { status, isPublic, searchKeyword, building, unit } = filter;

      const where: any = {
        apartmentId: apartmentId,
        status: status ?? undefined,
        isPublic: isPublic ?? undefined,
        building: building ?? undefined,
        unit: unit ?? undefined,
        ...(searchKeyword && {
          OR: [
            { title: { contains: searchKeyword, mode: 'insensitive' } },
            { content: { contains: searchKeyword, mode: 'insensitive' } },
            { complainant: { name: { contains: searchKeyword, mode: 'insensitive' } } },
          ],
        }),
      };

      const [complaints, totalCount] = await Promise.all([
        prisma.complaint.findMany({
          where,
          include: {
            complainant: true,
            _count: { select: { comment: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.complaint.count({ where }),
      ]);

      const data: ComplaintView[] = complaints.map((complaint) => ({
        id: complaint.id,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        title: complaint.title,
        content: complaint.content,
        status: complaint.status,
        isPublic: complaint.isPublic,
        viewsCount: complaint.viewsCount,
        apartmentId: complaint.apartmentId,
        complainant: {
          id: complaint.complainant.id,
          name: complaint.complainant.name,
        },
        commentCount: complaint._count.comment,
      }));

      return {
        data,
        totalCount,
        page,
        limit,
        hasNext: totalCount > page * limit,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;

          if (fieldName.includes('Complaint_apartmentId_fkey')) {
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
  return {
    findById,
    findAll,
  };
};

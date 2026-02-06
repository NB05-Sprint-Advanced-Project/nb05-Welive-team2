import { PrismaClient, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../shared/base-command-repo';
import { IStateCommandRepo } from '../interface/i-state-command-repo';
import { NotificationStateProps, StateProps, StatusType, WorkType } from '../entity/state';

export const createStateCommandRepo = (prismaClient: PrismaClient): IStateCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const findAllByStatus = async (status: StatusType): Promise<StateProps[]> => {
    const states = await prisma().state.findMany({
      where: {
        status: status,
      },
    });

    return states.map((state) => ({
      id: state.id,
      workType: state.type as WorkType,
      status: state.status as StatusType,
      payload: state.payload as unknown as JSON,
    }));
  };

  const create = async (entity: NotificationStateProps): Promise<void> => {
    await prisma().state.create({
      data: {
        id: entity.id,
        type: entity.workType,
        status: entity.status,
        payload: entity.payload as unknown as Prisma.InputJsonValue, // <=== @ 인성님 스타일로 하고 싶으시면 나중에 mapper 추가해주세요 :)
      },
    });

    return;
  };

  const bulkUpdate = async (ids: string[]): Promise<void> => {
    await prisma().state.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: StatusType.PROCESSED,
      },
    });
  };

  const remove = async () => {
    await prisma().state.deleteMany({
      where: {
        status: StatusType.PROCESSED,
      },
    });
  };

  return {
    create,
    findAllByStatus,
    bulkUpdate,
    delete: remove,
  };
};

export type StateCommandRepo = ReturnType<typeof createStateCommandRepo>;

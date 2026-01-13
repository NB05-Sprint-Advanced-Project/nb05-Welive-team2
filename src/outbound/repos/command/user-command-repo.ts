import { Prisma, PrismaClient } from '@prisma/client';
import { BaseUserProps } from '../../../application/command/entities/user/base-user-entity';
import { IUserCommandRepo } from '../../../application/ports/repos/command/i-user-command-repo';
import { toBaseUserEntity, toUpdateAvatarData } from '../../mapper/user-mapper';
import { TechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';

const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: true,
});

export type PersistUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export const createUserCommandRepo = (prismaClient: PrismaClient): IUserCommandRepo => {
  const findUserById = async (id: string): Promise<BaseUserProps | null> => {
    const user = await prismaClient.user.findUnique({
      where: { id },
      include: userInclude,
    });
    return user ? toBaseUserEntity(user) : null;
  };

  const updateAvatar = async (entity: BaseUserProps): Promise<void> => {
    const updateAvatarData = toUpdateAvatarData(entity);

    const result = await prismaClient.user.updateMany({
      where: {
        id: entity.id,
        version: entity.version,
      },
      data: {
        ...updateAvatarData,
        version: { increment: 1 },
      },
    });

    // 성공
    if (result.count === 1) {
      return;
    }

    const exists = await prismaClient.user.findUnique({
      where: { id: entity.id },
      select: { id: true }, // id 컬럼만 존재하는지 보기, 다른 컬럼은 안봄
    });

    // P2025 중에서도 해당 유저가 없을 때
    if (!exists) {
      throw TechnicalException({
        type: TechnicalExceptionType.ROW_NOT_FOUND,
      });
    }

    // P2025 중에서도 다른 변경이 감지되었을 때
    throw TechnicalException({
      type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
    });
  };

  return {
    findUserById,
    updateAvatar,
  };
};
export type UserCommandRepo = ReturnType<typeof createUserCommandRepo>;

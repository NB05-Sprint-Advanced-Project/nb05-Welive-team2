import {
  BaseUserEntity,
  BaseUserProps,
  Role,
} from '../../application/command/entities/user/base-user-entity';
import { PersistUser } from '../repos/command/user-command-repo';
import { UserApartmentLinkVO } from '../../application/command/entities/user/user-apartment-link-vo';

export type UpdateAvatarUrlData = {
  avatarUrl: string;
};
export const toUpdateAvatarData = (entity: BaseUserProps): UpdateAvatarUrlData => {
  return {
    avatarUrl: entity.avatarUrl!,
  };
};

export const toBaseUserEntity = (DBUserEntity: PersistUser): BaseUserProps => {
  return BaseUserEntity.restore({
    id: DBUserEntity.id,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    avatarUrl: DBUserEntity.avatarUrl ?? undefined,
    role: DBUserEntity.role as unknown as Role, // 이미 생성할 때 검증된 값
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create({ apartmentId: row.apartmentId }),
    ),
  });
};

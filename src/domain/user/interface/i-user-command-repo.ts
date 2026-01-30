import { AdminAccountProps } from '../entity/admin-account';
import { BaseAllUserProps, Role } from '../entity/base-user';
import { NotJoinedResidentProps } from '../entity/not-joined-resident';
import { ResidentAccountProps } from '../entity/resident-account';

export interface IUserCommandRepo {
  findUserByRole: (role: Role) => Promise<BaseAllUserProps[]>;

  findAdminUserById: (id: string) => Promise<AdminAccountProps | null>;

  findResidentAccountUserById: (id: string) => Promise<ResidentAccountProps | null>;

  findBaseUserById: (id: string) => Promise<BaseAllUserProps | null>;

  findJoinedUserById: (id: string) => Promise<AdminAccountProps | ResidentAccountProps | null>;

  findPendingAdminUsers: () => Promise<AdminAccountProps[] | null>;

  findRejectedAdminUsers: () => Promise<AdminAccountProps[] | null>;

  findPendingResidentUsers: () => Promise<ResidentAccountProps[] | null>;

  findNotJoinedResidentByEmail: (email: string) => Promise<NotJoinedResidentProps | null>;

  findResidentById: (id: string) => Promise<ResidentAccountProps | NotJoinedResidentProps | null>;

  /**
   *  @ throws UNIQUE_VIOLATION_EMAIL
   *  @ throws UNIQUE_VIOLATION_USERNAME
   *  @ throws UNIQUE_VIOLATION_CONTACT
   *  @ throws UNIQUE_VIOLATION
   */
  create: (
    entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
  ) => Promise<void>;

  createManyBulk(entities: NotJoinedResidentProps[]): Promise<number>;

  /**
   *  @ throws OPTIMISTIC_LOCK_FAILED
   *  @ throws UNIQUE_VIOLATION_USERNAME
   *  @ throws UNIQUE_VIOLATION_CONTACT
   */
  update: (
    entity: AdminAccountProps | NotJoinedResidentProps | ResidentAccountProps,
  ) => Promise<void>;

  /**
   *  @ throws OPTIMISTIC_LOCK_FAILED
   */
  updateAvatar: (entity: BaseAllUserProps) => Promise<void>;

  /**
   *  단 건
   *  @ throws OPTIMISTIC_LOCK_FAILED
   */
  updateJoinedStatus: (
    entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
  ) => Promise<void>;

  /**
   *  다 건
   * update가 아닌 updateMany으로 사용해서 낙관적 락이 발생하면 P2025가 발생을 안 하고 count = 0으로 업데이트가 안된 정상 응답을 돌려줌
   * lost update가 발생해서 P2025가 발생해도 에러를 안 던지고 그냥 처리된 거로 설계
   * 예시
   *  - 처리 중 상태(시작점) => 중간에 승인 상태 처리 하면 => 승인 상태 (중간에 처리되어도 상관 없음)
   *  - 처리 중 상태(시작점) => 중간에 승인 상태 처리 하면 => 거절 상태 (중간에 처리되어도 상관 없음)
   *  - 개인이 회원 탈퇴를 못하고  관리자가 회원 탈퇴하는 상태이다.
   *    - 시작점이 승인 상태와 거절 상태인 경우는 없다고 설계함
   */
  updateJoinedStatuses: (entities: AdminAccountProps[] | ResidentAccountProps[]) => Promise<void>;

  /**
   *  @ throws OPTIMISTIC_LOCK_FAILED
   */
  updatePassword: (entity: AdminAccountProps | ResidentAccountProps) => Promise<void>;

  deleteUser: (id: string) => Promise<void>;

  deleteUsers: () => Promise<void>;
}

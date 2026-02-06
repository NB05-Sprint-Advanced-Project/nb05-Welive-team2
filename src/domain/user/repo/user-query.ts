import { PrismaClient } from '@prisma/client';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { Role, Status } from '../entity/base-user';
import {
  ResidentAccountView,
  ResidentsView,
  ResidentView,
  ResidentViewForCSV,
} from '../dto/view/resident';
import { userInclude } from '../user-mapper';
import { ExportResidentsReqDto, GetResidentsReqDto } from '../dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { LoginView } from '../../auth/controller/view/log-in';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';

export const createUserQueryRepo = (prisma: PrismaClient): IUserQueryRepo => {
  const findAllAdmins = async (
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ) => {
    const skip = (page - 1) * limit;

    const where = {
      role: Role.ADMIN,
      ...(searchKeyword && {
        OR: [
          { name: { contains: searchKeyword } },
          { email: { contains: searchKeyword } },
          {
            UserApartmentLink: {
              some: {
                apartment: {
                  name: { contains: searchKeyword },
                },
              },
            },
          },
          {
            UserApartmentLink: {
              some: {
                apartment: {
                  address: { contains: searchKeyword },
                },
              },
            },
          },
        ],
      }),
      ...(joinStatus && { joinedStatus: { equals: joinStatus } }),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          UserApartmentLink: {
            include: { apartment: true },
          },
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        contact: user.contact,
        name: user.name,
        joinStatus: user.joinedStatus, // align with AdministratorView
        adminOf: user.UserApartmentLink.map((link) => ({
          id: link.apartment.id,
          name: link.apartment.name,
          address: link.apartment.address,
          description: link.apartment.description,
          officeNumber: link.apartment.officeNumber,
        }))[0],
      })),
      totalCount,
      page,
      limit,
      hasNext: page * limit < totalCount,
    };
  };

  const findByUsername = async (username: string): Promise<LoginView | null> => {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        UserApartmentLink: {
          include: { apartment: true },
        },
        Address: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username!,
      password: user.password!,
      email: user.email,
      contact: user.contact,
      name: user.name,
      role: user.role,
      avatar: user.avatarUrl || '',
      joinStatus: user.joinedStatus as Status,
      isActive: true,
      adminOf:
        user.UserApartmentLink.length > 0
          ? {
              id: user.UserApartmentLink[0].apartmentId,
              name: user.UserApartmentLink[0].apartment.name,
            }
          : undefined,
      resident:
        user.UserApartmentLink.length > 0 && user.Address
          ? {
              id: user.id,
              apartmentId: user.UserApartmentLink[0].apartmentId,
              building: user.Address.building,
              unit: user.Address.unit,
              isHouseholder: user.Address.isHouseholder,
            }
          : undefined,
    };
  };

  const findNotJoinedResidentByEmail = async (email: string): Promise<ResidentView | null> => {
    const notJoinedResident = await prisma.user.findUnique({
      where: { email },
      include: userInclude,
    });

    if (!notJoinedResident) {
      return null;
    }

    return {
      id: notJoinedResident.id,
      userId: notJoinedResident.id,
      email: notJoinedResident.email,
      contact: notJoinedResident.contact,
      name: notJoinedResident.name,
      building: notJoinedResident.Address!.building,
      unit: notJoinedResident.Address!.unit,
      isHouseholder: notJoinedResident.Address!.isHouseholder,
      createdAt: notJoinedResident.createdAt,
    };
  };

  const findResidentById = async (id: string): Promise<ResidentView | null> => {
    const resident = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!resident) {
      return null;
    }

    return {
      id: resident.id,
      userId: resident.joinedStatus === Status.NOT_JOINED ? null : resident.id,
      email: resident.email,
      contact: resident.contact,
      name: resident.name,
      building: resident.Address!.building,
      unit: resident.Address!.unit,
      isHouseholder: resident.Address!.isHouseholder,
      createdAt: resident.createdAt,
    };
  };

  const findResidents = async (dto: GetResidentsReqDto): Promise<ResidentsView> => {
    const link = await prisma.userApartmentLink.findFirst({
      where: { userId: dto.userId },
      select: { apartmentId: true },
    });

    if (!link) {
      throw BusinessException({
        type: BusinessExceptionType.APARTMENT_NOT_FOUND,
      });
    }

    const apartmentId = link.apartmentId;

    const joinedStatus =
      dto.isRegistered === undefined
        ? { in: [Status.NOT_JOINED, Status.APPROVED] }
        : dto.isRegistered
          ? Status.APPROVED
          : Status.NOT_JOINED;

    const where = {
      joinedStatus,
      Address: {
        is: {
          ...(dto.building !== undefined && { building: dto.building }),
          ...(dto.unit !== undefined && { unit: dto.unit }),
          ...(dto.isHouseholder !== undefined && { isHouseholder: dto.isHouseholder }),
        },
      },
      ...(dto.searchKeyword && {
        OR: [
          { name: { contains: dto.searchKeyword } },
          { contact: { contains: dto.searchKeyword } },
          { email: { contains: dto.searchKeyword } },
        ],
      }),
      UserApartmentLink: {
        some: {
          apartmentId,
        },
      },
    };

    const [residents, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        include: userInclude,
      }),
      prisma.user.count({
        where,
      }),
    ]);

    return {
      data: residents.map((resident) => ({
        id: resident.id,
        userId: resident.joinedStatus === Status.NOT_JOINED ? null : resident.id,
        email: resident.email,
        contact: resident.contact,
        name: resident.name,
        building: resident.Address!.building,
        unit: resident.Address!.unit,
        isHouseholder: resident.Address!.isHouseholder,
        createdAt: resident.createdAt,
      })),
      totalCount: totalCount,
      page: dto.page,
      limit: dto.limit,
      hasNext: dto.page * dto.limit < totalCount,
    };
  };

  const findResidentsForExport = async (
    dto: ExportResidentsReqDto,
  ): Promise<ResidentViewForCSV[]> => {
    const joinedStatus =
      dto.isRegistered === undefined
        ? { in: [Status.NOT_JOINED, Status.APPROVED] }
        : dto.isRegistered
          ? Status.APPROVED
          : Status.NOT_JOINED;
    const where = {
      joinedStatus,
      Address: {
        is: {
          ...(dto.building !== undefined && { building: dto.building }),
          ...(dto.unit !== undefined && { unit: dto.unit }),
          ...(dto.isHouseholder !== undefined && { isHouseholder: dto.isHouseholder }),
        },
      },
      ...(dto.searchKeyword && {
        OR: [
          { name: { contains: dto.searchKeyword } },
          { contact: { contains: dto.searchKeyword } },
          { email: { contains: dto.searchKeyword } },
        ],
      }),
    };

    const residents = await prisma.user.findMany({
      where,
      include: userInclude,
    });

    return residents.map((resident) => ({
      name: resident.name,
      contact: resident.contact,
      email: resident.email,
      building: resident.Address!.building,
      unit: resident.Address!.unit,
      isHouseholder: resident.Address!.isHouseholder,
    }));
  };

  const findResidentAccounts = async (
    dto: GetResidentAccountsReqDto,
  ): Promise<ResidentAccountView> => {
    const link = await prisma.userApartmentLink.findFirst({
      where: { userId: dto.userId },
      select: { apartmentId: true },
    });

    if (!link) {
      throw BusinessException({
        type: BusinessExceptionType.APARTMENT_NOT_FOUND,
      });
    }

    const apartmentId = link.apartmentId;

    const joinedStatus =
      dto.joinStatus === undefined
        ? { in: [Status.PENDING, Status.APPROVED, Status.REJECTED] }
        : dto.joinStatus === Status.APPROVED
          ? Status.APPROVED
          : dto.joinStatus === Status.PENDING
            ? Status.PENDING
            : Status.REJECTED;

    const where = {
      joinedStatus,
      Address: {
        is: {
          ...(dto.building !== undefined && { building: dto.building }),
          ...(dto.unit !== undefined && { unit: dto.unit }),
        },
      },
      ...(dto.searchKeyword && {
        OR: [{ name: { contains: dto.searchKeyword } }, { email: { contains: dto.searchKeyword } }],
      }),
      UserApartmentLink: {
        some: {
          apartmentId,
        },
      },
    };

    const [residentAccounts, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        include: userInclude,
      }),
      prisma.user.count({
        where,
      }),
    ]);

    return {
      data: residentAccounts.map((residentAccount) => ({
        id: residentAccount.id,
        email: residentAccount.email,
        contact: residentAccount.contact,
        name: residentAccount.name,
        joinStatus: residentAccount.joinedStatus as
          | Status.APPROVED
          | Status.PENDING
          | Status.REJECTED,
        resident: {
          id: residentAccount.id,
          building: residentAccount.Address!.building,
          unit: residentAccount.Address!.unit,
        },
      })),
      totalCount: totalCount,
      page: dto.page,
      limit: dto.limit,
      hasNext: dto.page * dto.limit < totalCount,
    };
  };

  const findApartmentIdByUserId = async (userId: string): Promise<string | null> => {
    const link = await prisma.userApartmentLink.findFirst({
      where: { userId },
      select: { apartmentId: true },
    });
    return link?.apartmentId ?? null;
  };

  return {
    findAllAdmins,
    findByUsername,
    findNotJoinedResidentByEmail,
    findResidentById,
    findResidents,
    findResidentAccounts,
    findResidentsForExport,
    findApartmentIdByUserId,
  };
};

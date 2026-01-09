import { Role, Status } from "@prisma/client";
import { CreateAdminDto, CreateSuperAdminDto, UpdateAdminDto } from "../../../inbound/requests/admin-request";
import { AdminDto, SuperAdminDto } from "../../../inbound/responses/admin-response";
import { IAdminCommandRepo } from "../../ports/repos/command/i-admin-command-repo";
import { IApartmentCommandRepo } from "../../ports/repos/command/i-apartment-command-repo";
import { ApartmentEntity } from "../entities/apartment/apartment-entity";
import { UserEntity } from "../entities/user/user-entity";

export const createAdminCommandService = (
    adminRepo: IAdminCommandRepo,
    apartmentRepo: IApartmentCommandRepo
) => {
    const createSuperAdmin = async (dto: CreateSuperAdminDto): Promise<SuperAdminDto> => {
        const userEntity = UserEntity.create({
            username: dto.username,
            password: dto.password,
            name: dto.name,
            email: dto.email,
            contact: dto.contact,
            role: Role.SUPERADMIN,
            joinedStatus: Status.APPROVED,
            hashManager: IHashManager;
            residentAddress?: ResidentAddressFields;



        })

        const superAdmin = await adminRepo.createSuperAdmin(userEntity);
        return superAdmin;
    }

    const createAdmin = async (dto: CreateAdminDto): Promise<AdminDto> => {
        // 1. 아파트 생성
        const apartmentEntity = ApartmentEntity.create({
            name: dto.adminOf.name,
            address: dto.adminOf.address,
            description: dto.adminOf.description,
            officeNumber: dto.adminOf.officeNumber,
            buildingNumberFrom: dto.adminOf.buildingNumberFrom,
            buildingNumberTo: dto.adminOf.buildingNumberTo,
            floorCountPerBuilding: dto.adminOf.floorCountPerBuilding,
            unitCountPerFloor: dto.adminOf.unitCountPerFloor
        })

        const apartment = await apartmentRepo.create(apartmentEntity);


        // 2. 관리자 계정 생성
        const userEntity = createUserEntity({
            username: dto.username,
            email: dto.email,
            contact: dto.contact,
            name: dto.name,
            password: dto.password,
            apartmentId: apartment.id
        });

        const user = await adminRepo.createAdmin(userEntity);

        return {
            username: user.username,
            email: user.email,
            contact: user.contact,
            name: user.name,
            password: user.password,
            adminOf: [{
                name: apartment.name,
                address: apartment.address,
                description: apartment.description,
                officeNumber: apartment.officeNumber,
                buildingNumberFrom: apartment.buildingNumberFrom,
                buildingNumberTo: apartment.buildingNumberTo,
                floorCountPerBuilding: apartment.floorCountPerBuilding,
                unitCountPerFloor: apartment.unitCountPerFloor
            }]
        }
    }


    const updateAdmin = async (dto: UpdateAdminDto): Promise<AdminDto> => {
        // 1. 특정 Admin 계정 가져오기
        const user = adminRepo.findAdminById(dto.adminId);

        // 2. 유저 정보 수정
        adminRepo.update(dto);


        // 2. 해당 Admin 유저 업데이트
        user.update({
            email: dto.email,
            contact: dto.contact,
            name: dto.name,
            adminOf: {
                name: dto.adminOf.name,
                address: dto.adminOf.address,
                description: dto.adminOf.description,
                officeNumber: dto.adminOf.officeNumber
            }
        })


        // 3. 해당 Apartment 주소 변경
        adminRepo.updateAdmin(user);
    }


    const approveAllAdmins = async (status: Status) => {
        return adminRepo.approveAllAdmin(status);
    }



    const approveAdmin = async (status: Status) => {
        return adminRepo.approveAdmin(status);
    }


    return {
        createSuperAdmin,
        createAdmin,
        updateAdmin,
        approveAllAdmins,
        approveAdmin
    };
};

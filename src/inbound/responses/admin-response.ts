export interface SuperAdminDto {
    username: string,
    email: string,
    contact: string,
    name: string,
    password: string
}



export interface AdminDto {
    username: string,
    email: string,
    contact: string,
    name: string,
    password: string,
    adminOf: {
        name: string,
        address: string,
        description: string,
        officeNumber: string,
        buildingNumberFrom: number,
        buildingNumberTo: number,
        floorCountPerBuilding: number,
        unitCountPerFloor: number
    }[]
}

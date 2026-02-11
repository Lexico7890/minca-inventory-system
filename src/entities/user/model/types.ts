export interface UserLocation {
    id_localizacion: string;
    nombre: string;
}

export enum ROLES {
    ADMIN = 'admin',
    TECNICO = 'tecnico',
    SUPERVISOR = 'superuser',
}
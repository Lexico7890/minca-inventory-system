export interface ScooterType {
    id: string;
    name: string;
    power: string;
    created_at: string;
}

export interface OrderFollow {
    id: number;
    created_at: string;
    number: number;
    id_scooter_type: string;
    level: number;
    is_finish: boolean;
    updated_at: string | null;
}

export interface ViewOrderFollow {
    id: number;
    created_at: string;
    number: number;
    nombre_scooter: string;
    potencia: string;
    level: number;
    is_finish: boolean;
    updated_at: string | null;
}

export interface CreateOrderFollowPayload {
    number: number;
    id_scooter_type: string;
    level: number;
}

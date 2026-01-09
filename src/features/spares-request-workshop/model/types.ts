import type { Destination } from "@/shared/model";

export interface CartItem {
    id_item_carrito: string;
    id_usuario: string;
    id_localizacion: string;
    cantidad: number;
    created_at: string;
    nombre_solicitante: string;
    rol_solicitante: string;
    id_repuesto: string;
    referencia: string;
    nombre_repuesto: string;
    url_imagen: string | null;
    stock_actual_en_taller: number;
}

export interface RequestsState {
    cartItems: CartItem[];
    destinations: Destination[];
    isLoading: boolean;

    setDestinations: (destinations: Destination[]) => void;
    loadCart: (locationId: string) => Promise<void>;
    addItemToCart: (userId: string, locationId: string, repuestoId: string, quantity?: number) => Promise<void>;
    removeItemFromCart: (cartItemId: string) => Promise<void>;
    clearCartAfterSubmit: (cartItemIds: string[]) => Promise<void>;
}

export interface CreateRequestData {
    id_localizacion_origen: string;
    id_localizacion_destino: string;
    id_usuario_solicitante: string;
    observaciones_generales: string;
    items: Array<{ id_repuesto: string; cantidad: number }>;
}
import type { CartItem } from "@/entities/requests";
import type { Destination } from "@/shared/model";

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

export interface RequestContext {
    origen: string;
    destino: string;
    solicitante: string;
}
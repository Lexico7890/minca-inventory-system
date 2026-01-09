export interface RequestHistoryItem {
    id_solicitud: string;
    fecha_creacion: string;
    estado: string;
    observaciones_generales: string;
    id_localizacion_destino: number;
    nombre_destino: string;
    id_localizacion_origen: number;
    nombre_origen: string;
    id_usuario_solicitante: string;
    nombre_solicitante: string;
}

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
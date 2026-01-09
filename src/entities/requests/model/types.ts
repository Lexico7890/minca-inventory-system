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
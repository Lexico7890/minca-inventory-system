import { ROLES } from "@/entities/user";
import { supabase } from "@/shared/api";

export async function getTechniciansByLocation(locationId: string) {
    const { data, error } = await supabase
        .from('v_tecnicos_por_localizacion')
        .select('id_usuario, nombre_usuario')
        .eq('id_localizacion', locationId)
        .eq('nombre_rol', ROLES.TECNICO);

    if (error) {
        console.error('Error fetching technicians:', error);
        throw new Error(error.message);
    }

    return data;
}
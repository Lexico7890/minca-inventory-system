import { supabase } from "@/shared/api";
import type { Destination } from "@/shared/model";

export async function getLocations(): Promise<Destination[]> {
    const { data, error } = await supabase
        .from('localizacion')
        .select('id_localizacion, nombre, telefono');

    if (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }

    return data || [];
}
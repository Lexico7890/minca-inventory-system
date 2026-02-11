import { useUserStore } from "@/entities/user";
import { supabase } from "@/shared/api";


export async function getGarantiasDashboard() {
    const selectedLocationId = useUserStore.getState().selectedLocationId;
    const { data, error } = await supabase
        .from('v_garantias_dashboard')
        .select('*')
        .eq('id_localizacion', selectedLocationId)
        .order('fecha_reporte', { ascending: false });

    if (error) {
        console.error('Error fetching warranties dashboard:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function updateGuaranteeStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('garantias')
        .update({
            estado: status,
            updated_at: new Date().toISOString()
        })
        .eq('id_garantia', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating guarantee status:', error);
        throw new Error(error.message);
    }

    return data;
}
import { supabase } from "@/shared/api";
import type { RequestHistoryItem } from "../model/types";

export async function getRequestHistory(): Promise<RequestHistoryItem[]> {
    const { data, error } = await supabase
        .from('v_historial_solicitudes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

    if (error) {
        console.error('Error fetching request history:', error);
        throw error;
    }

    return data || [];
}
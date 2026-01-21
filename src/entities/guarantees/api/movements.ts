import { supabase } from "@/shared/api";

interface GuaranteesMovementsFilters {
    page?: number;
    pageSize?: number;
}

export async function getGuaranteesMovements(filters: GuaranteesMovementsFilters) {
    const {
        page = 1,
        pageSize = 10,
    } = filters;

    const id_localizacion = localStorage.getItem('minca_location_id');
    if (!id_localizacion) {
        console.warn("ID de localización no encontrado, es posible que la consulta no devuelva resultados.");
        // Consider returning empty data or throwing an error if location is mandatory
        return { data: [], count: 0 };
    }


    // El nombre de la columna para el concepto en 'vista_timeline_repuesto' es 'tipo_movimiento'
    // y el valor para garantía es 'salida_garantia'.
    let query = supabase
        .from('vista_timeline_repuesto')
        .select(`
            fecha_movimiento,
            metadata->>referencia_repuesto as referencia,
            metadata->>numero_orden as orden,
            metadata->>tecnico_asignado as tecnico,
            cantidad
        `, { count: 'exact' })
        .eq('tipo_movimiento', 'salida_garantia')
        .eq('id_localizacion', id_localizacion);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
        .order('fecha_movimiento', { ascending: false })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching guarantees movements:', error);
        throw new Error(error.message);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: data as any[], count: count ?? 0 };
}

import { supabase } from '@/shared/api/supabase';
import type { PaginatedRepuestosResponse, Repuesto, RepuestoFormData, RepuestosParams } from '../model/types';

export async function getRepuestos(params: RepuestosParams = {}): Promise<PaginatedRepuestosResponse> {
    const {
        page = 1,
        limit = 10,
        search,
        tipo,
        descontinuado,
        order_by = 'fecha_ingreso_inventario',
        direction = 'desc',
    } = params;

    const offset = (page - 1) * limit;

    let query = supabase
        .from('repuestos')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`nombre.ilike.%${search}%,referencia.ilike.%${search}%`);
    }

    if (tipo && tipo !== 'all') {
        query = query.eq('tipo', tipo);
    }

    if (descontinuado !== undefined) {
        query = query.eq('descontinuado', descontinuado);
    }

    query = query.order(order_by, { ascending: direction === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching repuestos:', error);
        throw new Error(error.message);
    }

    const totalCount = count || 0;
    const pageCount = Math.ceil(totalCount / limit);

    return {
        items: (data as Repuesto[]) || [],
        total_count: totalCount,
        page,
        limit,
        page_count: pageCount,
    };
}

export async function createRepuesto(data: RepuestoFormData): Promise<Repuesto> {
    const { data: newRepuesto, error } = await supabase
        .from('repuestos')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating repuesto:', error);
        throw new Error(error.message);
    }

    return newRepuesto;
}

export async function updateRepuesto(id: string, data: Partial<RepuestoFormData>): Promise<Repuesto> {
    const { data: updatedRepuesto, error } = await supabase
        .from('repuestos')
        .update(data)
        .eq('id_repuesto', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating repuesto:', error);
        throw new Error(error.message);
    }

    return updatedRepuesto;
}

export async function deleteRepuesto(id: string): Promise<void> {
    const { error } = await supabase
        .from('repuestos')
        .delete()
        .eq('id_repuesto', id);

    if (error) {
        console.error('Error deleting repuesto:', error);
        throw new Error(error.message);
    }
}


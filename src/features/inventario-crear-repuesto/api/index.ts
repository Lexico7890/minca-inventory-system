import { supabase } from "@/shared/api";

/**
 * Create a new inventory item
 */
export async function createInventoryItem(data: { id_repuesto: string, id_localizacion: string, cantidad: number, posicion?: string, nuevo_hasta?: string }) {
    const { error } = await supabase
        .from('inventario')
        .insert(data);

    if (error) {
        console.error('Error creating inventory item:', error);
        throw new Error(error.message);
    }
}
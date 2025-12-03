import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { TechnicalMovement } from '@/types/technical-movement';
import { handleSupabaseError } from '@/lib/error-handler';

export function useCreateTechnicalMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMovement: TechnicalMovement) => {
      // 1. Preparamos los parámetros exactos que pide la función RPC
      const rpcParams = {
        p_id_localizacion: newMovement.id_localizacion,
        p_id_repuesto: newMovement.id_repuesto,
        p_id_usuario_responsable: newMovement.id_usuario_responsable,
        p_concepto: newMovement.concepto,
        p_tipo: newMovement.tipo,
        p_cantidad: newMovement.cantidad,
        p_numero_orden: newMovement.numero_orden || null,
        p_descargada: newMovement.descargada || false
      };

      // 2. Llamamos a la función RPC en lugar de hacer .insert()
      const { data, error } = await supabase
        .rpc('registrar_movimiento_tecnico', rpcParams);

      // 3. Manejo de errores de Red/Supabase
      if (error) throw error;

      // 4. Manejo de errores de Negocio (Ej: "Stock insuficiente")
      // La función RPC devuelve { success: false, message: "..." } si algo falla lógicamente.
      if (!data.success) {
        throw new Error(data.message); 
      }

      // 5. Retornamos el objeto completo con el ID real generado por la BD
      return { 
        ...newMovement, 
        id_movimientos_tecnicos: data.id_movimiento 
      };
    },
    
    // ... El resto de tu código (onMutate, onError, onSettled) se mantiene igual ...
    // Solo asegúrate de que el Optimistic Update maneje bien la estructura
    onMutate: async (newMovement) => {
      await queryClient.cancelQueries({ queryKey: ['technical-movements'] });
      const previousMovements = queryClient.getQueryData(['technical-movements']);

      queryClient.setQueryData(['technical-movements'], (old: any) => {
        // Usamos un ID temporal para la UI mientras responde el servidor
        const tempItem = { ...newMovement, id_movimientos_tecnicos: 'temp-' + Date.now() };
        if (!old) return [tempItem];
        return [tempItem, ...old];
      });

      return { previousMovements };
    },
    
    onError: (error: Error, _newMovement, context) => { // Tipar error como Error
      if (context?.previousMovements) {
        queryClient.setQueryData(['technical-movements'], context.previousMovements);
      }
      // Mostrar el mensaje de error que viene de la BD (Ej: "Stock insuficiente")
      toast.error(error.message); 
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-movements'] });
      // También es buena idea refrescar el inventario ya que cambió el saldo
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    
    onSuccess: () => {
      toast.success('Movimiento técnico registrado exitosamente');
    },
  });
}

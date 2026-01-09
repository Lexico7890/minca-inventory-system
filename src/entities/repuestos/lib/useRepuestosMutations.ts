import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRepuesto, deleteRepuesto, updateRepuesto } from "../api";
import { REPUESTOS_KEYS } from "../constants";
import { toast } from "sonner";
import type { RepuestoFormData } from "../model/types";

export function useRepuestosMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createRepuesto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
            toast.success('Repuesto creado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al crear repuesto: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<RepuestoFormData> }) =>
            updateRepuesto(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
            toast.success('Repuesto actualizado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al actualizar repuesto: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRepuesto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REPUESTOS_KEYS.lists() });
            toast.success('Repuesto eliminado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al eliminar repuesto: ${error.message}`);
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
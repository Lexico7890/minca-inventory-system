import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api/supabase";
import type { CreateOrderFollowPayload, ScooterType, ViewOrderFollow } from "../model/types";
import { toast } from "sonner";

export const useScooterTypes = () => {
    return useQuery({
        queryKey: ["scooterTypes"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("scooter_types")
                .select("*")
                .order("name");

            if (error) throw error;
            return data as ScooterType[];
        },
    });
};

export const useOrderFollowList = () => {
    return useQuery({
        queryKey: ["orderFollowList"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("view_order_follow")
                .select("*")
                .eq("is_finish", false)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as ViewOrderFollow[];
        },
    });
};

export const useCreateOrderFollow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateOrderFollowPayload) => {
            const { data, error } = await supabase
                .from("order_follow")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success("Registro creado exitosamente");
            queryClient.invalidateQueries({ queryKey: ["orderFollowList"] });
        },
        onError: (error) => {
            console.error(error);
            toast.error("Error al crear el registro: " + error.message);
        },
    });
};

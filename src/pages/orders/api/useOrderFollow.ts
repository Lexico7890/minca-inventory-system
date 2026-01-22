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

interface Filters {
    order?: string;
    scooterType?: string;
    level?: number;
    page?: number;
    pageSize?: number;
}

export const useOrderFollowList = ({
    filters,
}: {
    filters: Filters;
}) => {
    return useQuery({
        queryKey: ["orderFollowList", filters],
        queryFn: async () => {
            let query = supabase
                .from("view_order_follow")
                .select("*", { count: "exact" })
                .eq("is_finish", false)
                .order("created_at", { ascending: true });

            if (filters.order) {
                query = query.ilike("number", `%${filters.order}%`);
            }

            if (filters.scooterType) {
                query = query.eq("id_scooter_type", filters.scooterType);
            }

            if (filters.level) {
                query = query.eq("level", filters.level);
            }

            if (filters.page && filters.pageSize) {
                const from = (filters.page - 1) * filters.pageSize;
                const to = from + filters.pageSize - 1;
                query = query.range(from, to);
            }

            const { data, error, count } = await query;

            if (error) throw error;
            return { data: data as ViewOrderFollow[], count };
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

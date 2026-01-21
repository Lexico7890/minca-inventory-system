import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getGuaranteesMovements } from "../api/movements";

interface GuaranteesMovementsFilters {
    page?: number;
    pageSize?: number;
}

export function useGuaranteesMovements(filters: GuaranteesMovementsFilters) {
    return useQuery({
        queryKey: ["guarantees-movements", filters],
        queryFn: () => getGuaranteesMovements(filters),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

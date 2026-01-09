import { useQuery } from '@tanstack/react-query';
import type { RepuestosParams } from '../model/types';
import { REPUESTOS_KEYS } from '../constants';
import { getRepuestos } from '../api';

export function useRepuestosQuery(params: RepuestosParams) {
    return useQuery({
        queryKey: REPUESTOS_KEYS.list(params),
        queryFn: () => getRepuestos(params),
        placeholderData: (previousData) => previousData,
    });
}

import type { RepuestosParams } from "../model/types";

export const REPUESTOS_KEYS = {
    all: ['repuestos'] as const,
    lists: () => [...REPUESTOS_KEYS.all, 'list'] as const,
    list: (params: RepuestosParams) => [...REPUESTOS_KEYS.lists(), params] as const,
};
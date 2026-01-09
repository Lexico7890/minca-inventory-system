import type { Repuesto } from "@/entities/repuestos";

export interface RepuestosFiltersProps {
    search: string;
    tipo: string;
    descontinuado: string;
    onSearchChange: (value: string) => void;
    onTipoChange: (value: string) => void;
    onDescontinuadoChange: (value: string) => void;
    onReset: () => void;
}

export interface RepuestosTableProps {
    items: Repuesto[];
    orderBy: keyof Repuesto;
    direction: 'asc' | 'desc';
    onSort: (column: keyof Repuesto) => void;
    onEdit: (repuesto: Repuesto) => void;
    onDelete: (id: string) => void;
}
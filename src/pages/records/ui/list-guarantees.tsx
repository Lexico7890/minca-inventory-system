import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Loader2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useGuaranteesMovements } from "@/entities/guarantees";

export default function ListGuarantees() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: queryData, isLoading, isError, error } = useGuaranteesMovements({
        page,
        pageSize,
    });

    const movements = queryData?.data || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (isLoading) {
        return (
            <div className="bg-card p-4 flex justify-center items-center border rounded-lg h-full w-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Cargando garantías...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-card p-4 flex justify-center items-center border rounded-lg h-full w-full">
                <div className="text-center">
                    <p className="text-destructive font-semibold">Error al cargar las garantías</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full w-full">
            <div className="bg-card p-4 flex flex-col justify-between border rounded-lg h-full w-full">
                {movements.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">No hay movimientos de garantía</p>
                    </div>
                ) : (
                    <Table>
                        <TableCaption>Lista de garantías recientes</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Referencia</TableHead>
                                <TableHead>Orden</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead className="w-[50px]">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.map((movement: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{movement.referencia || '-'}</TableCell>
                                    <TableCell>{movement.orden || '-'}</TableCell>
                                    <TableCell>{movement.tecnico || '-'}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => alert('Funcionalidad no implementada')}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Página {page} de {totalPages || 1} ({totalCount} registros)
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(old => Math.max(old - 1, 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(old => (totalPages && old < totalPages ? old + 1 : old))}
                            disabled={!totalPages || page === totalPages}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

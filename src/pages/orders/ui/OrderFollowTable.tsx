import { useOrderFollowList } from "../api/useOrderFollow";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function OrderFollowTable() {
    const { data: orders, isLoading } = useOrderFollowList();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
                No hay registros de seguimiento.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tiempo</TableHead>
                        <TableHead>N° Orden</TableHead>
                        <TableHead>Scooter</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">
                                {formatDistanceToNow(new Date(order.created_at), {
                                    addSuffix: true,
                                    locale: es,
                                })}
                            </TableCell>
                            <TableCell>{order.number}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{order.nombre_scooter}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {order.potencia}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={cn(
                                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm",
                                        order.level === 1 && "bg-green-500",
                                        order.level === 2 && "bg-yellow-500",
                                        order.level === 3 && "bg-red-500"
                                    )}
                                >
                                    {order.level}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        // Placeholder for future nested view navigation
                                        console.log("Navigate to phone view for order", order.id);
                                    }}
                                >
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

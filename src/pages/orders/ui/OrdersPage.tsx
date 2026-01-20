import { OrderFollowForm } from "./OrderFollowForm";
import { OrderFollowTable } from "./OrderFollowTable";

export function OrdersPage() {
    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Seguimiento de Órdenes</h1>

            <OrderFollowForm />

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Registros Recientes</h2>
                <OrderFollowTable />
            </div>
        </div>
    )
}

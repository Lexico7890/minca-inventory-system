import ListMovements from "./list-movements";
import MovementsWorkshopForm from "./movements-workshop-form";
import { useUserStore } from "@/store/useUserStore";

export default function RecordsPage() {
  const checkMenuPermission = useUserStore((state) => state.checkMenuPermission);

  // Check permission to show the registration form
  const showForm = checkMenuPermission('registros', 'show_form_register');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registros</h1>
      <p>Esta es la página de registros.</p>
      <div className="lg:grid lg:grid-cols-2 gap-4 mt-4 flex flex-col">
        {showForm && (
          <section className="flex justify-center items-center p-4">
            <MovementsWorkshopForm />
          </section>
        )}
        <section className={showForm ? "flex justify-center items-center p-4" : "col-span-2 p-4"}>
          <ListMovements />
        </section>
      </div>
    </div>
  );
}

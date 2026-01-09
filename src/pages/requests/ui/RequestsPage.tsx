import { Outlet } from "react-router-dom";

export function RequestsPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <Outlet />
    </div>
  );
}

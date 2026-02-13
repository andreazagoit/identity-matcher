import { getClients } from "@/lib/models/clients/actions";
import ClientsManager from "./clients-manager";

export default async function DashboardPage() {
  const clients = await getClients();

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <ClientsManager initialClients={clients} />
    </div>
  );
}

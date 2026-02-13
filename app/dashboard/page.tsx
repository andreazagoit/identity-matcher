import { getClients } from "@/lib/actions/clients";
import ClientsManager from "./clients-manager";

export default async function DashboardPage() {
  const clients = await getClients();

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Identity</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci le applicazioni OAuth 2.1. Clicca su un client per gestire le sue API Key.
        </p>
      </div>

      <ClientsManager initialClients={clients} />
    </div>
  );
}

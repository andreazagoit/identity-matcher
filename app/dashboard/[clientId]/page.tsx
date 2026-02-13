import { getClientById } from "@/lib/models/clients/actions";
import { getApiKeys } from "@/lib/models/api-keys/actions";
import ClientDetailEditor from "./client-detail-editor";
import ApiKeysManager from "../api-keys-manager";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, apiKeys] = await Promise.all([
    getClientById(clientId),
    getApiKeys(clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-10">
      <ClientDetailEditor client={client} />
      
      <div className="border-t pt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">API Keys per questo Client</h2>
        <ApiKeysManager initialKeys={apiKeys} clientId={clientId} />
      </div>
    </div>
  );
}

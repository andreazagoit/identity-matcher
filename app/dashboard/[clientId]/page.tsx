import { getClientById } from "@/lib/models/clients/actions";
import { getClientUsers, getClientStats } from "@/lib/models/users/actions";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import ClientDetailView from "./client-detail-view";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/oauth2/sign-in?redirect=/dashboard");
  }

  const { clientId } = await params;
  const [client, users, stats] = await Promise.all([
    getClientById(clientId),
    getClientUsers(clientId),
    getClientStats(clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <Container className="py-8">
      <ClientDetailView
        client={client as Record<string, unknown>}
        users={users}
        stats={stats}
      />
    </Container>
  );
}

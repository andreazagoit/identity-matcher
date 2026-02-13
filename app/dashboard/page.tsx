import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClients } from "@/lib/models/clients/actions";
import { Container } from "@/components/container";
import ClientsManager from "./clients-manager";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/oauth2/sign-in?redirect=/dashboard");
  }

  const clients = await getClients();

  return (
    <Container className="py-8">
      <ClientsManager initialClients={clients} />
    </Container>
  );
}

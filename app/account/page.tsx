import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { hasCompleteProfile } from "@/lib/models/profiles/operations";
import AccountForm from "./account-form";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/oauth2/sign-in?redirect=/account");
  }

  const [sessions, profileComplete] = await Promise.all([
    auth.api.listSessions({ headers: await headers() }),
    hasCompleteProfile(db, session.user.id),
  ]);

  return (
    <Container className="py-8">
      <AccountForm
        user={session.user as Record<string, unknown>}
        currentSessionToken={session.session.token}
        sessions={(sessions as Array<Record<string, unknown>>) ?? []}
        hasCompletedAssessment={profileComplete}
      />
    </Container>
  );
}

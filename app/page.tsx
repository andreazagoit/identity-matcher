import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheckIcon, KeyIcon, UsersIcon, LayoutDashboardIcon, LogInIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
          <span className="text-2xl font-bold text-primary-foreground">ID</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Identity Matcher
        </h1>
        <p className="text-muted-foreground mb-8">
          OAuth 2.1 Provider per l&apos;ecosistema Matcher
        </p>

        <div className="grid gap-4 mb-8">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                OAuth 2.1
              </CardTitle>
              <CardDescription className="text-xs">
                Autenticazione sicura con PKCE, JWT e refresh tokens
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyIcon className="w-4 h-4 text-primary" />
                OpenID Connect
              </CardTitle>
              <CardDescription className="text-xs">
                Compatibile OIDC con id_token e UserInfo endpoint
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UsersIcon className="w-4 h-4 text-primary" />
                Client Registration
              </CardTitle>
              <CardDescription className="text-xs">
                Registrazione dinamica di client OAuth per apps e community
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-3 justify-center">
          {session ? (
            <Link href="/dashboard">
              <Button className="gap-2">
                <LayoutDashboardIcon className="w-4 h-4" />
                Vai alla Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/oauth2/sign-in">
              <Button className="gap-2">
                <LogInIcon className="w-4 h-4" />
                Accedi / Registrati
              </Button>
            </Link>
          )}
          <Link href="/api/auth/.well-known/openid-configuration" target="_blank">
            <Button variant="outline">OIDC Config</Button>
          </Link>
        </div>

        {session && (
          <p className="mt-6 text-sm text-muted-foreground">
            Connesso come <span className="font-medium text-foreground">{session.user.email}</span>
          </p>
        )}
      </div>
    </div>
  );
}

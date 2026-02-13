import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheckIcon, KeyIcon, UsersIcon } from "lucide-react";

export default function Home() {
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
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                OAuth 2.1
              </CardTitle>
              <CardDescription>
                Autenticazione sicura con PKCE, JWT e refresh tokens
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyIcon className="w-4 h-4 text-primary" />
                OpenID Connect
              </CardTitle>
              <CardDescription>
                Compatibile OIDC con id_token e UserInfo endpoint
              </CardDescription>
            </CardHeader>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <UsersIcon className="w-4 h-4 text-primary" />
                Client Registration
              </CardTitle>
              <CardDescription>
                Registrazione dinamica di client OAuth per apps e community
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/sign-in">
            <Button>Accedi</Button>
          </Link>
          <Link href="/.well-known/openid-configuration">
            <Button variant="outline">OIDC Config</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

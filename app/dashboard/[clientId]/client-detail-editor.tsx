"use client";

import { useState } from "react";
import { updateClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClientDetailEditor({ client }: { client: any }) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateClient(client.id, formData);
    setLoading(false);
    alert("Client aggiornato con successo!");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Client</CardTitle>
              <CardDescription>
                Modifica le impostazioni di base del client OAuth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Applicazione</Label>
                  <Input id="name" name="name" defaultValue={client.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redirectUris">Redirect URIs (separati da virgola)</Label>
                  <Input
                    id="redirectUris"
                    name="redirectUris"
                    defaultValue={client.redirectUris?.join(", ")}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salva Modifiche
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenziali</CardTitle>
              <CardDescription>
                Queste sono le credenziali da usare nella tua applicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Client ID</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-2 rounded border text-sm truncate">
                    {client.clientId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(client.clientId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-xs text-yellow-600 font-medium">
                  Nota: Il Client Secret non è mostrato qui per sicurezza. Se lo hai perso, dovrai rigenerarlo (funzionalità in arrivo).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Info Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Interno:</span>
                <span className="font-mono">{client.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creato il:</span>
                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="capitalize">{client.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

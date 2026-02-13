"use client";

import { useState } from "react";
import { createClient, deleteClient } from "@/lib/actions/clients";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Copy, Plus, Loader2, Key, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ClientsManager({ initialClients }: { initialClients: any[] }) {
  const [loading, setLoading] = useState(false);
  const [newClientData, setNewClientData] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);
    setNewClientData(result);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Registra Nuovo Client</CardTitle>
          <CardDescription>
            Crea un nuovo client OAuth 2.1 per le tue applicazioni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Applicazione</Label>
                <Input id="name" name="name" placeholder="Es: Matcher App" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirectUris">Redirect URIs (separati da virgola)</Label>
                <Input
                  id="redirectUris"
                  name="redirectUris"
                  placeholder="http://localhost:3000/api/auth/callback/matcher"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Crea Client
            </Button>
          </form>

          {newClientData && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
              <p className="text-sm font-medium text-primary flex items-center">
                <Key className="mr-2 h-4 w-4" />
                Client creato con successo! Salva il Secret ora, non potrai più vederlo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Client ID</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-1 rounded border text-xs truncate">
                      {newClientData.clientId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigator.clipboard.writeText(newClientData.clientId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Client Secret</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-1 rounded border text-xs truncate">
                      {newClientData.clientSecret}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigator.clipboard.writeText(newClientData.clientSecret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Registrati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Redirect URIs</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{client.clientId}</code>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {client.redirectUris?.join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/${client.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          if (confirm("Sei sicuro di voler eliminare questo client?")) {
                            await deleteClient(client.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {initialClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nessun client registrato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

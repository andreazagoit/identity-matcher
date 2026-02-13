"use client";

import { useState } from "react";
import { createApiKey, deleteApiKey } from "@/lib/models/api-keys/actions";
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
import { Trash2, Copy, Plus, Loader2, ShieldCheck } from "lucide-react";

interface ApiKey {
  id: string;
  name: string | null;
  key: string;
  createdAt: Date;
}

export default function ApiKeysManager({ initialKeys, clientId }: { initialKeys: ApiKey[], clientId?: string }) {
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (clientId) formData.append("clientId", clientId);
    const result = await createApiKey(formData);
    if (result && 'key' in result) {
      setNewKey(result.key);
    }
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Genera API Key (M2M)</CardTitle>
          <CardDescription>
            Crea chiavi server-to-server persistenti per script e microservizi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="key-name">Nome Chiave</Label>
                <Input id="key-name" name="name" placeholder="Es: Matcher Cron Job" required />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Genera Chiave
              </Button>
            </div>
          </form>

          {newKey && (
            <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg space-y-3">
              <p className="text-sm font-medium text-green-600 flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Chiave generata! Copiala ora, non potrai più vederla in chiaro.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-2 rounded border text-xs break-all">
                  {newKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(newKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys Attive</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Prefisso</TableHead>
                <TableHead>Creata il</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{key.key.substring(0, 8)}...</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        if (confirm("Sei sicuro di voler revocare questa chiave?")) {
                          await deleteApiKey(key.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {initialKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nessuna API Key generata.
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

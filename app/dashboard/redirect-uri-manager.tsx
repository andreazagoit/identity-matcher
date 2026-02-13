"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface RedirectUriManagerProps {
  defaultValue?: string[];
  onChange?: (uris: string[]) => void;
  name?: string;
}

export function RedirectUriManager({
  defaultValue = [""],
  onChange,
  name = "redirectUris",
}: RedirectUriManagerProps) {
  const [uris, setUris] = useState<string[]>(
    defaultValue.length > 0 ? defaultValue : [""]
  );

  const updateUris = (newUris: string[]) => {
    setUris(newUris);
    if (onChange) {
      onChange(newUris);
    }
  };

  const addUri = () => {
    updateUris([...uris, ""]);
  };

  const removeUri = (index: number) => {
    if (uris.length === 1) {
      updateUris([""]);
      return;
    }
    const newUris = uris.filter((_, i) => i !== index);
    updateUris(newUris);
  };

  const handleUriChange = (index: number, value: string) => {
    const newUris = [...uris];
    newUris[index] = value;
    updateUris(newUris);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
          Redirect URIs
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={addUri}
        >
          <Plus className="w-3 h-3 mr-1" />
          Aggiungi
        </Button>
      </div>

      <div className="space-y-2">
        {uris.map((uri, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={uri}
              onChange={(e) => handleUriChange(index, e.target.value)}
              placeholder="https://app.esempio.com/callback"
              className="flex-1 h-9 text-sm"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => removeUri(index)}
              disabled={uris.length === 1 && uri === ""}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Hidden input to pass values to FormData in a single string if needed, 
          or we can handle it in the action by getting multiple values for the same key */}
      <input type="hidden" name={name} value={uris.join(",")} />
      
      <p className="text-[11px] text-muted-foreground">
        Gli URL a cui l&apos;utente verrà reindirizzato dopo l&apos;autenticazione.
      </p>
    </div>
  );
}

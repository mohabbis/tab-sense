"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseImportedTabs } from "@/lib/parse-import";

type AddTabDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: { url: string; title?: string }) => { ok: boolean; error?: string };
};

export function AddTabDialog({ open, onOpenChange, onAdd }: AddTabDialogProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a tab</DialogTitle>
          <DialogDescription>
            Drop in any URL. Flock will place it in the project or topic it belongs to.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const result = onAdd({
              url: String(data.get("url") ?? ""),
              title: String(data.get("title") ?? ""),
            });
            if (!result.ok) {
              setError(result.error ?? "Could not add that tab.");
              return;
            }
            onOpenChange(false);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="tab-url">URL</Label>
            <Input
              id="tab-url"
              name="url"
              placeholder="https://github.com/acme/checkout"
              autoFocus
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tab-title">Title (optional)</Label>
            <Input id="tab-title" name="title" placeholder="Checkout repo" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add tab</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: { url: string; title?: string }[]) => {
    ok: boolean;
    error?: string;
    count?: number;
  };
};

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setError(null);
        setPreview(0);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import tabs</DialogTitle>
          <DialogDescription>
            Paste URLs, markdown links, <code>Title | URL</code> lines, or a Chrome bookmarks
            HTML export.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const parsed = parseImportedTabs(String(data.get("list") ?? ""));
            if (parsed.length === 0) {
              setError("No valid URLs found in that list.");
              return;
            }
            const result = onImport(parsed);
            if (!result.ok) {
              setError(result.error ?? "Import failed.");
              return;
            }
            onOpenChange(false);
          }}
        >
          <Textarea
            name="list"
            rows={8}
            placeholder={`https://github.com/acme-labs/checkout
Checkout Flow | https://www.figma.com/design/abc/Checkout-Flow
[Atlas docs](https://www.notion.so/acme-labs/Atlas)`}
            onChange={(event) => {
              setPreview(parseImportedTabs(event.target.value).length);
              setError(null);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {preview === 0
              ? "Waiting for URLs…"
              : `${preview} tab${preview === 1 ? "" : "s"} ready to import`}
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Import and group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type NewGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
};

export function NewGroupDialog({ open, onOpenChange, onCreate }: NewGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>Pin a tab into a group you name yourself.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            if (!name) return;
            onCreate(name);
            onOpenChange(false);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input id="group-name" name="name" placeholder="Q3 launch" autoFocus required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

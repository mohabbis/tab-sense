"use client";

import { useState } from "react";
import {
  ChevronDown,
  Copy,
  Focus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { GROUP_COLOR_CLASS } from "@/lib/colors";
import type { Tab, TabGroup } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabRow } from "@/components/tab-row";

type GroupPanelProps = {
  group: TabGroup;
  tabs: Tab[];
  groups: TabGroup[];
  collapsed: boolean;
  focused: boolean;
  isCustom: boolean;
  onToggle: () => void;
  onFocus: () => void;
  onCloseGroup: () => void;
  onCloseTab: (tabId: string) => void;
  onMoveTab: (tabId: string, groupId: string) => void;
  onCreateGroup: (tabId: string) => void;
  onRename: (name: string) => void;
};

export function GroupPanel({
  group,
  tabs,
  groups,
  collapsed,
  focused,
  isCustom,
  onToggle,
  onFocus,
  onCloseGroup,
  onCloseTab,
  onMoveTab,
  onCreateGroup,
  onRename,
}: GroupPanelProps) {
  const [editing, setEditing] = useState(false);
  const colors = GROUP_COLOR_CLASS[group.color];

  async function copyUrls() {
    await navigator.clipboard.writeText(tabs.map((tab) => tab.url).join("\n"));
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-card/80 ring-1 ring-white/8">
      <div className={`h-1 w-full ${colors.bar}`} />
      <header className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={`mt-1 flex size-6 items-center justify-center rounded-md ${colors.soft}`}
          >
            <ChevronDown
              className={`size-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}
            />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-base font-medium tracking-tight">
                {group.name}
              </span>
              <Badge variant="secondary">{tabs.length}</Badge>
              <Badge variant="outline" className="capitalize">
                {group.kind}
              </Badge>
              {focused ? <Badge variant="default">Focus</Badge> : null}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{group.reason}</span>
          </span>
        </button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onFocus} aria-label="Focus group">
            <Focus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Group actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyUrls}>
                <Copy />
                Copy URLs
              </DropdownMenuItem>
              {isCustom ? (
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil />
                  Rename
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onCloseGroup}>
                <Trash2 />
                Close group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {editing ? (
        <form
          className="px-4 pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            if (name) onRename(name);
            setEditing(false);
          }}
        >
          <input
            name="name"
            defaultValue={group.name}
            autoFocus
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
          />
        </form>
      ) : null}
      {collapsed ? null : (
        <div className="border-t border-white/6 px-2 py-2">
          {tabs.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No tabs in this group yet. Move one here from another stack.
            </p>
          ) : (
            tabs.map((tab) => (
              <TabRow
                key={tab.id}
                tab={tab}
                groups={groups}
                onClose={() => onCloseTab(tab.id)}
                onMove={(groupId) => onMoveTab(tab.id, groupId)}
                onCreateGroup={() => onCreateGroup(tab.id)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

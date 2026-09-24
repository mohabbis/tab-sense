"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Menu, RotateCcw, Search, Sparkles, Upload, X } from "lucide-react";
import { useTabSession } from "@/hooks/use-tab-session";
import type { GroupingMode } from "@/lib/types";
import { ExtensionBanner } from "@/components/extension-banner";
import { GroupNav } from "@/components/group-nav";
import { GroupPanel } from "@/components/group-panel";
import { AddTabDialog, ImportDialog, NewGroupDialog } from "@/components/session-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MODE_COPY: Record<GroupingMode, string> = {
  auto: "Project first, then topic, then leftover sites",
  project: "Repositories, previews, and named products only",
  topic: "Title and documentation topics only",
  domain: "One group per website",
};

export function TabManager() {
  const session = useTabSession();
  const { notice, dismissNotice } = session;
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newGroupTabId, setNewGroupTabId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => dismissNotice(), 3200);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return session.groups
      .filter((group) =>
        session.state.focusedGroupId ? group.id === session.state.focusedGroupId : true,
      )
      .map((group) => {
        const tabs = group.tabIds
          .map((id) => session.tabById.get(id))
          .filter((tab): tab is NonNullable<typeof tab> => Boolean(tab))
          .filter((tab) => {
            if (!needle) return true;
            return (
              tab.title.toLowerCase().includes(needle) ||
              tab.url.toLowerCase().includes(needle) ||
              group.name.toLowerCase().includes(needle)
            );
          });
        return { group, tabs };
      })
      .filter(({ tabs }) => !needle || tabs.length > 0);
  }, [query, session.groups, session.state.focusedGroupId, session.tabById]);

  const totalTabs = session.state.tabs.length;
  const projectCount = session.groups.filter((group) => group.kind === "project").length;

  const sidebar = (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          This session
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Open tabs" value={String(totalTabs)} />
          <Stat label="Groups" value={String(session.groups.length)} />
          <Stat label="Projects" value={String(projectCount)} />
          <Stat label="Mode" value={session.state.mode} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Jump to a group
        </p>
        <GroupNav
          groups={session.groups}
          focusedGroupId={session.state.focusedGroupId}
          onFocus={(id) => {
            session.setFocusedGroup(id);
            setNavOpen(false);
          }}
        />
      </div>
      <div className="mt-auto rounded-xl bg-white/4 p-3 text-xs leading-5 text-muted-foreground">
        Tab-Sense reads titles and URLs — GitHub repos, Linear teams, Vercel previews, Figma files,
        localhost, and overlapping topics — then stacks related tabs together.
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col">
      <ExtensionBanner />
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[oklch(0.19_0.012_70/0.86)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open groups"
            >
              <Menu />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl leading-none tracking-tight text-[oklch(0.93_0.03_80)]">
                Tab-Sense
              </p>
              <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
                Engine playground. The Chrome extension groups whatever is open right now.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload />
              Import
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              Add tab
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, URLs, or groups"
                className="pl-8"
              />
            </div>
            <Select
              value={session.state.mode}
              onValueChange={(value) => session.setMode(value as GroupingMode)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={session.regroup}>
              <Sparkles />
              Regroup
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{MODE_COPY[session.state.mode]}</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1">
          {totalTabs === 0 ? (
            <EmptySession
              onAdd={() => setAddOpen(true)}
              onImport={() => setImportOpen(true)}
              onRestore={session.restoreDemo}
            />
          ) : visibleGroups.length === 0 ? (
            <div className="rounded-2xl bg-card/80 px-6 py-16 text-center ring-1 ring-white/8">
              <p className="font-heading text-lg">No tabs match “{query}”</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another title, host, or group name.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {session.state.focusedGroupId ? (
                <div className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2 text-sm">
                  <span>Focusing one group. Other stacks are hidden.</span>
                  <Button variant="ghost" size="sm" onClick={() => session.setFocusedGroup(null)}>
                    Show all
                  </Button>
                </div>
              ) : null}
              {visibleGroups.map(({ group, tabs }) => (
                <GroupPanel
                  key={group.id}
                  group={group}
                  tabs={tabs}
                  groups={session.groups}
                  collapsed={session.state.collapsed.includes(group.id)}
                  focused={session.state.focusedGroupId === group.id}
                  isCustom={session.state.customGroups.some((item) => item.id === group.id)}
                  onToggle={() => session.toggleCollapsed(group.id)}
                  onFocus={() => session.setFocusedGroup(group.id)}
                  onCloseGroup={() => session.closeGroup(group.id)}
                  onCloseTab={session.closeTab}
                  onMoveTab={session.moveTab}
                  onCreateGroup={(tabId) => setNewGroupTabId(tabId)}
                  onRename={(name) => session.renameGroup(group.id, name)}
                />
              ))}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                <span>
                  Session stays in this browser. Import a list from your real window anytime.
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={session.restoreDemo}>
                    <RotateCcw />
                    Restore sample
                  </Button>
                  <Button variant="ghost" size="sm" onClick={session.clearSession}>
                    Clear session
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {session.notice ? (
        <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm shadow-lg ring-1 ring-white/10">
          <Badge variant="secondary">Saved</Badge>
          {session.notice}
          <Button variant="ghost" size="icon-xs" onClick={session.dismissNotice} aria-label="Dismiss">
            <X />
          </Button>
        </div>
      ) : null}

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="p-4">
          <SheetHeader className="px-0">
            <SheetTitle className="font-display">Tab-Sense</SheetTitle>
            <SheetDescription>Jump to a group or review this session.</SheetDescription>
          </SheetHeader>
          {sidebar}
        </SheetContent>
      </Sheet>

      <AddTabDialog open={addOpen} onOpenChange={setAddOpen} onAdd={session.addTab} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={session.addMany} />
      <NewGroupDialog
        open={Boolean(newGroupTabId)}
        onOpenChange={(open) => {
          if (!open) setNewGroupTabId(null);
        }}
        onCreate={(name) => {
          if (newGroupTabId) session.createGroup(name, newGroupTabId);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/4 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-heading capitalize">{value}</p>
    </div>
  );
}

function EmptySession({
  onAdd,
  onImport,
  onRestore,
}: {
  onAdd: () => void;
  onImport: () => void;
  onRestore: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card/80 px-6 py-16 text-center ring-1 ring-white/8">
      <p className="font-display text-3xl italic">Nothing open</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Add a URL or import the tabs from your current window. Tab-Sense will stack them by project
        and topic.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onAdd}>Add tab</Button>
        <Button variant="outline" onClick={onImport}>
          <Upload />
          Import list
        </Button>
        <Button variant="ghost" onClick={onRestore}>
          <FolderPlus />
          Load sample session
        </Button>
      </div>
    </div>
  );
}

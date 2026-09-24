"use client";

import { useState } from "react";
import {
  Copy,
  ExternalLink,
  FolderInput,
  MoreHorizontal,
  Pin,
  X,
} from "lucide-react";
import { GROUP_COLOR_CLASS, faviconUrl } from "@/lib/colors";
import type { Tab, TabGroup } from "@/lib/types";
import { hostnameOf } from "@/lib/url";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TabRowProps = {
  tab: Tab;
  groups: TabGroup[];
  onClose: () => void;
  onMove: (groupId: string) => void;
  onCreateGroup: () => void;
};

export function TabRow({ tab, groups, onClose, onMove, onCreateGroup }: TabRowProps) {
  const [brokenIcon, setBrokenIcon] = useState(false);
  const host = hostnameOf(tab.url);
  const icon = faviconUrl(tab.url);
  const letter = (tab.title || host || "?").charAt(0).toUpperCase();

  return (
    <div className="group/row flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/4">
      <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-white/6 ring-1 ring-white/8">
        {!brokenIcon && icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon}
            alt=""
            className="size-full object-contain p-1"
            onError={() => setBrokenIcon(true)}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] font-medium text-muted-foreground">
            {letter}
          </span>
        )}
      </div>
      <a
        href={tab.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1"
      >
        <div className="flex items-center gap-2">
          {tab.pinned ? (
            <Pin className="size-3 shrink-0 text-amber-200/80" />
          ) : null}
          <p className="truncate text-sm font-medium text-foreground">{tab.title}</p>
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{host || tab.url}</p>
      </a>
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100">
        <Button variant="ghost" size="icon-xs" asChild>
          <a href={tab.url} target="_blank" rel="noreferrer" aria-label={`Open ${tab.title}`}>
            <ExternalLink />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Copy URL"
          onClick={async () => {
            await navigator.clipboard.writeText(tab.url);
          }}
        >
          <Copy />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="Tab actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuLabel>Move to group</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput />
                Existing group
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-44">
                {groups.map((group) => (
                  <DropdownMenuItem key={group.id} onClick={() => onMove(group.id)}>
                    <span className={`size-2 rounded-full ${GROUP_COLOR_CLASS[group.color].dot}`} />
                    {group.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={onCreateGroup}>New group…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onClose}>
              <X />
              Close tab
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import { GROUP_COLOR_CLASS } from "@/lib/colors";
import type { TabGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";

type GroupNavProps = {
  groups: TabGroup[];
  focusedGroupId: string | null;
  onFocus: (groupId: string | null) => void;
};

export function GroupNav({ groups, focusedGroupId, onFocus }: GroupNavProps) {
  return (
    <nav className="grid gap-1">
      <Button
        variant={focusedGroupId ? "ghost" : "secondary"}
        className="w-full justify-between"
        onClick={() => onFocus(null)}
      >
        All groups
        <span className="font-mono text-xs text-muted-foreground">
          {groups.reduce((sum, group) => sum + group.tabIds.length, 0)}
        </span>
      </Button>
      {groups.map((group) => {
        const colors = GROUP_COLOR_CLASS[group.color];
        const active = focusedGroupId === group.id;
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onFocus(group.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
              active ? "bg-white/8 text-foreground" : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
            }`}
          >
            <span className={`size-2.5 shrink-0 rounded-full ${colors.dot}`} />
            <span className="min-w-0 flex-1 truncate">{group.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{group.tabIds.length}</span>
          </button>
        );
      })}
    </nav>
  );
}

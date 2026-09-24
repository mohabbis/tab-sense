export type GroupColor =
  | "coral"
  | "amber"
  | "teal"
  | "violet"
  | "sky"
  | "lime"
  | "rose"
  | "indigo"
  | "stone";

export type GroupKind = "project" | "topic" | "tool" | "loose";

export type GroupingMode = "auto" | "project" | "topic" | "domain";

export type Tab = {
  id: string;
  url: string;
  title: string;
  pinned?: boolean;
};

export type CustomGroup = {
  id: string;
  name: string;
  color: GroupColor;
};

export type TabGroup = {
  id: string;
  name: string;
  color: GroupColor;
  kind: GroupKind;
  reason: string;
  tabIds: string[];
};

export type SessionState = {
  version: 1;
  tabs: Tab[];
  mode: GroupingMode;
  assignments: Record<string, string>;
  customGroups: CustomGroup[];
  collapsed: string[];
  focusedGroupId: string | null;
};

export type ParsedImport = {
  url: string;
  title: string;
};

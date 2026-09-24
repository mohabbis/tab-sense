/// <reference types="chrome" />
import type { GroupingMode } from "@/lib/types";

export type ExtensionSettings = {
  autoGroup: boolean;
  mode: GroupingMode;
};

const DEFAULTS: ExtensionSettings = {
  autoGroup: true,
  mode: "auto",
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(["autoGroup", "mode"]);
  return {
    autoGroup: typeof stored.autoGroup === "boolean" ? stored.autoGroup : DEFAULTS.autoGroup,
    mode:
      stored.mode === "auto" ||
      stored.mode === "project" ||
      stored.mode === "topic" ||
      stored.mode === "domain"
        ? stored.mode
        : DEFAULTS.mode,
  };
}

export async function setSettings(patch: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await chrome.storage.local.set(next);
  return next;
}

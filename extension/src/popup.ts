/// <reference types="chrome" />
import type { GroupPreview } from "./apply-groups";
import { getSettings, setSettings } from "./settings";

const autoInput = document.querySelector("#auto") as HTMLInputElement;
const modeSelect = document.querySelector("#mode") as HTMLSelectElement;
const groupButton = document.querySelector("#group") as HTMLButtonElement;
const ungroupButton = document.querySelector("#ungroup") as HTMLButtonElement;
const statusEl = document.querySelector("#status") as HTMLParagraphElement;
const errorEl = document.querySelector("#error") as HTMLParagraphElement;
const groupsEl = document.querySelector("#groups") as HTMLDivElement;

const BAR: Record<string, string> = {
  coral: "#e07a5f",
  amber: "#e0b15a",
  teal: "#6fb3b8",
  violet: "#b085d6",
  sky: "#7eadd6",
  lime: "#b4d36a",
  rose: "#e08aa0",
  indigo: "#7f8cdb",
  stone: "#9a9184",
};

function showError(message: string) {
  errorEl.hidden = !message;
  errorEl.textContent = message;
}

async function send<T>(type: string): Promise<T> {
  const response = (await chrome.runtime.sendMessage({ type })) as T & { error?: string };
  if (response && typeof response === "object" && "error" in response && response.error) {
    throw new Error(response.error);
  }
  return response;
}

function renderGroups(groups: GroupPreview[]) {
  groupsEl.replaceChildren();
  if (groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "status";
    empty.textContent = "No http(s) tabs in this window to group.";
    groupsEl.append(empty);
    return;
  }

  for (const group of groups) {
    const card = document.createElement("article");
    card.className = "group";
    card.style.setProperty("--bar", BAR[group.color] ?? BAR.amber);
    const heading = document.createElement("h2");
    const name = document.createElement("span");
    name.textContent = group.chromeTitle;
    const count = document.createElement("span");
    count.textContent = String(group.tabCount);
    heading.append(name, count);
    const list = document.createElement("ul");
    for (const title of group.titles.slice(0, 4)) {
      const item = document.createElement("li");
      item.textContent = title;
      list.append(item);
    }
    if (group.titles.length > 4) {
      const more = document.createElement("li");
      more.textContent = `+${group.titles.length - 4} more`;
      list.append(more);
    }
    card.append(heading, list);
    groupsEl.append(card);
  }
}

async function refreshPreview() {
  showError("");
  const preview = await send<{
    tabCount: number;
    groups: GroupPreview[];
    skipped: number;
  }>("PREVIEW");
  statusEl.textContent = `${preview.tabCount} groupable tab${preview.tabCount === 1 ? "" : "s"} · ${preview.groups.length} group${preview.groups.length === 1 ? "" : "s"}`;
  renderGroups(preview.groups);
}

async function init() {
  const settings = await getSettings();
  autoInput.checked = settings.autoGroup;
  modeSelect.value = settings.mode;
  await refreshPreview();
}

autoInput.addEventListener("change", async () => {
  await setSettings({ autoGroup: autoInput.checked });
  if (autoInput.checked) {
    await send("GROUP_NOW");
    await refreshPreview();
  }
});

modeSelect.addEventListener("change", async () => {
  await setSettings({
    mode: modeSelect.value as "auto" | "project" | "topic" | "domain",
  });
  if (autoInput.checked) {
    await send("GROUP_NOW");
  }
  await refreshPreview();
});

groupButton.addEventListener("click", async () => {
  groupButton.disabled = true;
  try {
    const result = await send<{ groupCount: number; tabCount: number }>("GROUP_NOW");
    statusEl.textContent = `Grouped ${result.tabCount} tabs into ${result.groupCount} stacks`;
    await refreshPreview();
  } catch (error) {
    showError(error instanceof Error ? error.message : "Could not group this window.");
  } finally {
    groupButton.disabled = false;
  }
});

ungroupButton.addEventListener("click", async () => {
  await send("UNGROUP_NOW");
  await refreshPreview();
});

void init().catch((error: unknown) => {
  showError(error instanceof Error ? error.message : "Could not read this window.");
});

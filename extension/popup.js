// extension/src/settings.ts
var DEFAULTS = {
  autoGroup: true,
  mode: "auto"
};
async function getSettings() {
  const stored = await chrome.storage.local.get(["autoGroup", "mode"]);
  return {
    autoGroup: typeof stored.autoGroup === "boolean" ? stored.autoGroup : DEFAULTS.autoGroup,
    mode: stored.mode === "auto" || stored.mode === "project" || stored.mode === "topic" || stored.mode === "domain" ? stored.mode : DEFAULTS.mode
  };
}
async function setSettings(patch) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await chrome.storage.local.set(next);
  return next;
}

// extension/src/popup.ts
var autoInput = document.querySelector("#auto");
var modeSelect = document.querySelector("#mode");
var groupButton = document.querySelector("#group");
var ungroupButton = document.querySelector("#ungroup");
var statusEl = document.querySelector("#status");
var errorEl = document.querySelector("#error");
var groupsEl = document.querySelector("#groups");
var BAR = {
  coral: "#e07a5f",
  amber: "#e0b15a",
  teal: "#6fb3b8",
  violet: "#b085d6",
  sky: "#7eadd6",
  lime: "#b4d36a",
  rose: "#e08aa0",
  indigo: "#7f8cdb",
  stone: "#9a9184"
};
function showError(message) {
  errorEl.hidden = !message;
  errorEl.textContent = message;
}
async function send(type) {
  const response = await chrome.runtime.sendMessage({ type });
  if (response && typeof response === "object" && "error" in response && response.error) {
    throw new Error(response.error);
  }
  return response;
}
function renderGroups(groups) {
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
  const preview = await send("PREVIEW");
  statusEl.textContent = `${preview.tabCount} groupable tab${preview.tabCount === 1 ? "" : "s"} \xB7 ${preview.groups.length} group${preview.groups.length === 1 ? "" : "s"}`;
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
    mode: modeSelect.value
  });
  if (autoInput.checked) {
    await send("GROUP_NOW");
  }
  await refreshPreview();
});
groupButton.addEventListener("click", async () => {
  groupButton.disabled = true;
  try {
    const result = await send("GROUP_NOW");
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
void init().catch((error) => {
  showError(error instanceof Error ? error.message : "Could not read this window.");
});
//# sourceMappingURL=popup.js.map

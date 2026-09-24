import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chromeGroupTitle,
  groupsToApply,
  isGroupableTab,
  toEngineTabs,
} from "./chrome-groups.ts";
import { groupTabs } from "./grouping.ts";
import { cloneDemoTabs } from "./demo-session.ts";

test("chrome titles stay short enough for the tab strip", () => {
  assert.equal(chromeGroupTitle("Acme Labs · Checkout"), "Checkout");
  assert.ok(chromeGroupTitle("A very long documentation topic name").length <= 13);
});

test("only multi-tab non-loose groups are applied in Chrome", () => {
  const applied = groupsToApply(groupTabs(cloneDemoTabs(), { mode: "auto" }));
  assert.ok(applied.every((group) => group.kind !== "loose"));
  assert.ok(applied.every((group) => group.tabIds.length >= 2));
  assert.ok(applied.some((group) => group.name.toLowerCase().includes("checkout")));
});

test("skips browser internals and pinned tabs", () => {
  assert.equal(isGroupableTab({ id: 1, url: "chrome://extensions", title: "Ext" }), false);
  assert.equal(
    isGroupableTab({ id: 2, url: "https://github.com/acme/checkout", pinned: true }),
    false,
  );
  const tabs = toEngineTabs([
    { id: 3, url: "https://github.com/acme/checkout", title: "Checkout" },
    { id: 4, url: "about:blank" },
  ]);
  assert.equal(tabs.length, 1);
  assert.equal(tabs[0].id, "3");
});

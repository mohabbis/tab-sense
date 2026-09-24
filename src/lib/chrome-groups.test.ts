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

test("applies a one-tab site group", () => {
  const applied = groupsToApply(
    groupTabs([{ id: "1", url: "https://www.youtube.com/watch?v=abc", title: "A video" }], {
      mode: "auto",
    }),
  );
  assert.equal(applied.length, 1);
  assert.equal(applied[0].tabIds.length, 1);
});

test("splits two unrelated sites and merges two youtube tabs", () => {
  const applied = groupsToApply(
    groupTabs(
      [
        { id: "a", url: "https://www.youtube.com/watch?v=1", title: "One" },
        { id: "b", url: "https://www.youtube.com/watch?v=2", title: "Two" },
        { id: "c", url: "https://github.com/acme/arduino", title: "acme/arduino" },
      ],
      { mode: "auto" },
    ),
  );
  const youtube = applied.find((group) =>
    group.tabIds.includes("a") && group.tabIds.includes("b"),
  );
  const github = applied.find((group) => group.tabIds.includes("c"));
  assert.ok(youtube);
  assert.ok(github);
  assert.notEqual(youtube.id, github.id);
});

test("demo groups still apply", () => {
  const applied = groupsToApply(groupTabs(cloneDemoTabs(), { mode: "auto" }));
  assert.ok(applied.some((group) => group.name.toLowerCase().includes("checkout")));
  assert.ok(applied.every((group) => group.tabIds.length >= 1));
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

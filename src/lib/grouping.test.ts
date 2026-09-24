import assert from "node:assert/strict";
import { test } from "node:test";
import { cloneDemoTabs } from "./demo-session.ts";
import { extractSignals, groupTabs } from "./grouping.ts";
import { parseImportedTabs } from "./parse-import.ts";

test("demo session groups checkout, atlas, react, and google tools", () => {
  const groups = groupTabs(cloneDemoTabs(), { mode: "auto" });
  const names = groups.map((group) => group.name.toLowerCase());
  const byName = (needle: string) =>
    groups.find((group) => group.name.toLowerCase().includes(needle));

  assert.ok(
    names.some((name) => name.includes("checkout")),
    `expected a checkout group, got ${names.join(", ")}`,
  );
  assert.ok(
    names.some((name) => name.includes("atlas")),
    `expected an atlas group, got ${names.join(", ")}`,
  );
  assert.ok(
    names.some((name) => name.includes("react") || name.includes("google")),
    `expected react or google groups, got ${names.join(", ")}`,
  );

  const checkout = byName("checkout");
  assert.ok(checkout);
  assert.ok(checkout.tabIds.length >= 7, `checkout only has ${checkout.tabIds.length} tabs`);

  const atlas = byName("atlas");
  assert.ok(atlas);
  assert.ok(atlas.tabIds.length >= 2);

  const allIds = groups.flatMap((group) => group.tabIds);
  assert.equal(allIds.length, cloneDemoTabs().length);
  assert.equal(new Set(allIds).size, allIds.length);
});

test("extracts github repo keys", () => {
  const signal = extractSignals({
    id: "1",
    url: "https://github.com/acme-labs/checkout/pull/88",
    title: "Fix tax rounding",
  });
  assert.ok(signal.keys.some((key) => key.key === "repo:acme-labs/checkout"));
});

test("domain mode groups by site", () => {
  const groups = groupTabs(
    [
      { id: "a", url: "https://news.ycombinator.com/item?id=1", title: "Ask HN" },
      { id: "b", url: "https://news.ycombinator.com/", title: "Hacker News" },
      { id: "c", url: "https://example.com/x", title: "Example" },
    ],
    { mode: "domain" },
  );
  const hn = groups.find((group) => group.tabIds.includes("a"));
  assert.ok(hn);
  assert.ok(hn.tabIds.includes("b"));
  assert.ok(!hn.tabIds.includes("c"));
});

test("manual assignments are respected", () => {
  const tabs = cloneDemoTabs().slice(0, 3);
  const groups = groupTabs(tabs, {
    mode: "auto",
    customGroups: [{ id: "custom-research", name: "Research", color: "violet" }],
    assignments: {
      [tabs[0].id]: "custom-research",
      [tabs[1].id]: "custom-research",
    },
  });
  const research = groups.find((group) => group.id === "custom-research");
  assert.ok(research);
  assert.deepEqual(research.tabIds.slice().sort(), [tabs[0].id, tabs[1].id].sort());
});

test("parses mixed import formats", () => {
  const parsed = parseImportedTabs(`
https://github.com/acme-labs/checkout
Checkout Flow | https://www.figma.com/design/abc/Checkout-Flow
[Atlas](https://www.notion.so/acme-labs/Atlas)
`);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[1].title, "Checkout Flow");
  assert.equal(parsed[2].title, "Atlas");
});

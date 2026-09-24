import type { Tab } from "@/lib/types";

export const DEMO_TABS: Tab[] = [
  {
    id: "tab-checkout-repo",
    url: "https://github.com/acme-labs/checkout",
    title: "acme-labs/checkout: payment flow",
    pinned: true,
  },
  {
    id: "tab-checkout-pr",
    url: "https://github.com/acme-labs/checkout/pull/88",
    title: "Fix tax rounding on EU VAT · Pull Request #88",
  },
  {
    id: "tab-checkout-linear",
    url: "https://linear.app/acme-labs/issue/CHE-142/tax-rounding-on-eu-vat",
    title: "CHE-142 Tax rounding on EU VAT",
  },
  {
    id: "tab-checkout-figma",
    url: "https://www.figma.com/design/k2n8flow/Checkout-Flow",
    title: "Checkout Flow – Figma",
  },
  {
    id: "tab-checkout-preview",
    url: "https://acme-checkout.vercel.app/cart",
    title: "Checkout Preview · cart",
  },
  {
    id: "tab-checkout-local",
    url: "http://localhost:4173/checkout",
    title: "Local · Checkout",
  },
  {
    id: "tab-checkout-vercel",
    url: "https://vercel.com/acme-labs/checkout",
    title: "acme-labs/checkout – Vercel",
  },
  {
    id: "tab-checkout-slack",
    url: "https://app.slack.com/client/T0ACME/C0CHECK",
    title: "acme-labs · #checkout",
  },
  {
    id: "tab-atlas-repo",
    url: "https://github.com/acme-labs/atlas",
    title: "acme-labs/atlas: docs platform",
  },
  {
    id: "tab-atlas-notion",
    url: "https://www.notion.so/acme-labs/Atlas-architecture-4f2c9d",
    title: "Atlas architecture",
  },
  {
    id: "tab-atlas-linear",
    url: "https://linear.app/acme-labs/project/atlas-docs",
    title: "Atlas docs · Linear",
  },
  {
    id: "tab-react-deferred",
    url: "https://react.dev/reference/react/useDeferredValue",
    title: "useDeferredValue – React",
  },
  {
    id: "tab-react-memo",
    url: "https://react.dev/reference/react/memo",
    title: "memo – React",
  },
  {
    id: "tab-react-so",
    url: "https://stackoverflow.com/questions/61243089/when-to-use-react-memo",
    title: "When to use React.memo",
  },
  {
    id: "tab-web-inp",
    url: "https://web.dev/articles/inp",
    title: "Interaction to Next Paint (INP)",
  },
  {
    id: "tab-mail",
    url: "https://mail.google.com/mail/u/0/#inbox",
    title: "Inbox (12) – you@acme.com",
  },
  {
    id: "tab-cal",
    url: "https://calendar.google.com/calendar/u/0/r",
    title: "Calendar",
  },
  {
    id: "tab-hn",
    url: "https://news.ycombinator.com/",
    title: "Hacker News",
  },
  {
    id: "tab-css-mdn",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment",
    title: "CSS containment - MDN",
  },
  {
    id: "tab-css-video",
    url: "https://www.youtube.com/watch?v=3w9zUBIRkIA",
    title: "CSS container queries, explained",
  },
];

export function cloneDemoTabs(): Tab[] {
  return DEMO_TABS.map((tab) => ({ ...tab }));
}

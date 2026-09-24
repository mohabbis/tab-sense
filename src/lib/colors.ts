import type { GroupColor } from "@/lib/types";

export const GROUP_COLOR_CLASS: Record<
  GroupColor,
  { bar: string; dot: string; soft: string; text: string }
> = {
  coral: {
    bar: "bg-[oklch(0.71_0.16_28)]",
    dot: "bg-[oklch(0.71_0.16_28)]",
    soft: "bg-[oklch(0.71_0.16_28/0.14)]",
    text: "text-[oklch(0.8_0.12_28)]",
  },
  amber: {
    bar: "bg-[oklch(0.8_0.14_75)]",
    dot: "bg-[oklch(0.8_0.14_75)]",
    soft: "bg-[oklch(0.8_0.14_75/0.14)]",
    text: "text-[oklch(0.86_0.12_75)]",
  },
  teal: {
    bar: "bg-[oklch(0.74_0.11_185)]",
    dot: "bg-[oklch(0.74_0.11_185)]",
    soft: "bg-[oklch(0.74_0.11_185/0.14)]",
    text: "text-[oklch(0.82_0.09_185)]",
  },
  violet: {
    bar: "bg-[oklch(0.7_0.14_305)]",
    dot: "bg-[oklch(0.7_0.14_305)]",
    soft: "bg-[oklch(0.7_0.14_305/0.14)]",
    text: "text-[oklch(0.8_0.1_305)]",
  },
  sky: {
    bar: "bg-[oklch(0.76_0.1_230)]",
    dot: "bg-[oklch(0.76_0.1_230)]",
    soft: "bg-[oklch(0.76_0.1_230/0.14)]",
    text: "text-[oklch(0.84_0.08_230)]",
  },
  lime: {
    bar: "bg-[oklch(0.82_0.16_125)]",
    dot: "bg-[oklch(0.82_0.16_125)]",
    soft: "bg-[oklch(0.82_0.16_125/0.12)]",
    text: "text-[oklch(0.86_0.14_125)]",
  },
  rose: {
    bar: "bg-[oklch(0.7_0.16_8)]",
    dot: "bg-[oklch(0.7_0.16_8)]",
    soft: "bg-[oklch(0.7_0.16_8/0.14)]",
    text: "text-[oklch(0.82_0.1_8)]",
  },
  indigo: {
    bar: "bg-[oklch(0.68_0.12_275)]",
    dot: "bg-[oklch(0.68_0.12_275)]",
    soft: "bg-[oklch(0.68_0.12_275/0.16)]",
    text: "text-[oklch(0.8_0.1_275)]",
  },
  stone: {
    bar: "bg-[oklch(0.62_0.02_70)]",
    dot: "bg-[oklch(0.62_0.02_70)]",
    soft: "bg-[oklch(0.62_0.02_70/0.14)]",
    text: "text-[oklch(0.78_0.02_70)]",
  },
};

export function faviconUrl(pageUrl: string): string {
  try {
    const host = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
  } catch {
    return "";
  }
}

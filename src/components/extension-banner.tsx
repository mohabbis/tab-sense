export function ExtensionBanner() {
  return (
    <aside className="border-b border-white/8 bg-[oklch(0.22_0.016_70)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-pretty text-muted-foreground">
          <span className="font-medium text-foreground">Tab-Sense is a Chrome extension.</span>{" "}
          Load <code className="font-mono text-[12px] text-[oklch(0.86_0.1_75)]">extension/dist</code> unpacked
          and it will group the tabs that are actually open in this window.
        </p>
        <p className="shrink-0 font-mono text-xs text-muted-foreground">
          chrome://extensions → Load unpacked
        </p>
      </div>
    </aside>
  );
}

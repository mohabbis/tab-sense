import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(root, "extension");
const watch = process.argv.includes("--watch");

const generated = [
  "background.js",
  "background.js.map",
  "popup.js",
  "popup.js.map",
  "popup.html",
  "popup.css",
];

const options = {
  absWorkingDir: root,
  entryPoints: {
    background: "extension/src/background.ts",
    popup: "extension/src/popup.ts",
  },
  bundle: true,
  outdir,
  format: "esm",
  target: ["chrome120"],
  platform: "browser",
  sourcemap: true,
  alias: {
    "@": path.join(root, "src"),
  },
  logLevel: "info",
};

async function copyStatic() {
  await mkdir(path.join(outdir, "icons"), { recursive: true });
  await cp(path.join(root, "extension/src/popup.html"), path.join(outdir, "popup.html"));
  await cp(path.join(root, "extension/src/popup.css"), path.join(outdir, "popup.css"));
}

async function cleanGenerated() {
  for (const file of generated) {
    await rm(path.join(outdir, file), { force: true });
  }
}

await cleanGenerated();

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  await copyStatic();
  console.log("Watching extension sources…");
} else {
  await build(options);
  await copyStatic();
}

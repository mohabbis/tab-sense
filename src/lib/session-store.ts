import { defaultSession, loadSession, saveSession } from "@/lib/storage";
import type { SessionState } from "@/lib/types";

const listeners = new Set<() => void>();
const serverSnapshot = defaultSession();
let snapshot: SessionState = serverSnapshot;
let didHydrate = false;

export function subscribeSession(listener: () => void) {
  if (!didHydrate) {
    snapshot = loadSession();
    didHydrate = true;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionSnapshot() {
  return snapshot;
}

export function getServerSessionSnapshot() {
  return serverSnapshot;
}

export function writeSession(
  updater: SessionState | ((current: SessionState) => SessionState),
) {
  snapshot = typeof updater === "function" ? updater(snapshot) : updater;
  saveSession(snapshot);
  for (const listener of listeners) listener();
}

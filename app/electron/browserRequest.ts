import type {
  NativeBrowserBlockedReason,
  NativeBrowserOpenRequest,
} from "../shared/nativeBrowser";

export type NormalizedNativeBrowserOpenRequest =
  | { ok: true; tabId: string; targetUrl: string }
  | { ok: false; tabId: string; blockedReason: NativeBrowserBlockedReason };

export function normalizeNativeBrowserOpenRequest(input: unknown): NormalizedNativeBrowserOpenRequest {
  const request = input as Partial<NativeBrowserOpenRequest> | null;
  const tabId = typeof request?.tabId === "string" && request.tabId.trim() ? request.tabId.trim() : "native_tab_1";

  if (request?.userInitiated !== true) {
    return { ok: false, tabId, blockedReason: "permission" };
  }

  if (typeof request.targetUrl !== "string") {
    return { ok: false, tabId, blockedReason: "invalid_url" };
  }

  try {
    const url = new URL(request.targetUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, tabId, blockedReason: "invalid_url" };
    }
    return { ok: true, tabId, targetUrl: url.href };
  } catch {
    return { ok: false, tabId, blockedReason: "invalid_url" };
  }
}

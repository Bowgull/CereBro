import { basename, join } from "node:path";

export const nativeBrowserRiskyDownloadExtensions = [
  ".app",
  ".command",
  ".dmg",
  ".exe",
  ".js",
  ".pkg",
  ".scr",
  ".sh",
] as const;

export type NativeBrowserDownloadDecision =
  | { action: "allow"; reason: "user_download"; savePath: string }
  | { action: "block"; reason: "automatic_download" | "multiple_download" | "risky_file"; savePath: null };

export function classifyNativeBrowserDownload(input: {
  filename: string;
  url: string;
  hasUserGesture: boolean;
  recentDownloadCount: number;
  downloadsPath: string;
}): NativeBrowserDownloadDecision {
  const safeFilename = basename(input.filename.trim() || filenameFromUrl(input.url));
  const lowerFilename = safeFilename.toLowerCase();

  if (!input.hasUserGesture) {
    return { action: "block", reason: "automatic_download", savePath: null };
  }

  if (input.recentDownloadCount > 0) {
    return { action: "block", reason: "multiple_download", savePath: null };
  }

  if (nativeBrowserRiskyDownloadExtensions.some((extension) => lowerFilename.endsWith(extension))) {
    return { action: "block", reason: "risky_file", savePath: null };
  }

  return {
    action: "allow",
    reason: "user_download",
    savePath: join(input.downloadsPath, safeFilename),
  };
}

function filenameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return basename(decodeURIComponent(parsed.pathname)) || "download";
  } catch {
    return "download";
  }
}

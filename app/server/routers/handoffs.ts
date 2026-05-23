import fs from "fs/promises";
import path from "path";
import { publicProcedure, router } from "../_core/trpc";
import { getObsidianStatus } from "../integrations/vault";

const SKIP_DIRS = new Set([
  ".git",
  ".turbo",
  ".next",
  "dist",
  "node_modules",
  "sprites",
  "mockups",
]);

async function repoRoot(): Promise<string> {
  const candidates = [process.cwd(), path.resolve(process.cwd(), "..")];
  for (const candidate of candidates) {
    try {
      await fs.access(path.join(candidate, "CEREBRO_SESSION_HANDOFF.md"));
      return candidate;
    } catch {}
  }
  return path.resolve(process.cwd(), "..");
}

async function walkMarkdownFiles(dir: string, root: string, out: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".claude") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walkMarkdownFiles(fullPath, root, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(path.relative(root, fullPath));
    }
  }
}

function excerpt(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));
  return lines.slice(0, 3).join(" ").slice(0, 320);
}

function titleFromContent(relativePath: string, content: string): string {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || path.basename(relativePath, ".md");
}

function looksLikeSessionHandoff(relativePath: string, content: string): boolean {
  const haystack = `${relativePath}\n${content.slice(0, 6000)}`.toLowerCase();
  return (
    haystack.includes("session handoff") ||
    haystack.includes("next-session starter prompt") ||
    haystack.includes("every-session closeout")
  );
}

export const handoffsRouter = router({
  archivePlan: publicProcedure.query(async () => {
    const root = await repoRoot();
    const obsidian = await getObsidianStatus();
    const files: string[] = [];
    await walkMarkdownFiles(root, root, files);

    const candidates = [];
    for (const relativePath of files.sort()) {
      const fullPath = path.join(root, relativePath);
      const content = await fs.readFile(fullPath, "utf8");
      if (!looksLikeSessionHandoff(relativePath, content)) continue;
      const stat = await fs.stat(fullPath);
      candidates.push({
        relativePath,
        title: titleFromContent(relativePath, content),
        byteSize: stat.size,
        modifiedAt: Math.floor(stat.mtimeMs / 1000),
        excerpt: excerpt(content),
        recommendedObsidianPath:
          relativePath === "CEREBRO_SESSION_HANDOFF.md"
            ? "90_Archive/CereBro Session History/Current Session Handoff.md"
            : `90_Archive/CereBro Session History/References/${path.basename(relativePath)}`,
      });
    }

    return {
      mode: "proposal_only",
      root,
      obsidian,
      archive: {
        subdir: "90_Archive/CereBro Session History",
        indexTitle: "CereBro Session History",
        indexPath: "90_Archive/CereBro Session History/CereBro Session History.md",
        writePolicy:
          "Do not write snapshots until the user approves the folder/index shape and selected candidates.",
      },
      candidates,
      recommendations: [
        "Keep CEREBRO_SESSION_HANDOFF.md as the live repo handoff for Codex restart context.",
        "Save approved timestamped snapshots into Obsidian so the vault has a readable build history.",
        "Maintain one index note that links the latest snapshot, session timeline, checks, risks, and next-session prompt.",
        "Do not import old planning docs as session handoffs unless the user explicitly selects them.",
      ],
    };
  }),
});

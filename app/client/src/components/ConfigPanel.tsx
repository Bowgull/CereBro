/**
 * ConfigPanel - Bridge configuration and connection status
 * Shows the Bridge API Key and instructions for running the local bridge script
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Button } from "@/components/ui/button";

interface ConfigPanelProps {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: ConfigPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const { data: bridgeData, isLoading: keyLoading } = trpc.agents.bridgeApiKey.useQuery();
  const { data: status } = trpc.agents.connectionStatus.useQuery();

  const serverUrl = window.location.origin;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const bridgeCommand = bridgeData?.apiKey
    ? `CLAUDE_DUNGEON_SERVER=${serverUrl} CLAUDE_DUNGEON_API_KEY=${bridgeData.apiKey} node claude-dungeon-bridge.mjs`
    : "Loading...";
  const bridgeKeyLabel = bridgeData?.apiKey
    ? `${bridgeData.apiKey.slice(0, 8)}...${bridgeData.apiKey.slice(-6)}`
    : "Loading...";

  return (
    <div
      className="h-full w-full overflow-hidden p-3"
      style={{ background: C.background }}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-md"
        style={{ background: C.background, color: C.textPrimary, border: `1px solid ${C.border}`, fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Basement Configuration
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              Local bridge, session watcher, and machine status.
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: C.textMuted }}
          >
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Connection Status */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>
              Machine Status
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Server URL", value: serverUrl, ok: true },
                { label: "Claude Dir", value: status?.claudeDir || "~/.claude", ok: status?.claudeExists },
                { label: "Projects Dir", value: status?.projectsDir || "~/.claude/projects", ok: status?.projectsExists },
                { label: "Tracked Projects", value: String(status?.trackedProjects ?? 0), ok: (status?.trackedProjects ?? 0) > 0 },
                { label: "Total Sessions", value: String(status?.totalSessions ?? 0), ok: (status?.totalSessions ?? 0) > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2 px-2.5 py-1.5 rounded" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <span style={{ color: item.ok ? C.success : C.warning }}>
                    {item.ok ? "✓" : "○"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs" style={{ color: C.textMuted }}>{item.label}</div>
                    <div className="truncate text-xs" style={{ color: C.textPrimary }} title={item.value}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bridge API Key */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.gold }}>
              Bridge API Key
            </h3>
            <p className="text-xs mb-3" style={{ color: C.textMuted }}>
              Local session watcher authentication. Treat this like a secret.
            </p>
            {keyLoading ? (
              <div className="text-xs animate-pulse" style={{ color: C.textMuted }}>Generating key.</div>
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2.5 py-1.5 text-xs rounded font-mono truncate" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.gold }}>
                  {bridgeKeyLabel}
                </code>
                <Button
                  type="button"
                  onClick={() => bridgeData?.apiKey && copyToClipboard(bridgeData.apiKey, "key")}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  title="Copy the local bridge API key. Treat it like a secret."
                  aria-label="Copy local bridge API key"
                  style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
                >
                  {copied === "key" ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </section>

          <details>
            <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.gold, ["--tw-ring-color" as string]: C.accent }}>
              Local Bridge Setup
            </summary>
            <div className="space-y-2.5">
              <div>
                <div className="text-xs mb-1" style={{ color: C.textMuted }}>1. Download the bridge script.</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2.5 py-1.5 text-xs rounded truncate" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.success }} title={`curl -O ${serverUrl}/bridge/claude-dungeon-bridge.mjs`}>
                    {compactCommandLabel(`curl -O ${serverUrl}/bridge/claude-dungeon-bridge.mjs`)}
                  </code>
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(`curl -O ${serverUrl}/bridge/claude-dungeon-bridge.mjs`, "download")}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    title="Copy the bridge download command. This button does not run it."
                    aria-label="Copy bridge download command"
                    style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
                  >
                    {copied === "download" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-xs mb-1" style={{ color: C.textMuted }}>2. Run the bridge with Node 22.</div>
                <div className="flex items-start gap-2">
                  <code className="flex-1 px-2.5 py-1.5 text-xs rounded truncate leading-relaxed" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.success }}>
                    {compactCommandLabel(bridgeCommand)}
                  </code>
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(bridgeCommand, "cmd")}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    title="Copy the local bridge command. This button does not run it."
                    aria-label="Copy local bridge run command"
                    style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
                  >
                    {copied === "cmd" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-xs mb-1" style={{ color: C.textMuted }}>3. Start Claude Code in any project.</div>
                <code className="block px-2.5 py-1.5 text-xs rounded" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.success }}>
                  claude  # or claude-code
                </code>
              </div>

              <div className="px-2.5 py-1.5 rounded text-xs" style={{ background: `${C.success}12`, border: `1px solid ${C.success}44`, color: C.success }}>
                Active sessions appear in the Keep and Ledger.
              </div>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.gold, ["--tw-ring-color" as string]: C.accent }}>
              How It Works
            </summary>
            <div className="mt-2 text-xs space-y-2 leading-relaxed" style={{ color: C.textMuted }}>
              <div className="flex gap-2">
                <span style={{ color: C.accent }} className="shrink-0">›</span>
                <span>The bridge script monitors <code style={{ color: C.gold }}>~/.claude/projects/</code> on your local machine.</span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: C.accent }} className="shrink-0">›</span>
                <span>It reads Claude Code JSONL transcript files to detect session activity.</span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: C.accent }} className="shrink-0">›</span>
                <span>Tool events map to agent state, route, receipts, and Ledger records.</span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: C.accent }} className="shrink-0">›</span>
                <span>Session data is pushed to this server through the bridge API.</span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: C.accent }} className="shrink-0">›</span>
                <span>The Keep receives updates through WebSocket and shows live state.</span>
              </div>
            </div>
          </details>

          {/* Tracked Projects */}
          {status?.projects && status.projects.length > 0 && (
            <details>
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.gold, ["--tw-ring-color" as string]: C.accent }}>
                Tracked Projects ({status.projects.length})
              </summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {status.projects.map((p) => (
                  <div key={p.encodedName} className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    <span className="truncate flex-1" style={{ color: C.textPrimary }}>{p.realPath}</span>
                    <span className="shrink-0 ml-2" style={{ color: C.textMuted }}>{p.sessionCount} session{p.sessionCount !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="sm"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

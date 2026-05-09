/**
 * SkillsManager - Manage real Claude Code Agents and Skills
 *
 * Agents: ~/.claude/agents/<name>.md (global) and <project>/.claude/agents/<name>.md (project)
 * Skills: ~/.claude/skills/<name>/SKILL.md (global) and <project>/.claude/skills/<name>/SKILL.md (project)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  X, Plus, Trash2, Edit3, Save, RefreshCw, Globe, FolderOpen,
  Bot, Zap, ChevronDown, ChevronRight, Copy, AlertCircle
} from "lucide-react";

const DEFAULT_AGENT_TEMPLATE = `---
name: my-agent
description: A specialized agent for specific tasks
tools: Read, Write, Bash
model: sonnet
---

You are a specialized assistant. Your role is to...

## Capabilities
- Describe what this agent can do

## Instructions
- Provide specific instructions here
`;

const DEFAULT_SKILL_TEMPLATE = `---
name: my-skill
description: Describe when Claude should use this skill automatically
---

## Instructions

Write your skill instructions here. Claude will follow these when the skill is invoked.

### Example usage
- Step 1: ...
- Step 2: ...
`;

interface AgentEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  title: string;
}

function ItemEditor({ initialContent, onSave, onCancel, title }: AgentEditorProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_AGENT_TEMPLATE);
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl flex flex-col font-mono" style={{ maxHeight: "90vh", background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}>
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: C.gold }}>{title}</h3>
          <Button type="button" onClick={onCancel} aria-label="Close editor" variant="ghost" size="icon-sm">
            <X size={18} />
          </Button>
        </div>
        <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
          <div className="text-xs rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            <strong style={{ color: C.accent }}>Format:</strong> YAML frontmatter between <code>---</code> markers, then Markdown system prompt.
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-80 font-mono text-xs"
            style={{ minHeight: "320px", color: C.success }}
            spellCheck={false}
          />
        </div>
        <div className="flex gap-2 p-3" style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface }}>
          <Button
            type="button"
            onClick={() => onSave(content)}
            variant="default"
          >
            <Save size={14} /> Save
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
          >
            <X size={14} /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SkillsManagerProps {
  onClose: () => void;
  projects: Array<{ encodedName: string; realPath: string; sessionCount: number }>;
}

export default function SkillsManager({ onClose, projects }: SkillsManagerProps) {
  const [activeTab, setActiveTab] = useState<"agents" | "skills">("agents");
  const [scope, setScope] = useState<"global" | "project">("global");
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.realPath || "");
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<{ name: string; content: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ── Agents Queries ──────────────────────────────────────────────────────────
  const globalAgents = trpc.agents.globalAgents.useQuery(undefined, { refetchInterval: 3000 });
  const projectAgents = trpc.agents.projectAgents.useQuery(
    { projectPath: selectedProject },
    { enabled: scope === "project" && !!selectedProject, refetchInterval: 3000 }
  );

  // ── Skills Queries ──────────────────────────────────────────────────────────
  const globalSkills = trpc.agents.globalSkills.useQuery(undefined, { refetchInterval: 3000 });
  const projectSkills = trpc.agents.projectSkills.useQuery(
    { projectPath: selectedProject },
    { enabled: scope === "project" && !!selectedProject, refetchInterval: 3000 }
  );

  // ── Agent Mutations ─────────────────────────────────────────────────────────
  const createGlobalAgent = trpc.agents.createGlobalAgent.useMutation({
    onSuccess: () => { globalAgents.refetch(); toast.success("Agent created!"); setShowEditor(false); setNewItemName(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateGlobalAgent = trpc.agents.updateGlobalAgent.useMutation({
    onSuccess: () => { globalAgents.refetch(); toast.success("Agent updated!"); setShowEditor(false); setEditingItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteGlobalAgent = trpc.agents.deleteGlobalAgent.useMutation({
    onSuccess: () => { globalAgents.refetch(); toast.success("Agent deleted!"); },
    onError: (e) => toast.error(e.message),
  });
  const createProjectAgent = trpc.agents.createProjectAgent.useMutation({
    onSuccess: () => { projectAgents.refetch(); toast.success("Project agent created!"); setShowEditor(false); setNewItemName(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateProjectAgent = trpc.agents.updateProjectAgent.useMutation({
    onSuccess: () => { projectAgents.refetch(); toast.success("Project agent updated!"); setShowEditor(false); setEditingItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProjectAgent = trpc.agents.deleteProjectAgent.useMutation({
    onSuccess: () => { projectAgents.refetch(); toast.success("Project agent deleted!"); },
    onError: (e) => toast.error(e.message),
  });

  // ── Skill Mutations ─────────────────────────────────────────────────────────
  const createGlobalSkill = trpc.agents.createGlobalSkill.useMutation({
    onSuccess: () => { globalSkills.refetch(); toast.success("Skill created!"); setShowEditor(false); setNewItemName(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateGlobalSkill = trpc.agents.updateGlobalSkill.useMutation({
    onSuccess: () => { globalSkills.refetch(); toast.success("Skill updated!"); setShowEditor(false); setEditingItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteGlobalSkill = trpc.agents.deleteGlobalSkill.useMutation({
    onSuccess: () => { globalSkills.refetch(); toast.success("Skill deleted!"); },
    onError: (e) => toast.error(e.message),
  });
  const createProjectSkill = trpc.agents.createProjectSkill.useMutation({
    onSuccess: () => { projectSkills.refetch(); toast.success("Project skill created!"); setShowEditor(false); setNewItemName(""); },
    onError: (e) => toast.error(e.message),
  });
  const updateProjectSkill = trpc.agents.updateProjectSkill.useMutation({
    onSuccess: () => { projectSkills.refetch(); toast.success("Project skill updated!"); setShowEditor(false); setEditingItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProjectSkill = trpc.agents.deleteProjectSkill.useMutation({
    onSuccess: () => { projectSkills.refetch(); toast.success("Project skill deleted!"); },
    onError: (e) => toast.error(e.message),
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = (content: string) => {
    if (editingItem) {
      if (activeTab === "agents") {
        if (scope === "global") updateGlobalAgent.mutate({ agentName: editingItem.name, content });
        else updateProjectAgent.mutate({ projectPath: selectedProject, agentName: editingItem.name, content });
      } else {
        if (scope === "global") updateGlobalSkill.mutate({ skillName: editingItem.name, content });
        else updateProjectSkill.mutate({ projectPath: selectedProject, skillName: editingItem.name, content });
      }
    } else {
      if (!newItemName.trim()) { toast.error("Name is required"); return; }
      const safeName = newItemName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      if (activeTab === "agents") {
        if (scope === "global") createGlobalAgent.mutate({ agentName: safeName, content });
        else createProjectAgent.mutate({ projectPath: selectedProject, agentName: safeName, content });
      } else {
        if (scope === "global") createGlobalSkill.mutate({ skillName: safeName, content });
        else createProjectSkill.mutate({ projectPath: selectedProject, skillName: safeName, content });
      }
    }
  };

  const handleDelete = (name: string) => {
    if (activeTab === "agents") {
      if (scope === "global") deleteGlobalAgent.mutate({ agentName: name });
      else deleteProjectAgent.mutate({ projectPath: selectedProject, agentName: name });
    } else {
      if (scope === "global") deleteGlobalSkill.mutate({ skillName: name });
      else deleteProjectSkill.mutate({ projectPath: selectedProject, skillName: name });
    }
    setDeleteTarget(null);
  };

  const currentItems = activeTab === "agents"
    ? (scope === "global" ? globalAgents.data : projectAgents.data) ?? []
    : (scope === "global" ? globalSkills.data : projectSkills.data) ?? [];

  const isLoading = activeTab === "agents"
    ? (scope === "global" ? globalAgents.isLoading : projectAgents.isLoading)
    : (scope === "global" ? globalSkills.isLoading : projectSkills.isLoading);

  const pathInfo = activeTab === "agents"
    ? (scope === "global" ? "~/.claude/agents/<name>.md" : `<project>/.claude/agents/<name>.md`)
    : (scope === "global" ? "~/.claude/skills/<name>/SKILL.md" : `<project>/.claude/skills/<name>/SKILL.md`);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
        <div className="w-full max-w-4xl flex flex-col font-mono" style={{ maxHeight: "90vh", background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: C.gold }}>Claude Code Manager</h2>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{pathInfo}</p>
            </div>
            <Button type="button" onClick={onClose} aria-label="Close Claude Code Manager" variant="ghost" size="icon-sm">
              <X size={20} />
            </Button>
          </div>

          {/* Tab Bar */}
          <div className="flex" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
            <Button
              type="button"
              onClick={() => setActiveTab("agents")}
              variant={activeTab === "agents" ? "secondary" : "ghost"}
              className="h-auto rounded-none border-b-2 px-4 py-2.5"
              style={{ borderBottomColor: activeTab === "agents" ? C.gold : "transparent", color: activeTab === "agents" ? C.gold : C.textMuted }}
            >
              <Bot size={14} /> Agents
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("skills")}
              variant={activeTab === "skills" ? "secondary" : "ghost"}
              className="h-auto rounded-none border-b-2 px-4 py-2.5"
              style={{ borderBottomColor: activeTab === "skills" ? C.gold : "transparent", color: activeTab === "skills" ? C.gold : C.textMuted }}
            >
              <Zap size={14} /> Skills
            </Button>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-3 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surfaceMuted }}>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setScope("global")}
                variant={scope === "global" ? "secondary" : "outline"}
                size="sm"
              >
                <Globe size={12} /> Global
              </Button>
              <Button
                type="button"
                onClick={() => setScope("project")}
                variant={scope === "project" ? "secondary" : "outline"}
                size="sm"
              >
                <FolderOpen size={12} /> Project
              </Button>
            </div>

            {scope === "project" && (
              <Select
                value={selectedProject || "none"}
                onValueChange={(value) => setSelectedProject(value === "none" ? "" : value)}
              >
                <SelectTrigger aria-label="Select Claude Code project" className="flex-1 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="none" disabled>No projects detected yet</SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.encodedName} value={p.realPath}>
                      {p.realPath.split("/").pop() || p.realPath} ({p.sessionCount} sessions)
                    </SelectItem>
                  ))
                )}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (activeTab === "agents") scope === "global" ? globalAgents.refetch() : projectAgents.refetch();
                  else scope === "global" ? globalSkills.refetch() : projectSkills.refetch();
                }}
                variant="ghost"
                size="icon-sm"
                aria-label="Refresh Claude Code agents and skills"
                title="Refresh"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </Button>
              <Button
                type="button"
                onClick={() => { setEditingItem(null); setShowEditor(true); }}
                variant="default"
                size="sm"
              >
                <Plus size={12} /> New {activeTab === "agents" ? "Agent" : "Skill"}
              </Button>
            </div>
          </div>

          {/* New Item Name Input */}
          {showEditor && !editingItem && (
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}>
              <span className="text-xs" style={{ color: C.textMuted }}>Name:</span>
              <Input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder={activeTab === "agents" ? "my-agent" : "my-skill"}
                className="h-7 w-48 font-mono text-xs"
                style={{ color: C.success }}
                autoFocus
                onKeyDown={(e) => e.key === "Escape" && setShowEditor(false)}
              />
              <span className="text-xs" style={{ color: C.textMuted }}>.md</span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {scope === "project" && !selectedProject && (
              <div className="flex items-center gap-2 text-xs p-3 rounded" style={{ color: C.warning, background: `${C.warning}14`, border: `1px solid ${C.warning}44` }}>
                <AlertCircle size={14} />
                No project selected. Start Claude Code in a project to see it here.
              </div>
            )}

            {currentItems.length === 0 && !isLoading && (
              <div className="grid place-items-center gap-2 py-10 text-center">
                {activeTab === "agents" ? <Bot size={22} style={{ color: C.textMuted }} /> : <Zap size={22} style={{ color: C.textMuted }} />}
                <p className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>
                  No {activeTab} found in {scope} scope
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>{pathInfo}</p>
              </div>
            )}

            {currentItems.map((item: any) => (
              <div
                key={item.name}
                className="overflow-hidden rounded transition-colors"
                style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
              >
                <div
                  className="flex items-center justify-between p-2.5 cursor-pointer"
                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {activeTab === "agents" ? <Bot size={14} style={{ color: C.gold }} /> : <Zap size={14} style={{ color: C.gold }} />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate" style={{ color: C.success }}>{item.name}</span>
                        {item.model && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>{item.model}</span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: C.textMuted }}>{item.description || "No description"}</p>
                      {item.tools && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: C.accent }}>Tools: {item.tools}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <Button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.content); toast.success("Copied!"); }}
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Copy ${item.name}`}
                      title="Copy content"
                    >
                      <Copy size={13} />
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingItem({ name: item.name, content: item.content }); setShowEditor(true); }}
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${item.name}`}
                      title="Edit"
                    >
                      <Edit3 size={13} />
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.name); }}
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Delete ${item.name}`}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </Button>
                    {expandedItem === item.name
                      ? <ChevronDown size={14} style={{ color: C.textMuted }} />
                      : <ChevronRight size={14} style={{ color: C.textMuted }} />
                    }
                  </div>
                </div>

                {expandedItem === item.name && (
                  <div className="p-2.5" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap p-2 rounded max-h-48 overflow-y-auto" style={{ color: C.success, background: C.backgroundSoft, border: `1px solid ${C.borderSoft}` }}>
                      {item.content}
                    </pre>
                    <p className="text-xs mt-2 truncate" style={{ color: C.textMuted }} title={item.agentPath || item.skillPath}>
                      {item.agentPath || item.skillPath}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <ItemEditor
          title={editingItem
            ? `Edit ${activeTab === "agents" ? "Agent" : "Skill"}: ${editingItem.name}`
            : `New ${activeTab === "agents" ? "Agent" : "Skill"}`}
          initialContent={editingItem?.content || (activeTab === "agents" ? DEFAULT_AGENT_TEMPLATE : DEFAULT_SKILL_TEMPLATE)}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingItem(null); setNewItemName(""); }}
        />
      )}

      <Dialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent gate>
          <DialogHeader>
            <DialogTitle>Delete {activeTab === "agents" ? "Agent" : "Skill"}</DialogTitle>
            <DialogDescription>
              This deletes `{deleteTarget}` from the selected Claude Code scope. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.warning }}>
              Target
            </div>
            <div style={{ color: C.textPrimary }}>{deleteTarget}</div>
            <div className="mt-1" style={{ color: C.textMuted }}>{pathInfo}</div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

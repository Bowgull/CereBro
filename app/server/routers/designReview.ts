import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { recordPermissionPreflight } from "../permissionPolicy";

const reviewTargets = ["keep", "workbench", "ledger", "settings", "deck", "prototype", "copy", "asset", "other"] as const;
const reviewStatuses = ["needs_review", "ready_for_patch", "blocked", "passed_local_review"] as const;
const checklistKeys = [
  "design_md_loaded",
  "existing_renderer_read",
  "assets_inventoried",
  "generic_ui_checked",
  "proof_visible",
  "aang_cortana_route_visible",
  "copy_voice_checked",
  "motion_has_function",
  "placeholder_named",
  "visual_check_recorded",
] as const;

type ChecklistKey = (typeof checklistKeys)[number];

const checklistLabels: Record<ChecklistKey, string> = {
  design_md_loaded: "DESIGN.md loaded",
  existing_renderer_read: "Renderer read",
  assets_inventoried: "Assets inventoried",
  generic_ui_checked: "Generic UI checked",
  proof_visible: "Proof visible",
  aang_cortana_route_visible: "Aang to Cortana route visible",
  copy_voice_checked: "Voice checked",
  motion_has_function: "Motion has function",
  placeholder_named: "Placeholder named",
  visual_check_recorded: "Visual check recorded",
};

function parseJsonArray(value: unknown): string[] {
  if (value == null) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value).split("\n").map((item) => item.trim()).filter(Boolean);
  }
}

function rowToReview(row: Record<string, unknown>) {
  const checklist = parseJsonArray(row.checklist_json);
  const violations = parseJsonArray(row.violations_json);
  const nextActions = parseJsonArray(row.next_actions_json);
  const passedCount = checklist.length;
  return {
    id: Number(row.id),
    targetType: String(row.target_type),
    targetLabel: String(row.target_label),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    evidenceId: row.evidence_id == null ? null : Number(row.evidence_id),
    status: String(row.status),
    ownerAgent: String(row.owner_agent),
    routeChain: String(row.route_chain),
    checklist,
    violations,
    nextActions,
    proofSummary: String(row.proof_summary),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    createdAt: Number(row.created_at),
    checklistScore: `${passedCount}/${checklistKeys.length}`,
  };
}

export const designReviewRouter = router({
  plan: publicProcedure.query(() => ({
    mode: "proposal_only" as const,
    writesExternal: false,
    opensBrowser: false,
    capturesMedia: false,
    executesCommand: false,
    ownerAgent: "gojo",
    supportAgents: ["aang", "cortana", "tony", "spock", "oak"],
    sourceFiles: [
      "DESIGN.md",
      "CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md",
      "CereBro_Claude_Code_Repo_Starter_Pack/skills/frontend-design.skill.md",
      "CereBro_Claude_Code_Repo_Starter_Pack/skills/anti-slop-review.skill.md",
    ],
    routeChain: ["Aang reads mode", "Cortana routes", "Gojo reviews", "Tony patches", "Spock checks", "Oak validates"],
    checklist: checklistKeys.map((key) => ({
      key,
      label: checklistLabels[key],
    })),
    gates: [
      "This panel records local design review state only.",
      "It does not inspect screenshots by itself, open a browser, run commands, change files, or write externally.",
      "A review is not proof until a screenshot, preview, or Workbench evidence record is linked.",
    ],
  })),

  list: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          status: z.enum(reviewStatuses).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.projectId !== undefined) {
        where.push("drr.project_id = ?");
        args.push(input.projectId);
      }
      if (input?.status !== undefined) {
        where.push("drr.status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 30);
      const result = await db.execute({
        sql: `
          SELECT drr.*, p.name AS project_name
          FROM design_review_records drr
          LEFT JOIN projects p ON p.id = drr.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY drr.created_at DESC, drr.id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToReview);
      return {
        mode: "read_only" as const,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        items,
        summary: {
          total: items.length,
          blocked: items.filter((item) => item.status === "blocked").length,
          readyForPatch: items.filter((item) => item.status === "ready_for_patch").length,
          linkedEvidence: items.filter((item) => item.evidenceId != null).length,
        },
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        targetType: z.enum(reviewTargets),
        targetLabel: z.string().min(1).max(160),
        projectId: z.number().int().nullable().optional(),
        evidenceId: z.number().int().nullable().optional(),
        status: z.enum(reviewStatuses).default("needs_review"),
        checklist: z.array(z.enum(checklistKeys)).default([]),
        violations: z.array(z.string().min(1).max(220)).max(12).default([]),
        nextActions: z.array(z.string().min(1).max(220)).min(1).max(8),
        proofSummary: z.string().min(1).max(1600),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const { row: preflight } = await recordPermissionPreflight(db, {
        perceptionClass: "explicit_context",
        actionClass: "local_note",
        requestedByAgent: "gojo",
        targetSummary: `design_review: ${input.targetType} ${input.targetLabel}`,
        sensitiveData: false,
        additionalReasons: [
          "Design review records are local append-only history.",
          "This records checklist state only. Browser, screenshot, command, file, and external writes stay separately gated.",
        ],
      });
      const permissionPreflightId = Number(preflight.id);
      const routeChain = "Aang reads mode -> Cortana routes -> Gojo reviews -> Tony patches -> Spock checks -> Oak validates";
      const result = await db.execute({
        sql: `
          INSERT INTO design_review_records (
            target_type, target_label, project_id, evidence_id, status,
            owner_agent, route_chain, checklist_json, violations_json,
            next_actions_json, proof_summary, permission_preflight_id
          )
          VALUES (?, ?, ?, ?, ?, 'gojo', ?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.targetType,
          input.targetLabel,
          input.projectId ?? null,
          input.evidenceId ?? null,
          input.status,
          routeChain,
          JSON.stringify(input.checklist),
          JSON.stringify(input.violations),
          JSON.stringify(input.nextActions),
          input.proofSummary,
          permissionPreflightId,
        ],
      });
      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        executesCommand: false,
        review: rowToReview(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created one local design review record.",
          "Recorded one local permission preflight audit row.",
          "This did not inspect screenshots, open a browser, run a command, edit files, save media, or write externally.",
        ],
      };
    }),
});


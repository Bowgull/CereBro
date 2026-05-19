import { describe, expect, it } from "vitest";
import { approvalPanelCopy, approvalRunnerStateCopy } from "../client/src/lib/approvalPanelCopyModel";

describe("approvalPanelCopyModel", () => {
  it("frames approvals as waiting gates without primary-surface machinery", () => {
    const copy = approvalPanelCopy();
    const combined = [
      copy.title,
      copy.subtitle,
      copy.summaryAria,
      copy.stats.pending,
      copy.stats.checks,
      copy.searchLabel,
      copy.resetAria,
      copy.groupsAria,
      copy.groupsSubtitle,
      copy.localOnly,
      copy.gateLoading,
      copy.checksAria,
      copy.checksSubtitle,
      copy.auditHistory,
      copy.checkLoading,
      copy.checkEmpty,
      copy.empty,
      copy.checkedChip,
      copy.listAria,
      copy.detailAria,
      copy.selectEmpty,
      copy.policyCheckLabel,
      copy.permissionCheckTitle,
      copy.permissionCheckMissing,
      copy.chainTitle,
      copy.chainDetail,
      copy.chainCheckLabel,
      copy.chainNextLabel,
    ].join(" ").toLowerCase();

    expect(copy.title).toBe("Waiting Gates");
    expect(copy.subtitle).toContain("Nothing runs");
    expect(copy.permissionCheckTitle).toBe("Permission Check");
    expect(copy.chainTitle).toBe("Review Path");
    expect(combined).not.toContain("receipt");
    expect(combined).not.toContain("preflight");
    expect(combined).not.toContain("policy");
    expect(combined).not.toContain("proof");
  });

  it("marks Project Lab git-write approvals as decision-only runner blocked", () => {
    const state = approvalRunnerStateCopy({
      actionType: "project_manual_push",
      costRisk: "git_remote_write",
      origin: "project_lab",
      targetType: "project",
    });

    expect(state.label).toBe("runner blocked");
    expect(state.tone).toBe("warning");
    expect(state.body).toContain("records the decision only");
    expect(state.body).toContain("Git remote writes stay manual");
    expect(state.body).not.toContain("runs");
  });

  it("keeps normal approvals framed as review gates", () => {
    const state = approvalRunnerStateCopy({
      actionType: "terminal_read",
      costRisk: "none",
      origin: "terminal",
      targetType: "command_observation",
    });

    expect(state.label).toBe("review gate");
    expect(state.tone).toBe("accent");
    expect(state.body).toContain("does not execute");
    expect(state.body).not.toContain("Git remote writes");
  });
});

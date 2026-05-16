import { describe, expect, it } from "vitest";
import { approvalPanelCopy } from "../client/src/lib/approvalPanelCopyModel";

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
});

import { describe, expect, it } from "vitest";
import {
  CereBroButton,
  CereBroCard,
  CereBroChrome,
  CereBroChromeMark,
  CereBroDock,
  CereBroEmptyState,
  CereBroFormField,
  CereBroFrame,
  CereBroList,
  CereBroListRow,
  CereBroMenuSurface,
  CereBroMedallion,
  CereBroOmnibox,
  CereBroPanel,
  CereBroRail,
  CereBroShell,
  CereBroTab,
  CereBroWorkspaceFrame,
} from "@/components/cerebro-ui";

describe("cerebro-ui primitives", () => {
  it("exports the brand primitive component set", () => {
    const primitives = [
      CereBroButton,
      CereBroCard,
      CereBroChrome,
      CereBroChromeMark,
      CereBroDock,
      CereBroEmptyState,
      CereBroFormField,
      CereBroFrame,
      CereBroList,
      CereBroListRow,
      CereBroMenuSurface,
      CereBroMedallion,
      CereBroOmnibox,
      CereBroPanel,
      CereBroRail,
      CereBroShell,
      CereBroTab,
      CereBroWorkspaceFrame,
    ];

    for (const primitive of primitives) {
      expect(primitive).toBeTruthy();
    }
  });
});

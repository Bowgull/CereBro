import { describe, expect, it } from "vitest";
import {
  CereBroButton,
  CereBroCard,
  CereBroDock,
  CereBroFrame,
  CereBroMedallion,
  CereBroOmnibox,
  CereBroPanel,
  CereBroTab,
} from "@/components/cerebro-ui";

describe("cerebro-ui primitives", () => {
  it("exports the brand primitive component set", () => {
    const primitives = [
      CereBroButton,
      CereBroCard,
      CereBroDock,
      CereBroFrame,
      CereBroMedallion,
      CereBroOmnibox,
      CereBroPanel,
      CereBroTab,
    ];

    for (const primitive of primitives) {
      expect(primitive).toBeTruthy();
    }
  });
});

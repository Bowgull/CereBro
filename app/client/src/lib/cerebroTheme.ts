export const cerebroBrand = {
  color: {
    ink950: "#020505",
    ink900: "#050908",
    ink850: "#07100e",
    ink800: "#0a1714",
    green950: "#03120f",
    green900: "#08241d",
    green800: "#103b2f",
    green700: "#1c5545",
    green600: "#6cae74",
    gold800: "#5f4120",
    gold700: "#8f6330",
    gold500: "#c69b55",
    gold300: "#e6c284",
    parchment100: "#f4efe3",
    parchment200: "#ead7ad",
    parchment300: "#d2aa69",
    muted500: "#8c8a7e",
    muted600: "#6f726b",
    danger500: "#d56b52",
  },
  line: {
    brass: "rgba(198, 155, 85, 0.42)",
    brassSoft: "rgba(198, 155, 85, 0.22)",
    greenSoft: "rgba(77, 170, 154, 0.24)",
  },
  surface: {
    shell: "radial-gradient(circle at 50% 0%, rgba(198, 155, 85, 0.16), transparent 20%), linear-gradient(145deg, rgba(12, 15, 14, 0.99), rgba(3, 7, 7, 0.99))",
    address: "linear-gradient(180deg, rgba(2, 7, 7, 0.98), rgba(8, 15, 14, 0.98))",
    plaque: "linear-gradient(180deg, rgba(42, 46, 38, 0.96), rgba(8, 18, 16, 0.98))",
    plaqueActive: "linear-gradient(180deg, rgba(48, 71, 59, 0.98), rgba(12, 30, 26, 0.98))",
    page: "radial-gradient(circle at 50% 0%, rgba(77, 170, 154, 0.08), transparent 32%), repeating-linear-gradient(0deg, rgba(244, 239, 227, 0.018) 0 1px, transparent 1px 4px), linear-gradient(180deg, rgba(6, 10, 11, 0.99), rgba(2, 5, 6, 0.99))",
    stoneField: "radial-gradient(circle at 52% 36%, rgba(214, 158, 67, 0.12), transparent 26%), repeating-radial-gradient(circle at 53% 36%, rgba(198, 155, 85, 0.1) 0 1px, transparent 1px 42px), linear-gradient(180deg, #07100e, #020505)",
  },
  shadow: {
    shell: "0 24px 70px rgba(0, 0, 0, 0.52)",
    bevel: "inset 0 1px 0 rgba(244, 239, 227, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.68)",
    insetDeep: "inset 0 1px 44px rgba(0, 0, 0, 0.56)",
  },
  radius: {
    frame: 4,
    control: 6,
    medallion: 999,
  },
  font: {
    display: 'Georgia, "Times New Roman", serif',
    ui: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  },
} as const;

export type CereBroBrand = typeof cerebroBrand;

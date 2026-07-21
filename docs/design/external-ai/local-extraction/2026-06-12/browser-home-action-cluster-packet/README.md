# Browser Home Action Cluster Extraction Packet

Generated: 2026-06-12T22:13:47.596Z

Source of truth:

`mockups/approved/browser-home-symmetric-rails-target-v1.png`

SHA-256:

`f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

This packet is for no-cost extraction only. It does not authorize production replacement.

## Target

- Active asset: `app/client/public/browser-home/assets/top-url-action-cluster.png`
- Source box: `1309,69,240,52`
- Browser panel box: `1164,69,240,52`
- Required output: full-cluster `traced-svg` or `external-ai-reference`
- Best local trace so far: `imagetracer / imagetracer-high-color-fine / mismatch 0.045592948717948716 / svg 732597`

## Files

- `expected/top-url-action-cluster.png`: locked mockup crop.
- `actual/top-url-action-cluster.png`: current installed screenshot crop normalized to mockup size.
- `diff/top-url-action-cluster.png`: strict visual diff crop.
- `asset/top-url-action-cluster.png`: current production raster asset.
- `zoom/*-4x.png`: nearest-neighbor zooms for manual inspection.

## Prior Rejection

The previous production attempt split the cluster into source crops plus CSS status dots. It regressed strict diff from `0.08346456192123741` to `0.08349381805230488`, then `0.08348936603235982` after tuning.

Do not retry that path.

## Extraction Rules

- No full-screen screenshot UI.
- No raster image embedding in SVG.
- No invented icon, frame, glow, dot, border, gradient, or ornament.
- Preserve the shield button, library button, stats button, page-actions button, inner bevels, green shield glow, status dot, and brass frame language.
- Preserve the exact 240 x 52 target box.
- Preserve real hitboxes in production. The visual extraction is not the interaction model.

## No-Cost External Tool Prompt

```
Convert this exact CereBro Browser Home top URL action cluster crop into clean frontend-ready SVG/CSS reference.

Rules:
- Use only the provided crop as source.
- Do not redesign.
- Do not simplify into generic browser buttons.
- Do not embed the PNG as an image.
- Preserve the 240 x 52 layout, shield glow, status dot, brass borders, dark stone surfaces, and all four control frames.
- Return SVG or clear component measurements only.
- If text or icon detail cannot be represented, say which subpart failed instead of inventing a replacement.
```

## Acceptance Gates

```bash
pnpm --dir app run qa:browser-home-provenance
pnpm --dir app run qa:browser-home-trace-candidates
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/browserHomeTraceCandidateAudit.test.ts server/browserHomeBrandLayout.test.ts server/desktopInstalledSmoke.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run qa:browser-home-diff:strict
```

Production promotion also requires package, reinstall, installed-app screenshot, strict diff no worse than `0.08346456192123741`, and manual visual-review metadata.

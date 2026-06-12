# Browser Home Active Raster Readiness

This file ranks active Browser Home raster targets for the next mockup-to-code conversion attempt.
It does not authorize production replacement by itself.

Accepted strict diff: `0.08346456192123741`
Recommended next target: `top-url-action-cluster`

| Target | Text risk | Disposition | Best trace sweep | Next path |
| --- | --- | --- | --- | --- |
| top-url-action-cluster | none | best-next-external-extraction-target | imagetracer-high-color-fine / 0.045592948717948716 / 732597 | Best next small target, but only with a cleaner full-cluster vector extraction or no-cost external extraction. Do not split it again with approximate CSS dots. |
| top-url-omnibox | high | blocked-or-defer | imagetracer-very-high-color-fine / 0.020283931082981717 / 2109532 | Requires label-preserving extraction or a measured reconstruction that matches frame, search icon, and placeholder text under installed visual review. |
| bookmark-card-add | high | blocked-or-defer | vtracer-fine-spline / 0.023480036297640654 / 10842 | Do not retry without a new source-to-vector strategy or external extraction that preserves the Add label and frame. |
| center-field-title-star-map | high | blocked-or-defer | none | Needs full center-field vector extraction or seam-safe renderer before replacing medallions, title, or star-map pieces. |
| bottom-dock-row | low | blocked-or-defer | none | Promising only if the Aang dock controls can be simplified and the full bottom row can be split without seam drift. |
| lower-panel-assets | high | blocked-or-defer | none | Defer until text rendering and panel row primitives can be matched with installed visual review. |
| rail-full | high | blocked-or-defer | none | Needs external extraction or a measured full rail reconstruction. Do not invent compass or ornament geometry. |

Current conclusion: no active raster target is production-ready from local tracing alone. The next practical target is `top-url-action-cluster`, but it needs cleaner full-cluster extraction or no-cost external extraction before production.

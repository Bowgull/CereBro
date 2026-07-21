# Browser Home Trace Sweep

Local extraction evidence only. This does not authorize a production replacement by itself.

Source: `mockups/approved/browser-home-symmetric-rails-target-v1.png`
SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

| Target | Best preset | Mismatch ratio | Mismatched pixels | SVG length |
| --- | --- | ---: | ---: | ---: |
| top-url-omnibox | imagetracer-very-high-color-fine | 0.020283931082981717 | 923 | 2109532 |
| top-url-action-cluster | imagetracer-high-color-fine | 0.045592948717948716 | 569 | 732597 |
| bookmark-card-add | vtracer-fine-spline | 0.023480036297640654 | 414 | 10842 |
| panel-continue | imagetracer-very-high-color-fine | 0.036388578869047616 | 3130 | 6540214 |
| panel-recent | imagetracer-very-high-color-fine | 0.03503097667638484 | 3076 | 6258015 |
| panel-downloads | imagetracer-very-high-color-fine | 0.03305755046583851 | 2725 | 5748530 |
| aang-dock-controls | imagetracer-high-color-fine | 0.00562888198757764 | 435 | 4696227 |

QA image outputs are written under `app/output/qa/browser-home-trace-sweep/` and are intentionally not committed.

Manual installed-app review rejected `bookmark-card-add` with `vtracer-fine-spline`.
It produced a low numeric crop mismatch, but the visible `Add` label rendered incorrectly as `dd`.
Do not promote that candidate without a new label-preserving extraction.

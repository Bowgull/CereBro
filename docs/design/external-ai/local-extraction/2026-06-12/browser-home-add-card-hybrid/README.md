# Browser Home Add Card Hybrid Rejection

Source: `mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`
SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

Target box: `{ left: 1260, top: 458, width: 152, height: 116 }`

This pass tested a hybrid replacement for `bookmark-card-add.png`:

- VTracer card frame and plus geometry.
- Label region masked out.
- `Add` restored as measured vector text.

The best hybrid candidate was `text-12-y89-light.svg`.

| Candidate | Mismatched pixels | Mismatch ratio | Bytes | Decision |
| --- | ---: | ---: | ---: | --- |
| `vtracer-fine-spline` | 414 | `0.023480036297640654` | 10842 | Rejected. Label rendered as `dd` in installed review. |
| `vtracer-hybrid-label` | 552 | `0.03130671506352087` | 10721 | Rejected. Label is readable, but frame is flatter/chunkier and mismatch is worse. |

Manual visual review matters here. Numeric diff alone accepted the wrong text shape. The next add-card attempt needs a cleaner source-to-vector pass or a measured component reconstruction of the frame, plus, label, and status dot from the locked mockup.

Medallion note: the visible medallion rail still lives inside `center-field-title-star-map.png`. Standalone medallion replacement should wait until the center field can be split without seam drift, or until a full center-field vector extraction exists.

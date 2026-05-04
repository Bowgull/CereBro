# CereBro V1 — Content Engine Specification

## 1. Purpose

The Content Engine turns ideas, research, and outputs into reusable content assets.

This comes from the Blotato-style lesson, but CereBro should not become an auto-posting content farm.

V1 should support planning and drafting content, not automatic publishing.

## 2. Ownership

Primary owner:

- Gojo

Supporting agents:

- C-3PO
- Silver Surfer
- Aang
- Oak
- Tony if content requires technical implementation

## 3. Content Engine Scope

### V1 Required

Support:

- Idea capture
- Research-backed content outline
- Script draft
- Carousel/thread outline
- Video outline
- Remotion plan
- Publishing checklist
- Repurposing plan
- Output Library storage

### V1 Not Required

Do not build:

- Auto-posting
- Social account automation
- Full content calendar automation
- Analytics ingestion
- Engagement scraping
- Paid platform integrations

## 4. Content Object Schema

```json
{
  "content_id": "",
  "project_id": "",
  "task_id": "",
  "title": "",
  "content_type": "",
  "status": "",
  "idea": "",
  "audience": "",
  "goal": "",
  "source_ids": [],
  "draft_artifact_ids": [],
  "platforms": [],
  "repurpose_targets": [],
  "created_at": "",
  "updated_at": "",
  "validation_status": ""
}
```

Content type enum:

- idea
- post
- thread
- carousel
- script
- video_outline
- remotion_plan
- newsletter
- guide
- checklist

Status enum:

- captured
- researching
- outlining
- drafting
- reviewing
- ready
- archived

## 5. Content Pipeline

```text
Idea capture
  ↓
Audience + goal
  ↓
Research/source pull
  ↓
Angle selection
  ↓
Outline
  ↓
Draft
  ↓
Format-specific adaptation
  ↓
Gojo creative pass
  ↓
C-3PO clarity pass
  ↓
Oak validation
  ↓
Save to Output Library
  ↓
Optional Notion export
```

## 6. Output Templates

### 6.1 Post Draft

```md
# Post Draft

## Goal

## Audience

## Hook

## Main Point

## Supporting Points

## CTA

## Notes

## Repurpose Options
```

### 6.2 Thread Outline

```md
# Thread Outline

## Topic

## Audience

## Promise

## Post 1 Hook

## Posts

1.
2.
3.

## Closing CTA

## Sources

## Repurpose Notes
```

### 6.3 Carousel Outline

```md
# Carousel Outline

## Topic

## Visual Direction

## Slide 1 Hook

## Slides

1.
2.
3.

## Final Slide CTA

## Design Notes

## Sources
```

### 6.4 Video Script

```md
# Video Script

## Goal

## Audience

## Duration

## Hook

## Sections

## Script

## Visual Notes

## B-Roll / Assets

## Captions

## CTA

## Remotion Notes
```

### 6.5 Repurposing Plan

```md
# Repurposing Plan

## Original Asset

## Core Idea

## Turn Into

- Short post
- Thread
- Carousel
- Video script
- Guide
- Checklist

## Notes Per Format
```

## 7. Content Quality Rules

Content must avoid:

- Generic motivational slop
- Fake expertise
- Overly polished corporate tone unless requested
- Unclear audience
- Weak hook
- No source grounding when factual
- Too many formats at once
- Auto-posting without approval

## 8. Content Engine Done Means

Content Engine is complete when:

- Content ideas can be captured
- Content can link to sources
- Gojo can generate format-specific outlines
- C-3PO can polish drafts
- Oak can validate factual/source claims
- Outputs save to Output Library
- Auto-posting is not enabled by default

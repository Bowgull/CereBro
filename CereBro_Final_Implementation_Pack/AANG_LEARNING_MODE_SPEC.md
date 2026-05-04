# CereBro V1 — Aang Learning Mode Specification

## 1. Purpose

Aang Learning Mode helps the user learn topics over time and convert learning into structured artifacts.

This is inspired by NotebookLM-style source-grounded learning and the user's interest in learning tech, AI, coding, gaming, and practical skills.

## 2. Ownership

Primary owner:

- Aang

Supporting agents:

- Silver Surfer for source/video discovery
- C-3PO for learning artifact formatting
- Oak for accuracy validation
- Tony for coding/technical lessons
- Gojo for visual learning aids and diagrams

## 3. Learning Mode Scope

### V1 Required

Support:

- Beginner explanations
- Step-by-step guides
- Learning plans
- Quizzes
- Flashcards
- Checklists
- Video resource suggestions
- Save learning artifacts to Output Library
- Optional Notion export

### V1 Not Required

Do not build:

- Full spaced repetition system
- Full LMS
- Auto-generated course marketplace
- Progress analytics beyond basic task status
- Video downloading
- Paid course integration

## 4. Learning Request Flow

```text
User asks to learn something
  ↓
Aang identifies current level
  ↓
Context Engine checks existing learning notes
  ↓
Silver Surfer fetches sources if needed
  ↓
Aang explains simply
  ↓
C-3PO formats guide/checklist
  ↓
Oak validates factual accuracy
  ↓
User can save as guide, checklist, quiz, or Notion page
```

## 5. Learning Artifact Types

### Beginner Guide

Use when the user wants to understand a topic.

### Checklist

Use when the user needs repeatable steps.

### Quiz

Use when the user wants to test understanding.

### Flashcards

Use when the user wants memory aids.

### Practice Plan

Use when the user wants to improve a skill.

### Resource List

Use when useful videos/articles/tools should be saved.

## 6. Beginner Guide Template

```md
# [Topic] Beginner Guide

## Plain-English Explanation

## Why It Matters

## Core Concepts

## Example

## Step-by-Step

## Common Mistakes

## Practice Task

## Quick Quiz

## Useful Resources

## Next Lesson
```

## 7. Quiz Template

```md
# Quiz: [Topic]

## Questions

1.
2.
3.

## Answer Key

1.
2.
3.

## What To Review If You Missed These
```

## 8. Flashcard Template

```md
# Flashcards: [Topic]

## Cards

### Card 1

Front:
Back:

### Card 2

Front:
Back:
```

## 9. Coding Learning Flow

When teaching coding:

1. Explain the concept simply.
2. Show a tiny example.
3. Explain each line.
4. Show a practical use case.
5. Give a small exercise.
6. Explain common errors.
7. Offer to save as a guide.

Tony supports technical accuracy.

Oak validates.

## 10. Video Resource Behavior

When user likes video guides:

Silver Surfer can find videos if browser/web is enabled.

For each video resource:

- Title
- Creator/channel
- URL
- Why it helps
- Difficulty
- Relevant timestamps if available
- Notes
- Save to Source Library if approved

## 11. Outdated Note Detection

If Aang finds an existing learning note that may be outdated:

- Mark it as possibly stale.
- Ask Silver Surfer to refresh if current info matters.
- Do not overwrite without approval.
- Create updated version if approved.

## 12. Learning Mode Done Means

Learning Mode is complete when:

- Aang can explain a topic
- Aang can create beginner guide
- Aang can create quiz
- Aang can create checklist
- Silver Surfer can attach resources
- C-3PO can format learning output
- Oak can validate
- Output can save locally and optionally to Notion

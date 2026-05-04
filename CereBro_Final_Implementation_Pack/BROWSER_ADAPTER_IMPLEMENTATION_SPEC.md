# CereBro V1 — Browser Adapter Implementation Specification

## 1. Purpose

The Browser Adapter gives Silver Surfer controlled access to web sources and browser workflows.

Browser actions must be task-scoped, permissioned, logged, and recoverable.

## 2. Build Order

Implement in this order:

1. Browser adapter interface
2. Static URL source ingestion
3. Browser session logging
4. Screenshot capture
5. Playwright-based controlled browsing
6. Source extraction fallbacks
7. Browser automation actions
8. Optional Browser Use or Stagehand adapter
9. Optional Crawl4AI adapter
10. Advanced extraction parked

## 3. Browser Adapter Interface

TypeScript interface:

```ts
export interface BrowserAdapter {
  createSession(input: CreateBrowserSessionInput): Promise<BrowserSession>;
  navigate(input: NavigateInput): Promise<NavigateResult>;
  extract(input: ExtractInput): Promise<ExtractResult>;
  screenshot(input: ScreenshotInput): Promise<ScreenshotResult>;
  closeSession(input: CloseBrowserSessionInput): Promise<CloseBrowserSessionResult>;
}
```

## 4. Session Object

```ts
export type BrowserSession = {
  id: string;
  taskId: string;
  projectId?: string;
  mode: "research" | "app_testing" | "source_ingestion" | "private";
  status: "active" | "closed" | "failed";
  createdAt: string;
  closedAt?: string;
  requiresApproval: boolean;
  approved: boolean;
};
```

## 5. Navigate Input

```ts
export type NavigateInput = {
  sessionId: string;
  url: string;
  reason: string;
};
```

## 6. Extract Result

```ts
export type ExtractResult = {
  sessionId: string;
  url: string;
  title?: string;
  text?: string;
  markdown?: string;
  metadata?: Record<string, unknown>;
  extractionQuality: "none" | "poor" | "usable" | "good";
  warnings: string[];
};
```

## 7. Screenshot Result

```ts
export type ScreenshotResult = {
  sessionId: string;
  url: string;
  filePath: string;
  createdAt: string;
};
```

## 8. Browser Permission Rules

### Static URL Ingestion

Permission:

- Safe for public URLs if browser tools enabled

### Browser Session

Permission:

- Approval required if interaction is needed

### Private Browser Session

Permission:

- Explicit approval required

### Logged-In Account

Permission:

- Explicit approval required every session unless user creates a specific trusted rule

### Sensitive Sites

Permission:

- Explicit approval required

## 9. Extraction Fallback Order

1. User-provided content
2. Static fetch
3. Metadata extraction
4. Readability-style extraction
5. Playwright page text extraction
6. Screenshot capture
7. User-assisted manual extraction
8. Optional Crawl4AI adapter
9. Optional advanced extraction with approval

## 10. GitHub Repository Ingestion

For GitHub URLs:

Extract:

- Repository name
- Owner
- Description
- README summary
- License if available
- Stars/forks if available
- Main languages if available
- Last updated if available
- Releases if useful
- Why it matters
- CereBro decision
- Module impact

Do not clone the repo unless user approves.

## 11. Reddit Research Fallback

If Reddit API is not available:

Use:

- Search-accessible pages
- User-provided links
- Manual browser-assisted viewing
- Metadata-only records

Do not:

- scrape private communities
- bypass login requirements
- treat one comment as fact

## 12. Screenshot Storage

Store screenshots in:

```text
/CereBro/browser-captures/[project-id]/[task-id]/YYYY-MM-DD_HH-mm_[slug].png
```

Screenshot metadata stored in Source Library if saved.

## 13. Browser Session Logs

Every browser action logs:

- session ID
- task ID
- URL
- action
- timestamp
- status
- output summary
- file path if screenshot
- error if failed

## 14. Browser Done Means

Browser layer is complete when:

- Browser tools can be disabled
- Public URL ingestion works
- Browser sessions are logged
- Screenshots save correctly
- Private sessions require approval
- Failed extraction creates error
- Sources can be saved to Source Library

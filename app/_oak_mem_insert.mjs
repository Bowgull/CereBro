// one-shot: insert Odysseus reference into memory_entries, then self-exits
import { createClient } from "@libsql/client";

const url = process.env.CEREBRO_DB_URL ?? "file:./cerebro.db";
const authToken = process.env.CEREBRO_DB_AUTH_TOKEN;
const db = createClient(authToken ? { url, authToken } : { url });

const body = `Odysseus (pewdiepie-archdaemon/odysseus) is a self-hosted AI workspace (MIT, 40k stars). Backend: Python FastAPI + SQLite (SQLAlchemy ORM, 25+ tables, idempotent migration functions at import time). Frontend: vanilla JS/HTML/CSS, PWA-ready. Vector store: ChromaDB (cosine HNSW collection "odysseus_memories"). Embeddings: HTTP API (Ollama/vLLM) with fastembed ONNX fallback, both L2-normalized, batch 64. Docker Compose: 4 services (odysseus:7000, chromadb:8100, searxng:8080 pinned version, ntfy:8091). Agent loop: fenced-code-block tool dispatch, max rounds capped, streaming SSE, MCP support (stdio + SSE transports). Deep research: DeepResearcher class, up to 8 rounds of Think-Search-Extract-Synthesize, asyncio parallel queries, provider chain SearXNG->Brave->Tavily, extraction_concurrency=3 (max 12), results saved to data/deep_research/{session_id}.json. 47 route files covering chat, research, memory, email (IMAP/SMTP), calendar (CalDAV), contacts (CardDAV), shell, tasks, MCP, gallery, STT/TTS, compare. Auth: bcrypt, Fernet-encrypted columns, SameSite=Lax cookies, Bearer tokens format ody_[43]. Companion bridge: 4 LAN pairing endpoints. Skills system: SKILL.md files with YAML frontmatter (when_to_use, procedure, pitfalls, verification). Token budget: 85% of model context window, 200k hard ceiling, 6k fallback. LLM core: provider-agnostic (Anthropic native Messages API, Ollama, OpenAI-compatible), fallback chains, dead-host 20s cooldown, SHA-256 response cache LRU-128. Key env vars: LLM_HOST, DATABASE_URL, CHROMADB_HOST/PORT, SEARXNG_INSTANCE, EMBEDDING_URL/MODEL, AUTH_ENABLED, LOCALHOST_BYPASS.`;

const tags = "odysseus,reference,architecture,fastapi,chromadb,agent-loop,deep-research,memory,searxng,mcp,integration";
const source = "https://github.com/pewdiepie-archdaemon/odysseus";

await db.execute({
  sql: `INSERT INTO memory_entries (kind, body, tags, source) VALUES (?, ?, ?, ?)`,
  args: ["reference", body, tags, source],
});

console.log("memory entry inserted");
process.exit(0);

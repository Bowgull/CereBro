#!/usr/bin/env node
import {
  agentStatus,
  browserStatus,
  cerebroStatus,
  handoffStatus,
  modelStatus,
  pendingApprovalsStatus,
} from "../server/cerebroStatus";

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
  };
  handler: () => Promise<unknown> | unknown;
};

export const CEREBRO_MCP_TOOLS: ToolDefinition[] = [
  {
    name: "cerebro_status",
    description: "Read the current CereBro branch, build lane, browser status, agents, models, approvals, and handoff files.",
    inputSchema: { type: "object", properties: {} },
    handler: cerebroStatus,
  },
  {
    name: "cerebro_browser_status",
    description: "Read the daily browser feature status and proof commands.",
    inputSchema: { type: "object", properties: {} },
    handler: browserStatus,
  },
  {
    name: "cerebro_browser_qa",
    description: "Read the browser QA commands CereBro expects agents to run.",
    inputSchema: { type: "object", properties: {} },
    handler: () => browserStatus().testCommands,
  },
  {
    name: "cerebro_agents_list",
    description: "Read the canonical CereBro agent roster and model classes.",
    inputSchema: { type: "object", properties: {} },
    handler: agentStatus,
  },
  {
    name: "cerebro_models_list",
    description: "Read model-class routing by agent. This does not call a model.",
    inputSchema: { type: "object", properties: {} },
    handler: modelStatus,
  },
  {
    name: "cerebro_approvals_pending",
    description: "Read pending local approvals when the CereBro DB exists.",
    inputSchema: { type: "object", properties: {} },
    handler: pendingApprovalsStatus,
  },
  {
    name: "cerebro_handoff_current",
    description: "Read known handoff files and their modification metadata.",
    inputSchema: { type: "object", properties: {} },
    handler: handoffStatus,
  },
];

const toolMap = new Map(CEREBRO_MCP_TOOLS.map((tool) => [tool.name, tool]));

function writeMessage(payload: unknown) {
  const body = JSON.stringify(payload);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function result(id: JsonRpcRequest["id"], value: unknown) {
  writeMessage({ jsonrpc: "2.0", id, result: value });
}

function error(id: JsonRpcRequest["id"], code: number, message: string) {
  writeMessage({ jsonrpc: "2.0", id, error: { code, message } });
}

async function callTool(request: JsonRpcRequest) {
  const name = request.params?.name;
  if (!name) {
    error(request.id, -32602, "Missing tool name.");
    return;
  }
  const tool = toolMap.get(name);
  if (!tool) {
    error(request.id, -32602, `Unknown tool: ${name}`);
    return;
  }
  const payload = await tool.handler();
  result(request.id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  });
}

export async function handleMcpRequest(request: JsonRpcRequest) {
  if (request.id == null) return;
  if (request.method === "initialize") {
    result(request.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "cerebro-local", version: "0.1.0" },
    });
    return;
  }
  if (request.method === "tools/list") {
    result(request.id, {
      tools: CEREBRO_MCP_TOOLS.map(({ handler: _handler, ...tool }) => tool),
    });
    return;
  }
  if (request.method === "tools/call") {
    await callTool(request);
    return;
  }
  error(request.id, -32601, `Unknown method: ${request.method ?? "missing"}`);
}

function parseContentLength(header: string) {
  const match = header.match(/content-length:\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function startStdioServer() {
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    void drain();
  });

  async function drain() {
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;
      const header = buffer.subarray(0, headerEnd).toString("utf8");
      const length = parseContentLength(header);
      if (length == null) {
        buffer = buffer.subarray(headerEnd + 4);
        continue;
      }
      const bodyStart = headerEnd + 4;
      const bodyEnd = bodyStart + length;
      if (buffer.length < bodyEnd) return;
      const body = buffer.subarray(bodyStart, bodyEnd).toString("utf8");
      buffer = buffer.subarray(bodyEnd);
      try {
        await handleMcpRequest(JSON.parse(body) as JsonRpcRequest);
      } catch (caught) {
        error(null, -32700, caught instanceof Error ? caught.message : String(caught));
      }
    }
  }
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  startStdioServer();
}

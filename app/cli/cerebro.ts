#!/usr/bin/env node
import {
  agentStatus,
  browserStatus,
  cerebroStatus,
  handoffStatus,
  modelStatus,
  pendingApprovalsStatus,
} from "../server/cerebroStatus";

type CommandHandler = () => unknown | Promise<unknown>;

function printJson(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printHelp() {
  process.stdout.write(`CereBro CLI

Usage:
  cerebro status
  cerebro browser status
  cerebro browser qa
  cerebro agents list
  cerebro models list
  cerebro approvals pending
  cerebro handoff current

All commands in this slice are read-only.
`);
}

function commandKey(args: string[]) {
  if (args.length === 0) return "help";
  return args.join(" ");
}

const commands: Record<string, CommandHandler> = {
  help: () => {
    printHelp();
    return null;
  },
  status: cerebroStatus,
  "browser status": browserStatus,
  "browser qa": () => browserStatus().testCommands,
  "agents list": agentStatus,
  "models list": modelStatus,
  "approvals pending": pendingApprovalsStatus,
  "handoff current": handoffStatus,
};

async function main() {
  const args = process.argv.slice(2).filter((arg, index) => !(index === 0 && arg === "--"));
  const key = commandKey(args);
  const handler = commands[key];
  if (!handler) {
    process.stderr.write(`Unknown command: ${key}\n\n`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  const result = await handler();
  if (result != null) printJson(result);
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});

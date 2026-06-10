import "dotenv/config";
import express from "express";
import fs from "fs";
import { createServer, type Server } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { initializeWebSocket, getBroadcastCallbacks } from "../websocket";
import { createBridgeRouter } from "../bridge";
import { startInboxAutoPoll } from "../integrations/notion";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function serveStatic(app: express.Express) {
  const configuredDistPath = process.env.CEREBRO_STATIC_DIR?.trim();
  const distPath = configuredDistPath || path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export type StartedCereBroServer = {
  port: number;
  url: string;
  close: () => Promise<void>;
};

export type StartCereBroServerOptions = {
  preferredPort?: number;
  startInboxPoll?: boolean;
};

export async function startServer(options: StartCereBroServerOptions = {}): Promise<StartedCereBroServer> {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Initialize WebSocket for real-time agent monitoring
  initializeWebSocket(server);

  // Bridge API — receives data from local Claude Code bridge script
  const { onHeroUpdate, onHeroNew, onHeroesBatch, onHeroClear } = getBroadcastCallbacks();
  app.use("/api/bridge", createBridgeRouter(onHeroUpdate, onHeroNew, onHeroesBatch, onHeroClear));
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = options.preferredPort ?? parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  return new Promise((resolve) => {
    server.listen(port, () => {
      const url = `http://localhost:${port}/`;
      console.log(`Server running on http://localhost:${port}/`);
      console.log(`WebSocket server available at ws://localhost:${port}/api/ws/agents`);
      if (options.startInboxPoll !== false) startInboxAutoPoll();
      resolve({
        port,
        url,
        close: () => closeServer(server),
      });
    });
  });
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

if (process.env.CEREBRO_SERVER_AUTOSTART !== "false") {
  startServer().catch(console.error);
}

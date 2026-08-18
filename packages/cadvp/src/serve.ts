import { GBrainMcpClient } from "@sockt/memory";
import type { CadvpEvent } from "@sockt/types";
import { CadvpDaemon } from "./daemon.ts";

const gbrainUrl      = process.env.GBRAIN_URL      ?? "http://localhost:3200";
const watchDir       = process.env.WATCH_DIR       ?? `${process.env.HOME}/.sockt/scratch`;
const checkpointPath = process.env.CHECKPOINT_PATH ?? `${process.env.HOME}/.sockt/scratch/cadvp-checkpoint.json`;
const httpPort       = Number(process.env.CADVP_PORT ?? 3300);

const eventsFile = `${watchDir}/events.jsonl`;
await Bun.write(Bun.file(eventsFile), "", { createPath: true });

const store  = new GBrainMcpClient({ endpoint: gbrainUrl });
const daemon = new CadvpDaemon({ store, checkpointPath });

// Buffer the last 500 processed events for the UI monitor
const MAX_BUFFER = 500;
const eventBuffer: Array<{
  id: string;
  type: string;
  agentId: string;
  content: string;
  timestamp: string;
  dedupStatus: "stored" | "skipped";
  dedupScore?: number;
}> = [];

let eventCounter = 0;

daemon.onEvent(async (event: CadvpEvent) => {
  eventBuffer.push({
    id: `ev-${++eventCounter}`,
    type: event.type,
    agentId: event.agentId,
    content: event.entry?.content ?? "",
    timestamp: event.timestamp,
    dedupStatus: "stored",
  });
  if (eventBuffer.length > MAX_BUFFER) eventBuffer.shift();
});

await daemon.start([eventsFile]);
console.log(`[cadvp] watching ${eventsFile}`);

Bun.serve({
  port: httpPort,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS for local UI
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "healthy" }, { headers: corsHeaders });
    }

    if (req.method === "GET" && url.pathname === "/stats") {
      const raw = daemon.getStats();
      // Map internal field names to the UI's CadvpStats shape
      return Response.json({
        eventsToday:        raw.eventsProcessed + raw.eventsDeduplicated,
        duplicatesFiltered: raw.eventsDeduplicated,
        entriesWritten:     raw.eventsProcessed,
        lastFlush:          raw.lastProcessedAt,
      }, { headers: corsHeaders });
    }

    if (req.method === "GET" && url.pathname === "/events") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "80"), MAX_BUFFER);
      const events = eventBuffer.slice(-limit);
      return Response.json(events, { headers: corsHeaders });
    }

    if (req.method === "POST" && url.pathname === "/config") {
      // Config changes take effect on next restart; accept the payload silently
      return Response.json(
        { ok: true, note: "Config received. Restart CADVP for changes to take effect." },
        { headers: corsHeaders },
      );
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  },
});

console.log(`[cadvp] HTTP monitor on port ${httpPort}`);

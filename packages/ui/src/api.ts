import type { Task, AgentConfig, MemoryEntry, ApprovalRequest, CadvpEvent, CadvpStats, HealthStats, TaskStatus } from "./types"

export const getOrchUrl   = () => localStorage.getItem("orchUrl")   ?? "http://localhost:3100"
export const getGbrainUrl = () => localStorage.getItem("gbrainUrl") ?? "http://localhost:3200"
export const getCadvpUrl  = () => localStorage.getItem("cadvpUrl")  ?? "http://localhost:3300"
export const getTenantId  = () => localStorage.getItem("tenantId")  ?? "default"

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getOrchUrl()}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function gbrainCall<T>(toolName: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${getGbrainUrl()}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: args },
      id: crypto.randomUUID(),
    }),
  })
  if (!res.ok) throw new Error(`GBrain ${res.status} ${res.statusText}`)
  const body = await res.json()
  if (body.error) throw new Error(`GBrain error: ${body.error.message}`)
  return JSON.parse(body.result.content[0].text) as T
}

async function cadvpReq<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getCadvpUrl()}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`CADVP ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  // ── Health ──────────────────────────────────────────────────────────
  health: () => req<HealthStats>("/health"),

  // ── Tasks ────────────────────────────────────────────────────────────
  getTasks: (status?: TaskStatus) => {
    const params = new URLSearchParams({ tenantId: getTenantId() })
    if (status) params.set("status", status)
    return req<Task[]>(`/tasks?${params}`)
  },

  getTask: (id: string) => req<Task>(`/tasks/${id}`),

  createTask: (data: { description: string; llmCallsBudget?: number; parentId?: string }) =>
    req<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({ ...data, tenantId: getTenantId() }),
    }),

  cancelTask: (id: string) =>
    req<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    }),

  requeueTask: (id: string) =>
    req<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "pending" }),
    }),

  // ── Agents ───────────────────────────────────────────────────────────
  getAgents: () => req<AgentConfig[]>(`/agents?tenantId=${getTenantId()}`),

  registerAgent: (data: Omit<AgentConfig, "id">) =>
    req<AgentConfig>("/agents/register", {
      method: "POST",
      body: JSON.stringify({ ...data, tenantId: getTenantId() }),
    }),

  deleteAgent: (id: string) => req<{ ok: boolean }>(`/agents/${id}`, { method: "DELETE" }),

  // ── Approvals ────────────────────────────────────────────────────────
  getPendingApprovals: () => req<ApprovalRequest[]>("/approvals/pending"),

  decide: (id: string, approved: boolean, note?: string) =>
    req<ApprovalRequest>(`/approvals/${id}/decide`, {
      method: "POST",
      body: JSON.stringify({
        status: approved ? "approved" : "rejected",
        reason: note,
      }),
    }),

  // ── Memory — GBrain MCP at :3200 ────────────────────────────────────
  searchMemory: async (query: string, topK = 10): Promise<MemoryEntry[]> => {
    const result = await gbrainCall<{ results: Array<{
      id: string; content: string; category: string; source: string;
      tenantId: string; createdAt: string; score?: number;
    }> }>("memory_search", {
      tenantId: getTenantId(),
      query,
      limit: topK,
    })
    return result.results.map(r => ({
      id: r.id,
      content: r.content,
      category: r.category,
      agentId: r.source,
      tenantId: r.tenantId,
      createdAt: r.createdAt,
      score: r.score,
    }))
  },

  deleteMemory: async (id: string): Promise<void> => {
    await gbrainCall<{ success: boolean }>("memory_forget", { entryId: id })
  },

  // ── CADVP — HTTP server at :3300 ─────────────────────────────────────
  getCadvpEvents: (limit = 50): Promise<CadvpEvent[]> =>
    cadvpReq<CadvpEvent[]>(`/events?limit=${limit}`),

  getCadvpStats: (): Promise<CadvpStats> =>
    cadvpReq<CadvpStats>("/stats"),

  patchCadvpConfig: (config: object): Promise<void> =>
    cadvpReq<void>("/config", {
      method: "POST",
      body: JSON.stringify(config),
    }),
}

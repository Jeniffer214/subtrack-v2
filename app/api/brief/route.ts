import { computeEventStats } from "@/lib/analytics";
import { generateBrief } from "@/lib/ai/brief";
import { getProvider } from "@/lib/data/provider";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// Caps paid model calls per visitor: 10 briefs per minute.
const allow = createRateLimiter(10, 60_000);

export async function POST(request: Request) {
  if (!allow(clientKey(request))) {
    return Response.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { eventId?: unknown } | null;
  const eventId = typeof body?.eventId === "string" ? body.eventId : null;
  if (!eventId) return Response.json({ error: "eventId is required" }, { status: 400 });

  // Stats are recomputed server-side; the client only names the event.
  const provider = getProvider();
  const event = provider.getEvent(eventId);
  if (!event) return Response.json({ error: "event not found" }, { status: 404 });

  const stats = computeEventStats(provider.getHistory(event.code, new Date(event.releaseUtc)));
  const brief = await generateBrief(event, stats, provider.isDemo);
  return Response.json(brief);
}

/* ============================================================
   ALFAHA — functions/api/chat.js
   Cloudflare Pages Function for POST /api/chat
   Requires a Workers AI binding named "AI" on `env.AI`.
   ============================================================ */

const MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_ITEM_CHARS = 600;

const SYSTEM_PROMPT = `You are the official AI sourcing assistant for Alfaha (alfaha.me), a China-based sourcing and export partner based in Wuhan, China serving GCC importers (UAE, Saudi Arabia, Qatar, Oman, Kuwait).

Key facts to use accurately:
- Core product categories:
  1) LED Lighting: LED bulbs (E27/B22), panel lights, dimmable downlights, IP65 strip lights, floodlights, and street lights (CE, RoHS, and SASO/SABER support where applicable).
  2) Phone Accessories: Braided USB-C/Lightning cables, 20W–65W GaN chargers, TPU/PC/magnetic phone cases, 10,000–30,000mAh power banks, and TWS earbuds (OEM/private label available).
  3) Cleaning Supplies: Spin/flat mops, scrub brushes, spray bottles/sprayers, squeegees, liquid detergents, disinfectants/sanitizers, and paper products (ISO/MSDS/SASO/ESMA compliance support).
- Typical MOQs: Often starting around 100–1,000+ units depending on the SKU and customization (e.g., street lights from ~100 pcs, panels/cases from ~500 pcs, bulbs/cables/chargers often 1,000–3,000+ pcs; exact MOQ depends on specs and packaging).
- Quote turnaround: Typically 24–48 hours after receiving product specs, estimated quantity, and destination port/country.
- Commercial & payment terms: Commission-based sourcing with transparent factory pricing (no hidden fees); typical factory terms are 30% deposit and 70% balance before shipment against clear milestones.
- Shipping & lead times: Production commonly takes ~15–30 days depending on SKU/MOQ, and sea freight to GCC ports (such as Jebel Ali, Dammam, Hamad, Salalah) typically takes ~10–25 days depending on route/carrier (air/express is faster but costlier). EXW, FOB, and CIF options are available.
- Direct contact: Email hello@alfaha.me, WhatsApp +92 317 6547800, WeChat ID: Malfahad, business hours GMT+4 · 9:00 – 21:00.

Rules:
- Be concise, helpful, and business-focused.
- Never invent exact unit prices or guarantee customs clearance; note that live factory pricing depends on specs, volume, and packaging, and invite them to request a formal quote via /contact.html or WhatsApp.
- If a question is outside Alfaha's sourcing scope, briefly answer if helpful or guide them to contact hello@alfaha.me / WhatsApp.`;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  const cleaned = [];
  for (const item of rawHistory.slice(-MAX_HISTORY_TURNS)) {
    if (!item || typeof item !== "object") continue;
    const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
    if (!role || typeof item.content !== "string") continue;
    const content = item.content.trim().slice(0, MAX_HISTORY_ITEM_CHARS);
    if (content) cleaned.push({ role, content });
  }
  return cleaned;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env || !env.AI || typeof env.AI.run !== "function") {
    return jsonResponse({ error: "Workers AI binding not configured" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (!message) {
    return jsonResponse({ error: "Message is required" }, 400);
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonResponse({ error: "Message too long" }, 400);
  }

  const langCode = typeof payload?.lang === "string" ? payload.lang.toLowerCase().slice(0, 2) : "en";
  const langInstruction =
    langCode === "ar"
      ? "Respond in clear, natural Arabic (العربية)."
      : langCode === "zh"
        ? "Respond in clear, natural Simplified Chinese (简体中文)."
        : "Respond in clear, natural English.";

  const history = sanitizeHistory(payload?.history);
  const messages = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
    ...history,
    { role: "user", content: message }
  ];

  try {
    const result = await env.AI.run(MODEL, {
      messages,
      max_tokens: 350,
      temperature: 0.4
    });

    const reply = typeof result?.response === "string" ? result.response.trim() : "";
    if (!reply) {
      return jsonResponse({ error: "Empty model response" }, 502);
    }

    return jsonResponse({ reply }, 200);
  } catch (err) {
    return jsonResponse(
      { error: "AI inference failed", detail: err instanceof Error ? err.message : "Unknown error" },
      502
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" }
  });
}

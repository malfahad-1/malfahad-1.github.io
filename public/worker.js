const SYSTEM_PROMPT = `You are Alfaha's B2B sourcing assistant for GCC importers (UAE, Saudi Arabia, Qatar, Oman, Kuwait).
Alfaha is based in China and exports three core product lines:
1. LED Lighting: Indoor panels, downlights, tubes, linear battens, and IP66/IK10 street & flood lights (MOQ from 500 pcs, 15–20 day lead time, SASO/SABER & ESMA/ECAS support).
2. Phone Accessories: GaN fast chargers (30W–100W, UK/GCC 3-pin plugs), braided USB-C/Lightning cables, MagSafe/shockproof cases, ANC TWS earbuds, and UN38.3-certified power banks (MOQ from 500 pcs, OEM logo/packaging available).
3. Cleaning Supplies: Microfiber spin mops, hotel/commercial cleaning kits, microfiber cloths, spray bottles, and MSDS/SASO-compliant detergents (MOQ from 500 units).

Key terms: No upfront sourcing fees (commission on success), verified factories only, FOB & CIF shipping to Jebel Ali, Dammam, Jeddah, Hamad, Salalah, and Shuwaikh, pre-shipment quality inspection included.
Contact: WhatsApp +92 317 6547800, Email hello@alfaha.me, WeChat: Malfahad, Quote form at /contact.html.
Reply concisely, helpfully, and in the user's language (English, Arabic, or Chinese).`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle AI Chatbot API endpoint
    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }

      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      try {
        const body = await request.json();
        const userMessage = (body.message || "").toString().trim().slice(0, 1000);
        const lang = (body.lang || "en").toString();

        if (!userMessage) {
          return new Response(JSON.stringify({ error: "Empty message" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const messages = [
          { role: "system", content: `${SYSTEM_PROMPT}\nPreferred UI language: ${lang}.` },
          ...(Array.isArray(body.history) ? body.history.slice(-6) : []),
          { role: "user", content: userMessage }
        ];

        const aiResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages,
          max_tokens: 450
        });

        return new Response(
          JSON.stringify({ reply: aiResult.response || "Please contact us on WhatsApp at +92 317 6547800 for a quick quote." }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            reply: "I couldn't reach our AI server right now. Please message us directly on WhatsApp (+92 317 6547800) or email hello@alfaha.me."
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // Serve all static HTML, CSS, JS, images, blog posts, and PDF downloads
    return env.ASSETS.fetch(request);
  }
};

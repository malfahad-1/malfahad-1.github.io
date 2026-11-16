export async function onRequest(context) {
  const { request } = context;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "https://alfaha.me",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const { messages } = await request.json();

    const UNO_API_KEY = context.env.UNO_API_KEY;
    if (!UNO_API_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers });
    }

    const response = await fetch("https://api.unorouter.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4.1-flash-1017:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for Alfaha, a China-based sourcing company serving GCC importers. You help visitors with product inquiries, shipping questions, and sourcing process. Be concise, professional, and always encourage them to send a detailed inquiry via the contact form or WhatsApp. Company info: based in Wuhan, China. Products: LED lighting, phone accessories, cleaning tools. Shipping: FOB/CIF to GCC. Certifications: SASO/SABER supported. Response time: 24-48h. Languages: English, Arabic, Chinese."
          },
          ...messages,
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "API error" }), { status: response.status, headers });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    return new Response(JSON.stringify({ reply }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", details: err.message }), { status: 500, headers });
  }
}

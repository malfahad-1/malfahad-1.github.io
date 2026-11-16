export async function onRequest(context) {
  const { request } = context;

  const headers = {
    "Access-Control-Allow-Origin": "https://alfaha.me",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const { message, history, lang } = await request.json();

    const UNO_API_KEY = context.env.UNO_API_KEY;
    if (!UNO_API_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers });
    }

    const systemPrompts = {
      en: "You are the Alfaha Assistant, a helpful AI for Alfaha — a China-based sourcing company serving GCC importers. Answer concisely and professionally. Always encourage visitors to send detailed inquiries via the contact form or WhatsApp (+92 317 6547800). Company: Wuhan, China. Products: LED lighting, phone accessories, cleaning tools. Shipping: FOB/CIF to GCC. Certifications: SASO/SABER. Response time: 24-48h.",
      ar: "أنت مساعد ألفاها، مساعد ذكي لشركة ألفاها للاستيراد من الصين لعملاء دول الخليج. أجب بإيجاز واحترافية باللغة العربية. شجع الزوار دائماً على إرسال استفسارات عبر النموذج أو واتساب (+92 317 6547800). الشركة في ووهان، الصين. المنتجات: إضاءة LED، إكسسوارات هاتف، أدوات تنظيف. الشحن: FOB/CIF للخليج. شهادات: SASO/SABER.",
      zh: "你是Alfaha智能助手，为海湾地区进口商提供中国采购服务。请简明专业地用中文回答。始终建议访客通过联系表单或WhatsApp (+92 317 6547800) 发送详细询价。公司位于中国武汉。产品：LED照明、手机配件、清洁工具。运输：FOB/CIF至海湾地区。认证：SASO/SABER。回复时间：24-48小时。"
    };

    const systemPrompt = systemPrompts[lang] || systemPrompts.en;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-10),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.unorouter.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4.1-flash-1017:free",
        messages,
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
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers });
  }
}

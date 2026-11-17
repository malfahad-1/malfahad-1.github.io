export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  // Only POST allowed
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers
      }
    );
  }

  try {
    const body = await request.json();

    const message = body.message || "";
    const history = body.history || [];
    const lang = body.lang || "en";

    if (!message.trim()) {
      return new Response(
        JSON.stringify({
          error: "Message is required"
        }),
        {
          status: 400,
          headers
        }
      );
    }

    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: "Workers AI binding not configured"
        }),
        {
          status: 500,
          headers
        }
      );
    }

    const prompts = {
      en: `
You are Alfaha Assistant.

Company: Alfaha
Location: Wuhan, China

Services:
- China sourcing
- Factory verification
- Quality inspection
- Shipping to GCC countries
- FOB and CIF logistics

Products:
- LED lighting
- Phone accessories
- Cleaning tools

Rules:
- Be professional.
- Be concise.
- Encourage customers to request a quotation.
- Mention WhatsApp +92 317 6547800 when appropriate.
      `,

      ar: `
أنت مساعد ألفاها.

شركة متخصصة في التوريد من الصين إلى دول الخليج.

الخدمات:
- البحث عن الموردين
- فحص المصانع
- مراقبة الجودة
- الشحن والخدمات اللوجستية

المنتجات:
- إضاءة LED
- إكسسوارات الهواتف
- أدوات التنظيف

أجب بالعربية بشكل احترافي ومختصر.
      `,

      zh: `
你是 Alfaha 智能助手。

公司地点：中国武汉。

业务：
- 中国采购
- 工厂审核
- 质量检验
- 海湾国家物流运输

产品：
- LED照明
- 手机配件
- 清洁工具

回答要简洁专业。
      `
    };

    const messages = [
      {
        role: "system",
        content: prompts[lang] || prompts.en
      },
      ...history.slice(-10),
      {
        role: "user",
        content: message
      }
    ];

    const result = await env.AI.run(
      "@cf/meta/llama-3-8b-instruct",
      {
        messages
      }
    );

    return new Response(
      JSON.stringify({
        reply:
          result.response ||
          "Sorry, I couldn't generate a response."
      }),
      {
        status: 200,
        headers
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error"
      }),
      {
        status: 500,
        headers
      }
    );
  }
}

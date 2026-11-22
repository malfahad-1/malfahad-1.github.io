/* ============================================================
   ALFAHA — chatbot.js
   Floating AI chat widget (trilingual EN / AR / ZH, RTL-aware).
   - Backend: /api/chat (Cloudflare Pages Function + Workers AI)
   - UI language follows the site language (localStorage "alfaha_lang")
   - Graceful fallback: if the AI endpoint is unavailable, the widget
     directs visitors to WhatsApp instead.
   ============================================================ */

"use strict";

(function () {
  const WHATSAPP_LINK = "https://wa.me/923176547800";

  /* ---- Widget UI strings (kept local; site dictionary lives in script.js) ---- */
  const L10N = {
    en: {
      title: "Alfaha Assistant", sub: "Typically replies instantly · GMT+4 9:00–21:00",
      greeting: "Hello! 👋 I'm the Alfaha Assistant. Ask me about products, MOQs, shipping to the GCC, or payment terms.",
      placeholder: "Type your message…", send: "Send",
      chips: ["What products do you offer?", "What is the MOQ?", "Shipping time to UAE?", "Payment terms"],
      offline: "I can't connect right now. The fastest way to reach us is WhatsApp:",
      typing: "Typing…", err: "Something went wrong. Please try again."
    },
    ar: {
      title: "مساعد ألفاها", sub: "يرد فوراً عادةً · GMT+4 9:00–21:00",
      greeting: "مرحباً! 👋 أنا مساعد ألفاها. اسألني عن المنتجات أو الحد الأدنى للطلب أو الشحن إلى الخليج أو شروط الدفع.",
      placeholder: "اكتب رسالتك…", send: "إرسال",
      chips: ["ما هي منتجاتكم؟", "ما هو الحد الأدنى للطلب؟", "مدة الشحن للإمارات؟", "شروط الدفع"],
      offline: "لا أستطيع الاتصال الآن. أسرع طريقة للتواصل هي واتساب:",
      typing: "جارٍ الكتابة…", err: "حدث خطأ. حاول مرة أخرى."
    },
    zh: {
      title: "Alfaha 智能助手", sub: "通常即时回复 · GMT+4 9:00–21:00",
      greeting: "您好！👋 我是 Alfaha 助手，可以为您解答产品、起订量、海湾物流和付款方式等问题。",
      placeholder: "输入您的问题…", send: "发送",
      chips: ["你们提供哪些产品？", "起订量是多少？", "到阿联酋多久？", "付款方式"],
      offline: "暂时无法连接。最快的方式是通过 WhatsApp 联系我们：",
      typing: "输入中…", err: "出错了，请重试。"
    }
  };

  let panel, log, input, history = [];

  const t = () => {
    const lang = (localStorage.getItem("alfaha_lang") || document.documentElement.lang || "en").slice(0, 2);
    return L10N[lang === "ar" ? "ar" : lang === "zh" ? "zh" : "en"];
  };

  const rtl = () => (localStorage.getItem("alfaha_lang") === "ar" || document.documentElement.dir === "rtl");

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function bubble(role, text) {
    const b = el("div", "acb-msg acb-" + role);
    b.textContent = text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function refreshL10n() {
    const s = t();
    panel.querySelector(".acb-title").textContent = s.title;
    panel.querySelector(".acb-sub").textContent = s.sub;
    input.placeholder = s.placeholder;
    panel.querySelector(".acb-send").setAttribute("aria-label", s.send);
    if (rtl()) panel.classList.add("acb-rtl"); else panel.classList.remove("acb-rtl");
  }

  function chipsRow() {
    const s = t();
    const row = el("div", "acb-chips");
    s.chips.forEach(q => {
      const c = el("button", "acb-chip", q);
      c.type = "button";
      c.addEventListener("click", () => { ask(q); row.remove(); });
      row.appendChild(c);
    });
    return row;
  }

  async function ask(text) {
    const s = t();
    if (!text.trim()) return;
    chipsRowSafeRemove();
    bubble("user", text);
    input.value = "";

    const typing = bubble("bot", s.typing);
    typing.classList.add("acb-typing");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, lang: (localStorage.getItem("alfaha_lang") || "en") })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data.reply) throw new Error("empty");
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: data.reply });
      typing.textContent = data.reply;
      typing.classList.remove("acb-typing");
      log.scrollTop = log.scrollHeight;
    } catch (e) {
      typing.classList.remove("acb-typing");
      typing.innerHTML =
  s.offline +
  ' <a href="' +
  WHATSAPP_LINK +
  '" target="_blank" rel="noopener noreferrer">' +
  '<strong>+92 317 6547800</strong></a>';
      typing.classList.add("acb-offline");
    }
  }

  function chipsRowSafeRemove() {
    const old = log.querySelector(".acb-chips");
    if (old) old.remove();
  }

  function build() {
    const s = t();

    // Launcher bubble
    const btn = el("button", "acb-launcher");
    btn.type = "button";
    btn.setAttribute("aria-label", "Chat");
    btn.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13.5" x2="13" y2="13.5"/></svg>';

    // Panel
    panel = el("div", "acb-panel");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="acb-head">' +
        '<div class="acb-avatar">A</div>' +
        '<div class="acb-head-txt"><div class="acb-title"></div><div class="acb-sub"></div></div>' +
        '<button class="acb-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="acb-log"></div>' +
      '<form class="acb-form">' +
        '<input class="acb-input" type="text" maxlength="500" autocomplete="off" />' +
        '<button class="acb-send" type="submit"><svg class="icon-svg" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
      '</form>';

    log = panel.querySelector(".acb-log");
    input = panel.querySelector(".acb-input");

    // Greeting + quick replies
    bubble("bot", s.greeting);
    log.appendChild(chipsRow());

    // Events
    btn.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      panel.classList.toggle("open", !panel.hidden);
      if (!panel.hidden) { refreshL10n(); input.focus(); log.scrollTop = log.scrollHeight; }
    });
    panel.querySelector(".acb-close").addEventListener("click", () => { panel.hidden = true; panel.classList.remove("open"); });
    panel.querySelector(".acb-form").addEventListener("submit", e => { e.preventDefault(); ask(input.value); });

    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }

  // Re-localize labels when the site language changes (script.js toggles <html lang>)
  new MutationObserver(refreshL10n).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "dir"] });
})();

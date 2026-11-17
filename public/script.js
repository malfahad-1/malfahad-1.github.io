/* ============================================================
   ALFAHA — script.js
   - Trilingual i18n (EN default / AR with RTL / ZH) via data-i18n
   - Language switcher, preference persisted in localStorage
   - RTL handling: sets <html dir="rtl"> for Arabic (rtl.css reacts)
   - Product catalog rendering + category filters (products.html)
   - Quote pre-fill from products page (?product=SKU)
   - Contact form validation + Formspree submission
   ============================================================ */

"use strict";

/* ---------------- Contact constants ---------------- */
const WHATSAPP_NUMBER = "923176547800"; // international format, no "+"
const EMAIL = "hello@alfaha.me";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqpqplqv"; // TODO: replace with real Formspree ID

/* ---------------- Inline SVG icon system (professional line icons) ---------------- */
/* Usage in HTML: <span data-icon="mail"></span> — injectIcons() swaps in the SVG. */
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
  factory: '<path d="M3 21h18"/><path d="M5 21V9l5 4V9l5 4V4h4v17"/>',
  badgeCheck: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1.5 1.2 1.5 2.1h4c0-.9.8-1.6 1.5-2.1A6 6 0 0 0 12 3z"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/>',
  broom: '<path d="M20 4l-8 8"/><path d="M12 12l-5 8-3-3 8-5z"/><path d="M14 10l3 3"/><path d="M4 17l3 3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
  pin: '<path d="M21 10c0 7-9 12.5-9 12.5S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z"/><path d="M9 11.5l2 2 4-4.5"/>',
  coins: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'
};

function svgIcon(name, extraClass) {
  const path = ICONS[name] || "";
  const filled = name === "whatsapp";
  return `<svg class="icon-svg ${filled ? "fill" : ""} ${extraClass || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
}

/* Inject SVGs into [data-icon] placeholders */
function injectIcons() {
  document.querySelectorAll("[data-icon]").forEach(el => {
    el.innerHTML = svgIcon(el.dataset.icon);
  });
}

/* Category icon per SKU media block */
const CAT_ICON = { led: "bulb", phone: "smartphone", cleaning: "broom" };

/* ---------------- Scroll-reveal animation ---------------- */
const revealIO = ("IntersectionObserver" in window)
  ? new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.1 })
  : null;

function revealScan() {
  const targets = document.querySelectorAll(".card, .sku-card, .step, .why-item, .info-card, .stat");
  targets.forEach(el => { if (!el.classList.contains("reveal")) el.classList.add("reveal"); });
  if (revealIO) {
    document.querySelectorAll(".reveal:not(.in)").forEach(el => revealIO.observe(el));
  } else {
    targets.forEach(el => el.classList.add("in"));
  }
}

/* ---------------- Product catalog (15 SKUs, 3 languages) ---------------- */
const PRODUCTS = [
  // ---- LED LIGHTING ----
  {
    sku: "LED-BULB-001", cat: "led", icon: "💡",
    name: { en: "LED Bulb (E27 / B22)", ar: "لمبة LED (E27 / B22)", zh: "LED 球泡灯（E27/B22）" },
    desc: {
      en: "A-series LED bulbs, 5W–50W, warm/cool white, 25,000h lifespan.",
      ar: "لمبات LED سلسلة A بقوة 5–50 واط، إضاءة دافئة/باردة، عمر يصل إلى 25,000 ساعة.",
      zh: "A 系列球泡灯，5W–50W，暖白/冷白光，寿命 25,000 小时。"
    },
    specs: { en: ["5W – 50W", "E27 / B22 base", "Warm & cool white"], ar: ["5 – 50 واط", "قاعدة E27 / B22", "أبيض دافئ وبارد"], zh: ["5W–50W", "E27/B22 灯头", "暖白/冷白光"] },
    moq: "3,000 pcs", certs: ["CE", "RoHS", "SASO"]
  },
  {
    sku: "LED-PANEL-002", cat: "led", icon: "🔲",
    name: { en: "LED Panel Light", ar: "لوحة إضاءة LED", zh: "LED 平板灯" },
    desc: {
      en: "Recessed & surface panel lights, 6W–48W, slim aluminum frame.",
      ar: "لوحات مدمجة وسطحية بقوة 6–48 واط، إطار ألمنيوم نحيف.",
      zh: "嵌入式/明装平板灯，6W–48W，超薄铝框。"
    },
    specs: { en: ["6W – 48W", "300×300 – 600×1200 mm", "Recessed / surface"], ar: ["6 – 48 واط", "300×300 – 600×1200 مم", "مدمج / سطحي"], zh: ["6W–48W", "300×300–600×1200mm", "嵌入式/明装"] },
    moq: "500 pcs", certs: ["CE", "RoHS"]
  },
  {
    sku: "LED-DOWN-003", cat: "led", icon: "🔅",
    name: { en: "Dimmable Downlight", ar: "سبوت لايت قابل للتعتيم", zh: "可调光筒灯" },
    desc: {
      en: "COB downlights 3W–24W with smooth dimming, anti-glare design.",
      ar: "سبوتات COB بقوة 3–24 واط مع تعتيم سلس وتصميم مانع للوهج.",
      zh: "COB 筒灯 3W–24W，平滑调光，防眩光设计。"
    },
    specs: { en: ["3W – 24W", "Dimmable driver", "Anti-glare COB"], ar: ["3 – 24 واط", "درايفر قابل للتعتيم", "COB مانع للوهج"], zh: ["3W–24W", "调光驱动", "防眩 COB"] },
    moq: "1,000 pcs", certs: ["CE", "RoHS"]
  },
  {
    sku: "LED-STRIP-004", cat: "led", icon: "🌈",
    name: { en: "LED Strip Light (IP65)", ar: "شريط إضاءة LED (IP65)", zh: "LED 灯带（IP65 防水）" },
    desc: {
      en: "5050 / 2835 strips, waterproof IP65, single color & RGB.",
      ar: "شرائح 5050 / 2835 بمقاومة للماء IP65، لون واحد و RGB.",
      zh: "5050/2835 灯带，IP65 防水，单色与 RGB 可选。"
    },
    specs: { en: ["5050 / 2835 chips", "IP65 waterproof", "5 m rolls / custom"], ar: ["شرائح 5050 / 2835", "مقاومة الماء IP65", "لفات 5 متر / حسب الطلب"], zh: ["5050/2835 灯珠", "IP65 防水", "5 米/卷 可定制"] },
    moq: "2,000 m", certs: ["CE", "RoHS"]
  },
  {
    sku: "LED-FLD-005", cat: "led", icon: "🔆",
    name: { en: "LED Flood Light", ar: "كشاف LED", zh: "LED 投光灯" },
    desc: {
      en: "Outdoor flood lights 10W–200W, IP66, slim die-cast body.",
      ar: "كشافات خارجية 10–200 واط، IP66، جسم نحيف مصبوب.",
      zh: "户外投光灯 10W–200W，IP66，压铸薄体设计。"
    },
    specs: { en: ["10W – 200W", "IP66 outdoor", "2-year warranty"], ar: ["10 – 200 واط", "IP66 للخارج", "ضمان سنتان"], zh: ["10W–200W", "IP66 户外", "2 年质保"] },
    moq: "500 pcs", certs: ["CE", "RoHS", "SASO"]
  },
  {
    sku: "LED-STR-006", cat: "led", icon: "🛣️",
    name: { en: "LED Street Light", ar: "إنارة طرق LED", zh: "LED 路灯" },
    desc: {
      en: "Street lights 50W–200W, solar optional, MEAN WELL drivers.",
      ar: "إنارة طرق 50–200 واط، خيار الطاقة الشمسية، درايفرات MEAN WELL.",
      zh: "路灯 50W–200W，可选太阳能，MEAN WELL 驱动。"
    },
    specs: { en: ["50W – 200W", "Solar optional", "IP66 / IK10"], ar: ["50 – 200 واط", "طاقة شمسية اختيارية", "IP66 / IK10"], zh: ["50W–200W", "可选太阳能", "IP66/IK10"] },
    moq: "100 pcs", certs: ["CE", "RoHS", "SASO"]
  },
  // ---- PHONE ACCESSORIES ----
  {
    sku: "PHN-CBL-001", cat: "phone", icon: "🔌",
    name: { en: "Braided USB-C / Lightning Cable", ar: "كيبل USB-C / لايتنينج مجدول", zh: "编织 USB-C/Lightning 数据线" },
    desc: {
      en: "Nylon-braided fast-charge cables, 1m–3m, 60W/100W PD.",
      ar: "كيبلات مجدولة من النايلون للشحن السريع، 1–3 متر، 60/100 واط PD.",
      zh: "尼龙编织快充线，1m–3m，60W/100W PD。"
    },
    specs: { en: ["1m / 2m / 3m", "60W – 100W PD", "Nylon braid"], ar: ["1 / 2 / 3 متر", "60 – 100 واط PD", "نايلون مجدول"], zh: ["1m/2m/3m", "60W–100W PD", "尼龙编织"] },
    moq: "1,000 pcs", certs: ["CE", "RoHS"]
  },
  {
    sku: "PHN-CHG-002", cat: "phone", icon: "⚡",
    name: { en: "GaN Fast Charger", ar: "شاحن سريع GaN", zh: "GaN 氮化镓快充头" },
    desc: {
      en: "Compact GaN chargers 20W–65W, PD 3.0 / QC 4+, EU/UK/GCC plugs.",
      ar: "شواحن GaN مدمجة 20–65 واط، PD 3.0 / QC 4+، قوابس أوروبية/بريطانية/خليجية.",
      zh: "迷你 GaN 充电器 20W–65W，PD3.0/QC4+，欧/英/海湾插头。"
    },
    specs: { en: ["20W – 65W", "PD 3.0 / QC 4+", "EU / UK / GCC plugs"], ar: ["20 – 65 واط", "PD 3.0 / QC 4+", "قوابس أوروبية / بريطانية / خليجية"], zh: ["20W–65W", "PD3.0/QC4+", "欧/英/海湾插头"] },
    moq: "1,000 pcs", certs: ["CE", "RoHS"]
  },
  {
    sku: "PHN-CASE-003", cat: "phone", icon: "🛡️",
    name: { en: "TPU / PC Phone Cases", ar: "جرابات هاتف TPU / PC", zh: "TPU/PC 手机壳" },
    desc: {
      en: "Clear, matte and shockproof cases for all popular models.",
      ar: "جرابات شفافة ومطاطية ومضادة للصدمات لجميع الطرازات الشائعة.",
      zh: "透明、磨砂、防摔壳，适配主流机型。"
    },
    specs: { en: ["TPU / PC / hybrid", "All popular models", "Custom packaging"], ar: ["TPU / PC / هايبرد", "جميع الطرازات الشائعة", "تغليف مخصص"], zh: ["TPU/PC/混合材质", "适配主流机型", "可定制包装"] },
    moq: "500 pcs/model", certs: ["RoHS"]
  },
  {
    sku: "PHN-PWB-004", cat: "phone", icon: "🔋",
    name: { en: "Power Bank", ar: "بنك طاقة", zh: "充电宝" },
    desc: {
      en: "10,000–30,000mAh, 22.5W fast charge, dual USB + USB-C.",
      ar: "سعة 10,000–30,000 مللي أمبير، شحن سريع 22.5 واط، منفذان USB + USB-C.",
      zh: "10000–30000mAh，22.5W 快充，双 USB + USB-C。"
    },
    specs: { en: ["10K – 30K mAh", "22.5W output", "Airline-safe cells"], ar: ["10 – 30 ألف مللي أمبير", "إخراج 22.5 واط", "خلايا آمنة للطيران"], zh: ["1万–3万 mAh", "22.5W 输出", "航空安全电芯"] },
    moq: "1,000 pcs", certs: ["CE", "RoHS"]
  },
  {
    sku: "PHN-EAR-005", cat: "phone", icon: "🎧",
    name: { en: "TWS Earphones & Audio", ar: "سماعات TWS وصوتيات", zh: "TWS 耳机及音频" },
    desc: {
      en: "TWS earbuds, neckband & wired options, retail-ready boxes.",
      ar: "سماعات TWS وأخرى سلكية، بعلب جاهزة للبيع.",
      zh: "TWS 耳机、挂颈式与有线可选，零售包装。"
    },
    specs: { en: ["BT 5.3", "ENC calling", "Retail packaging"], ar: ["بلوتوث 5.3", "ميكروفون ENC", "تغليف تجاري"], zh: ["蓝牙 5.3", "ENC 通话降噪", "零售包装"] },
    moq: "1,000 pcs", certs: ["CE", "RoHS"]
  },
  // ---- CLEANING TOOLS ----
  {
    sku: "CLN-MOP-001", cat: "cleaning", icon: "🧹",
    name: { en: "Spin Mop & Flat Mop Set", ar: "طقم ممسحة دوارة ومسطحة", zh: "旋转拖把与平板拖把套装" },
    desc: {
      en: "360° spin mops & flat mops with buckets, microfiber pads.",
      ar: "مماسح دوارة 360° ومسطحة مع دلاء وأقمشة ميكروفايبر.",
      zh: "360° 旋转拖把与平板拖把，含水桶与超细纤维布。"
    },
    specs: { en: ["Stainless pole", "2 – 4 refills", "Custom colors"], ar: ["عمود ستانلس", "2 – 4 بدائل", "ألوان حسب الطلب"], zh: ["不锈钢杆", "2–4 块替换布", "颜色可定制"] },
    moq: "1,000 sets", certs: ["CE"]
  },
  {
    sku: "CLN-BRS-002", cat: "cleaning", icon: "🧽",
    name: { en: "Scrub Brush Set", ar: "طقم فرش تنظيف", zh: "清洁刷套装" },
    desc: {
      en: "Deck, floor & toilet brushes, PP bristles, bulk packs.",
      ar: "فرش أرضيات ودورات مياه، شعيرات PP، عبوات بالجملة.",
      zh: "地板刷、马桶刷，PP 刷毛，批发装。"
    },
    specs: { en: ["PP bristles", "Deck / floor / toilet", "Bulk packs"], ar: ["شعيرات PP", "أرضيات / دورات مياه", "عبوات جملة"], zh: ["PP 刷毛", "地板/马桶刷", "批发装"] },
    moq: "3,000 pcs", certs: ["RoHS"]
  },
  {
    sku: "CLN-SPR-003", cat: "cleaning", icon: "💦",
    name: { en: "Spray Bottles & Sprayers", ar: "زجاجات رش وبخاخات", zh: "喷壶与喷雾器" },
    desc: {
      en: "Manual & electric sprayers, 500ml–5L, chemical-resistant.",
      ar: "بخاخات يدوية وكهربائية، 500 مل – 5 لتر، مقاومة للمواد الكيميائية.",
      zh: "手动/电动喷雾器，500ml–5L，耐化学腐蚀。"
    },
    specs: { en: ["500 ml – 5 L", "Manual / electric", "Chemical-resistant"], ar: ["500 مل – 5 لتر", "يدوي / كهربائي", "مقاوم للمواد الكيميائية"], zh: ["500ml–5L", "手动/电动", "耐化学腐蚀"] },
    moq: "5,000 pcs", certs: ["RoHS"]
  },
  {
    sku: "CLN-SQG-004", cat: "cleaning", icon: "🪟",
    name: { en: "Window & Floor Squeegee", ar: "مسحة زجاج وأرضيات", zh: "玻璃/地面刮水器" },
    desc: {
      en: "Stainless & plastic squeegees for glass and floors, hotels & facilities.",
      ar: "مسحات من الستانلس والبلاستيك للزجاج والأرضيات للفنادق والمرافق.",
      zh: "不锈钢/塑料刮水器，适用于酒店与物业保洁。"
    },
    specs: { en: ["25 – 60 cm widths", "Stainless / plastic", "Hotel-grade"], ar: ["عرض 25 – 60 سم", "ستانلس / بلاستيك", "جودة فندقية"], zh: ["25–60cm 宽度", "不锈钢/塑料", "酒店级品质"] },
    moq: "2,000 pcs", certs: ["RoHS"]
  }
];

/* ---------------- UI translations (EN / AR / ZH) ---------------- */
const I18N = {
  en: {
    _dir: "ltr", _flag: "🇬🇧", _name: "English", _htmlLang: "en",
    "nav.home": "Home", "nav.products": "Products", "nav.services": "Services", "nav.about": "About", "nav.contact": "Contact",
    "hero.eyebrow": "Wuhan, China → GCC",
    "hero.title": 'China Sourcing & Export <em>for the GCC</em>',
    "hero.sub": "Alfaha connects GCC importers with verified Chinese factories. LED lighting, phone accessories and cleaning tools — quoted within 24–48 hours, shipped FOB or CIF.",
    "hero.cta_products": "View Products", "hero.cta_whatsapp": "WhatsApp Us",
    "hero.greeting": "السلام عليكم — Welcome to Alfaha — 欢迎来到 Alfaha",
    "stat.1n": "24–48h", "stat.1l": "Quote turnaround",
    "stat.2n": "5", "stat.2l": "GCC markets served",
    "stat.3n": "100%", "stat.3l": "Pre-shipment inspection",
    "stat.4n": "0", "stat.4l": "Upfront fees",
    "trust.factories": "Verified Factories", "trust.factories_sub": "Audited suppliers only",
    "trust.saso": "SABER / SASO Support", "trust.saso_sub": "GCC import documents",
    "trust.shipping": "FOB / CIF Shipping", "trust.shipping_sub": "Sea, air & express",
    "trust.nofees": "No Upfront Fees", "trust.nofees_sub": "Commission on success",
    "feat.eyebrow": "Featured Products", "feat.title": "What we export", "feat.sub": "A snapshot of our three core categories. Full catalog with live prices on inquiry.",
    "feat.led_d": "Bulbs, panels, downlights, strips, flood & street lights — CE / RoHS / SASO certified, factory-direct rates.",
    "feat.phone_d": "Low MOQ, fast samples: cables, GaN chargers, power banks, cases and TWS earphones for retailers and distributors.",
    "feat.cleaning_d": "Bulk supply for distributors: spin & flat mops, brushes, sprayers and hotel-grade cleaning kits on repeat orders.",
    "feat.learn": "Request quote →", "feat.view_all": "View Full Catalog",
    "serv.eyebrow": "Our Services", "serv.title": "One partner, full service", "serv.sub": "From factory floor to your warehouse — we handle every step.",
    "serv.s1": "Product Sourcing", "serv.s1d": "We find the right factory for your product, spec and budget — from our verified network.",
    "serv.s2": "Factory Verification", "serv.s2d": "On-site audits, license checks and sample validation before you commit any money.",
    "serv.s3": "Quality Control", "serv.s3d": "Pre-shipment inspection with photo & video reports — you approve before it ships.",
    "serv.s4": "Shipping & Logistics", "serv.s4d": "FOB, CIF or door-to-door. Sea, air and express, with GCC-capable forwarders.",
    "serv.s5": "Documentation & Certifications", "serv.s5d": "SABER, SASO, CE, RoHS, certificates of origin — handled for you.",
    "serv.s6": "Communication", "serv.s6d": "Arabic, English and Chinese support on WhatsApp and WeChat. GMT+4 friendly hours.",
    "serv.cta": "Request a Service Quote",
    "cat.all": "All", "cat.led": "LED Lighting", "cat.phone": "Phone Accessories", "cat.cleaning": "Cleaning Tools",
    "card.moq": "MOQ", "card.quote": "Request Quote",
    "prod.title": "Product Catalog", "prod.sub": "12–15 active SKUs across three categories. Catalogs & live prices sent on inquiry.",
    "prod.note": "⚠️ Catalogs & live prices sent on inquiry. Factory rates change weekly.",
    "svc.page_title": "Our Services", "svc.page_sub": "Everything between your inquiry and delivery — handled by one accountable partner.",
    "svc.cta_title": "Need a custom solution?", "svc.cta_sub": "Tell us what you need — we reply within 24–48 hours with a clear quote.",
    "tl.title": "How it works",
    "tl.1": "Inquiry", "tl.1s": "Send your product list", "tl.2": "Quote", "tl.2s": "24–48 hours", "tl.3": "Deposit", "tl.3s": "Milestone payment", "tl.4": "Production", "tl.4s": "Factory timeline", "tl.5": "QC", "tl.5s": "Inspection & report", "tl.6": "Shipping", "tl.6s": "FOB / CIF", "tl.7": "Delivery", "tl.7s": "To your door",
    "about.page_title": "About Alfaha", "about.page_sub": "A China-based sourcing partner built for GCC importers.",
    "about.story": "Our Story",
    "about.p1": "Alfaha is a Wuhan-based sourcing agent helping GCC businesses import LED lighting, phone accessories, and cleaning tools directly from verified Chinese factories. We work on a simple commission-based model: you tell us what you need, we quote within 24–48 hours, and you pay the factory against clear milestones. No inventory risk, no fake suppliers.",
    "about.p2": "We are based on the ground in Wuhan, China 🇨🇳 — close to the factories, speaking the language, and available in Gulf business hours. Our focus is the GCC: UAE · Saudi Arabia · Qatar · Oman · Kuwait.",
    "about.base": "Operating Base", "about.base_val": "Wuhan, Hubei, China 🇨🇳",
    "about.markets": "Markets Served", "about.markets_val": "UAE · Saudi Arabia · Qatar · Oman · Kuwait",
    "about.owner": "Owner", "about.owner_val": "Muhammad Alfahad",
    "about.why": "Why Choose Alfaha",
    "why.1": "China-Based", "why.1d": "We are physically in the factory regions — nothing is outsourced.",
    "why.2": "Verified Suppliers", "why.2d": "Every factory is audited and license-checked before we introduce it.",
    "why.3": "Transparent Pricing", "why.3d": "Factory rates shared openly, with a clear, agreed commission.",
    "why.4": "GCC-Focused", "why.4d": "SASO/SABER paperwork, Gulf ports and Arabic support as standard.",
    "contact.page_title": "Contact Us", "contact.page_sub": "Tell us what you need — we reply within 24–48 hours.",
    "form.title": "Request a Quote",
    "form.name": "Full Name", "form.company": "Company", "form.email": "Email", "form.phone": "Phone / WhatsApp",
    "form.category": "Product Category", "form.qty": "Estimated Quantity", "form.message": "Message",
    "form.select": "— Select a category —", "form.other": "Other / Mixed",
    "ph.name": "Muhammad Alfahad", "ph.company": "Your company LLC", "ph.email": "you@company.com", "ph.phone": "+92 317 6547800", "ph.qty": "e.g. 5,000 pcs", "ph.message": "Tell us the products, specs and target price…",
    "form.submit": "Send Inquiry", "form.sending": "Sending…",
    "form.success": "✅ Thank you! Your inquiry was sent — we will reply within 24–48 hours.",
    "form.error": "❌ Something went wrong. Please try again, or contact us directly on WhatsApp.",
    "err.required": "This field is required.", "err.email": "Please enter a valid email.",
    "side.whatsapp": "WhatsApp", "side.whatsapp_sub": "Fastest response — GMT+4, 9am–9pm",
    "side.email": "Email", "side.email_sub": "For catalogs & formal quotes",
    "side.wechat": "WeChat", "side.wechat_sub": "ID: Malfahad — scan the QR",
    "side.address": "Office", "side.address_val": "Wuhan, Hubei, China",
    "side.hours": "Business Hours", "side.hours_val": "GMT+4 · 9:00 – 21:00",
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "How do I start?", "faq.a1": "Send us your product list or a photo via the form, WhatsApp, or email. We reply within 24–48 hours with prices, MOQs and options. No commitment until you accept a quote.",
    "faq.q2": "What are the payment terms?", "faq.a2": "Typically 30% deposit to the factory, 70% balance before shipment — paid against clear milestones. Our commission is agreed upfront; there are no hidden fees.",
    "faq.q3": "How long does shipping take?", "faq.a3": "Production usually takes 15–30 days. Sea freight to GCC ports runs 10–25 days depending on the route; air and express options are faster but pricier.",
    "footer.tagline": "China sourcing & export for the GCC. Verified factories, transparent pricing, no upfront fees.",
    "footer.links": "Quick Links", "footer.contact": "Contact",
    "footer.rights": "© 2026 Alfaha · alfaha.me — All rights reserved.",
    "title.home": "Alfaha — China Sourcing & Export for the GCC",
    "title.products": "Products — Alfaha", "title.services": "Services — Alfaha",
    "title.about": "About — Alfaha", "title.contact": "Contact — Alfaha",
    "prefill.quote": "Hello Alfaha, I would like a quote for:"
  },

  ar: {
    _dir: "rtl", _flag: "🇸🇦", _name: "العربية", _htmlLang: "ar",
    "nav.home": "الرئيسية", "nav.products": "المنتجات", "nav.services": "الخدمات", "nav.about": "من نحن", "nav.contact": "اتصل بنا",
    "hero.eyebrow": "ووهان، الصين ← دول الخليج",
    "hero.title": "الاستيراد والتصدير <em>من الصين إلى دول الخليج</em>",
    "hero.sub": "تربط ألفاها المستوردين في الخليج بمصانع صينية موثقة. إضاءة LED واكسسوارات الهواتف وأدوات التنظيف — عرض سعر خلال 24–48 ساعة، وشحن FOB أو CIF.",
    "hero.cta_products": "تصفح المنتجات", "hero.cta_whatsapp": "واتساب",
    "hero.greeting": "السلام عليكم — مرحباً بكم في ألفاها — 欢迎来到 Alfaha",
    "stat.1n": "24–48 ساعة", "stat.1l": "سرعة عرض السعر",
    "stat.2n": "5", "stat.2l": "دول خليجية نخدمها",
    "stat.3n": "100%", "stat.3l": "فحص قبل الشحن",
    "stat.4n": "0", "stat.4l": "رسوم مسبقة",
    "trust.factories": "مصانع موثقة", "trust.factories_sub": "موردون مدققون فقط",
    "trust.saso": "دعم SABER / SASO", "trust.saso_sub": "مستندات الاستيراد الخليجية",
    "trust.shipping": "شحن FOB / CIF", "trust.shipping_sub": "بحري وجوي وسريع",
    "trust.nofees": "بدون رسوم مسبقة", "trust.nofees_sub": "عمولة عند النجاح",
    "feat.eyebrow": "منتجات مختارة", "feat.title": "ماذا نصدّر", "feat.sub": "لمحة عن فئاتنا الثلاث الأساسية. الكتالوج الكامل والأسعار الحالية عند الطلب.",
    "feat.led_d": "لمبات ولوحات وسبوتات وشرائط وكشافات وإنارة طرق — بشهادات CE / RoHS / SASO وبأسعار المصنع مباشرة.",
    "feat.phone_d": "حد أدنى منخفض للطلب وعينات سريعة: كيبلات وشواحن GaN وبنوك طاقة وجرابات وسماعات لتجار التجزئة والموزعين.",
    "feat.cleaning_d": "توريد بالجملة للموزعين: مماسح دوارية ومسطحة وفرش وبخاخات وأطقم تنظيف بجودة الفندقية بطلبات متكررة.",
    "feat.learn": "طلب عرض سعر ←", "feat.view_all": "عرض الكتالوج الكامل",
    "serv.eyebrow": "خدماتنا", "serv.title": "شريك واحد، خدمة متكاملة", "serv.sub": "من المصنع إلى مستودعك — نتولى كل خطوة.",
    "serv.s1": "البحث عن المنتجات", "serv.s1d": "نجد لك المصنع المناسب لمنتجك ومواصفاتك وميزانيتك من شبكتنا الموثقة.",
    "serv.s2": "تدقيق المصانع", "serv.s2d": "زيارات ميدانية وفحص تراخيص وتقييم عينات قبل أي التزام مالي.",
    "serv.s3": "مراقبة الجودة", "serv.s3d": "فحص ما قبل الشحن مع تقارير مصورة وفيديو — تعتمد قبل الشحن.",
    "serv.s4": "الشحن واللوجستيات", "serv.s4d": "FOB أو CIF أو حتى بابك. بحري وجوي وسريع عبر وكلاء شحن يخدمون الخليج.",
    "serv.s5": "المستندات والشهادات", "serv.s5d": "SABER وSASO وCE وRoHS وشهادات المنشأ — نتولىها عنك.",
    "serv.s6": "التواصل", "serv.s6d": "دعم بالعربية والإنجليزية والصينية عبر واتساب ووي تشات، بتوقيت الخليج.",
    "serv.cta": "طلب عرض سعر الخدمات",
    "cat.all": "الكل", "cat.led": "إضاءة LED", "cat.phone": "اكسسوارات الهواتف", "cat.cleaning": "أدوات التنظيف",
    "card.moq": "الحد الأدنى", "card.quote": "طلب عرض سعر",
    "prod.title": "كتالوج المنتجات", "prod.sub": "15 منتجاً نشطاً في ثلاث فئات. الكتالوجات والأسعار الحالية تُرسل عند الطلب.",
    "prod.note": "⚠️ يُرسل الكتالوج والأسعار الحالية عند الاستفسار. أسعار المصانع تتغير أسبوعياً.",
    "svc.page_title": "خدماتنا", "svc.page_sub": "كل ما بين استفسارك والتسليم — يتولاه شريك واحد مسؤول.",
    "svc.cta_title": "تحتاج حلاً مخصصاً؟", "svc.cta_sub": "أخبرنا بما تحتاج — نرد خلال 24–48 ساعة بعرض سعر واضح.",
    "tl.title": "كيف نعمل",
    "tl.1": "الاستفسار", "tl.1s": "أرسل قائمة منتجاتك", "tl.2": "عرض السعر", "tl.2s": "خلال 24–48 ساعة", "tl.3": "الدفعة المقدمة", "tl.3s": "دفع على مراحل", "tl.4": "الإنتاج", "tl.4s": "جدول المصنع", "tl.5": "فحص الجودة", "tl.5s": "تفتيش وتقرير", "tl.6": "الشحن", "tl.6s": "FOB / CIF", "tl.7": "التسليم", "tl.7s": "حتى بابك",
    "about.page_title": "عن ألفاها", "about.page_sub": "شريك استيراد مقره الصين، مبني لخدمة المستوردين في الخليج.",
    "about.story": "قصتنا",
    "about.p1": "ألفاها هو وكيل استيراد مقره ووهان، يساعد شركات دول الخليج على استيراد الإضاءة LED والاكسسوارات والمنتجات المنزلية من مصانع صينية موثقة. نعمل بنظام العمولة: تخبرنا بما تحتاج، نرسل لك عرض سعر خلال 24-48 ساعة، وتدفع للمصنع على مراحل واضحة. لا مخزون ولا موردين وهميين.",
    "about.p2": "نحن على الأرض في ووهان، الصين 🇨🇳 — قريبون من المصانع، نتكلم اللغة، ومتاحون بتوقيت الخليج. تركيزنا هو دول الخليج: الإمارات · السعودية · قطر · عُمان · الكويت.",
    "about.base": "موقع العمل", "about.base_val": "ووهان، خوبي، الصين 🇨🇳",
    "about.markets": "الأسواق التي نخدمها", "about.markets_val": "الإمارات · السعودية · قطر · عُمان · الكويت",
    "about.owner": "المؤسس", "about.owner_val": "محمد الفهد",
    "about.why": "لماذا ألفاها",
    "why.1": "مقرنا في الصين", "why.1d": "نحن فعلياً في مناطق المصانع — لا شيء يُسلَّم لطرف ثالث.",
    "why.2": "موردون موثقون", "why.2d": "كل مصنع يُدقَّق ويُفحص ترخيصه قبل تعريفك به.",
    "why.3": "أسعار شفافة", "why.3d": "أسعار المصنع تُشارك بوضوح مع عمولة متفق عليها مسبقاً.",
    "why.4": "متخصصون في الخليج", "why.4d": "مستندات SASO/SABER، موانئ خليجية، ودعم عربي كمعيار.",
    "contact.page_title": "اتصل بنا", "contact.page_sub": "أخبرنا بما تحتاج — نرد خلال 24–48 ساعة.",
    "form.title": "طلب عرض سعر",
    "form.name": "الاسم الكامل", "form.company": "الشركة", "form.email": "البريد الإلكتروني", "form.phone": "الهاتف / واتساب",
    "form.category": "فئة المنتج", "form.qty": "الكمية التقديرية", "form.message": "الرسالة",
    "form.select": "— اختر الفئة —", "form.other": "أخرى / متنوعة",
    "ph.name": "محمد الفهد", "ph.company": "شركتك", "ph.email": "you@company.com", "ph.phone": "+92 317 6547800", "ph.qty": "مثال: 5,000 قطعة", "ph.message": "أخبرنا بالمنتجات والمواصفات والسعر المستهدف…",
    "form.submit": "إرسال الاستفسار", "form.sending": "جارٍ الإرسال…",
    "form.success": "✅ شكراً لك! تم إرسال استفسارك — سنرد خلال 24–48 ساعة.",
    "form.error": "❌ حدث خطأ ما. حاول مرة أخرى أو تواصل معنا مباشرة على واتساب.",
    "err.required": "هذا الحقل مطلوب.", "err.email": "يرجى إدخال بريد إلكتروني صحيح.",
    "side.whatsapp": "واتساب", "side.whatsapp_sub": "أسرع رد — GMT+4، 9ص–9م",
    "side.email": "البريد الإلكتروني", "side.email_sub": "للكتالوجات وعروض الأسعار الرسمية",
    "side.wechat": "وي تشات", "side.wechat_sub": "المعرّف: Malfahad — امسح رمز QR",
    "side.address": "المكتب", "side.address_val": "ووهان، خوبي، الصين",
    "side.hours": "ساعات العمل", "side.hours_val": "GMT+4 · 9:00 – 21:00",
    "faq.title": "الأسئلة الشائعة",
    "faq.q1": "كيف أبدأ؟", "faq.a1": "أرسل لنا قائمة منتجاتك أو صورة عبر النموذج أو واتساب أو البريد. نرد خلال 24–48 ساعة بالأسعار والحد الأدنى للطلب. لا التزام قبل قبولك عرض السعر.",
    "faq.q2": "ما هي شروط الدفع؟", "faq.a2": "عادةً 30% عربون للمصنع و70% قبل الشحن — تُدفع على مراحل واضحة. عمولتنا تُتفق عليها مسبقاً دون رسوم خفية.",
    "faq.q3": "كم يستغرق الشحن؟", "faq.a3": "الإنتاج يستغرق عادةً 15–30 يوماً. الشحن البحري إلى موانئ الخليج يستغرق 10–25 يوماً حسب المسار؛ الخيارات الجوية والسريعة أسرع لكن أغلى.",
    "footer.tagline": "الاستيراد والتصدير من الصين إلى دول الخليج. مصانع موثقة، أسعار شفافة، بدون رسوم مسبقة.",
    "footer.links": "روابط سريعة", "footer.contact": "تواصل",
    "footer.rights": "© 2026 ألفاها · alfaha.me — جميع الحقوق محفوظة.",
    "title.home": "ألفاها — الاستيراد والتصدير من الصين إلى الخليج",
    "title.products": "المنتجات — ألفاها", "title.services": "الخدمات — ألفاها",
    "title.about": "من نحن — ألفاها", "title.contact": "اتصل بنا — ألفاها",
    "prefill.quote": "مرحباً ألفاها، أود الحصول على عرض سعر لـ:"
  },

  zh: {
    _dir: "ltr", _flag: "🇨🇳", _name: "中文", _htmlLang: "zh-CN",
    "nav.home": "首页", "nav.products": "产品", "nav.services": "服务", "nav.about": "关于我们", "nav.contact": "联系我们",
    "hero.eyebrow": "中国武汉 → 海湾国家",
    "hero.title": "中国采购与出口 · <em>海湾国家专供</em>",
    "hero.sub": "Alfaha 连接海湾进口商与中国认证工厂：LED 照明、手机配件、清洁工具，24–48 小时内报价，支持 FOB/CIF 出运。",
    "hero.cta_products": "浏览产品", "hero.cta_whatsapp": "WhatsApp 联系",
    "hero.greeting": "السلام عليكم — Welcome to Alfaha — 欢迎来到 Alfaha",
    "stat.1n": "24–48 小时", "stat.1l": "报价响应",
    "stat.2n": "5", "stat.2l": "海湾服务市场",
    "stat.3n": "100%", "stat.3l": "出运前验货",
    "stat.4n": "0", "stat.4l": "前期费用",
    "trust.factories": "认证工厂", "trust.factories_sub": "仅合作审核供应商",
    "trust.saso": "SABER/SASO 支持", "trust.saso_sub": "海湾进口文件",
    "trust.shipping": "FOB/CIF 出运", "trust.shipping_sub": "海运、空运与快递",
    "trust.nofees": "无前期费用", "trust.nofees_sub": "成交后收佣金",
    "feat.eyebrow": "精选产品", "feat.title": "我们出口什么", "feat.sub": "三大核心品类概览。完整目录与实时价格请询价获取。",
    "feat.led_d": "球泡灯、平板灯、筒灯、灯带、投光灯与路灯——CE/RoHS/SASO 认证，工厂直供价格。",
    "feat.phone_d": "低起订量、快速打样：数据线、GaN 充电器、充电宝、手机壳与 TWS 耳机，适合零售商与经销商。",
    "feat.cleaning_d": "面向经销商的大批量供应：旋转/平板拖把、清洁刷、喷壶与酒店级清洁套装，支持复购订单。",
    "feat.learn": "获取报价 →", "feat.view_all": "查看完整目录",
    "serv.eyebrow": "我们的服务", "serv.title": "一个伙伴，全程服务", "serv.sub": "从工厂车间到您的仓库——每一步都由我们负责。",
    "serv.s1": "产品采购", "serv.s1d": "根据您的产品、规格和预算，从认证网络中匹配合适工厂。",
    "serv.s2": "工厂验厂", "serv.s2d": "实地审核、证照核验与样品确认，先验证再付款。",
    "serv.s3": "质量管控", "serv.s3d": "出运前验货并出具图文报告——您确认后才发货。",
    "serv.s4": "运输物流", "serv.s4d": "FOB、CIF 或门到门。海运、空运、快递，合作货代覆盖海湾口岸。",
    "serv.s5": "文件与认证", "serv.s5d": "SABER、SASO、CE、RoHS、原产地证——全程代办。",
    "serv.s6": "沟通服务", "serv.s6d": "WhatsApp/微信提供阿语、英语、中文支持，配合海湾时间。",
    "serv.cta": "获取服务报价",
    "cat.all": "全部", "cat.led": "LED 照明", "cat.phone": "手机配件", "cat.cleaning": "清洁工具",
    "card.moq": "起订量", "card.quote": "获取报价",
    "prod.title": "产品目录", "prod.sub": "三大品类 15 个在售 SKU。完整目录与实时价格请询价。",
    "prod.note": "⚠️ 目录与实时价格根据询价提供。工厂报价每周更新。",
    "svc.page_title": "我们的服务", "svc.page_sub": "从询价到交付的一切事务，由一个可问责的伙伴全程处理。",
    "svc.cta_title": "需要定制方案？", "svc.cta_sub": "告诉我们您的需求——24–48 小时内回复明确报价。",
    "tl.title": "合作流程",
    "tl.1": "询价", "tl.1s": "发送产品清单", "tl.2": "报价", "tl.2s": "24–48 小时", "tl.3": "定金", "tl.3s": "按里程碑付款", "tl.4": "生产", "tl.4s": "工厂排期", "tl.5": "质检", "tl.5s": "验货报告", "tl.6": "出运", "tl.6s": "FOB/CIF", "tl.7": "交付", "tl.7s": "送货上门",
    "about.page_title": "关于 Alfaha", "about.page_sub": "立足中国的采购伙伴，专为海湾进口商打造。",
    "about.story": "我们的故事",
    "about.p1": "Alfaha 是一家位于武汉的采购代理公司，帮助海湾国家的企业从中国认证工厂直接进口LED照明、手机配件和清洁工具。我们采用佣金模式：您告知需求，我们在24-48小时内报价，您按里程碑向工厂付款。无库存风险，无虚假供应商。",
    "about.p2": "我们扎根于中国武汉 🇨🇳——贴近工厂、熟悉语言，并在海湾工作时间内随时响应。我们专注海湾市场：阿联酋 · 沙特 · 卡塔尔 · 阿曼 · 科威特。",
    "about.base": "运营基地", "about.base_val": "中国湖北武汉 🇨🇳",
    "about.markets": "服务市场", "about.markets_val": "阿联酋 · 沙特 · 卡塔尔 · 阿曼 · 科威特",
    "about.owner": "创始人", "about.owner_val": "Muhammad Alfahad",
    "about.why": "为什么选择 Alfaha",
    "why.1": "立足中国", "why.1d": "我们身处产业带，绝不转包第三方。",
    "why.2": "认证供应商", "why.2d": "每家工厂都经过审核与证照核验后才推荐给您。",
    "why.3": "价格透明", "why.3d": "工厂价公开共享，佣金事先明确约定。",
    "why.4": "专注海湾", "why.4d": "SASO/SABER 文件、海湾港口与阿语支持均为标配。",
    "contact.page_title": "联系我们", "contact.page_sub": "告诉我们您的需求——24–48 小时内回复。",
    "form.title": "获取报价",
    "form.name": "姓名", "form.company": "公司", "form.email": "电子邮箱", "form.phone": "电话 / WhatsApp",
    "form.category": "产品类别", "form.qty": "预估数量", "form.message": "留言",
    "form.select": "— 请选择类别 —", "form.other": "其他 / 混合",
    "ph.name": "您的姓名", "ph.company": "贵公司名称", "ph.email": "you@company.com", "ph.phone": "+92 317 6547800", "ph.qty": "如：5,000 件", "ph.message": "请告诉我们产品、规格和目标价格……",
    "form.submit": "发送询盘", "form.sending": "发送中…",
    "form.success": "✅ 感谢您！询盘已发送——我们将在 24–48 小时内回复。",
    "form.error": "❌ 出现错误，请重试，或直接通过 WhatsApp 联系我们。",
    "err.required": "此字段为必填项。", "err.email": "请输入有效的邮箱地址。",
    "side.whatsapp": "WhatsApp", "side.whatsapp_sub": "响应最快 — GMT+4，9:00–21:00",
    "side.email": "邮箱", "side.email_sub": "索取目录与正式报价",
    "side.wechat": "微信", "side.wechat_sub": "微信号：Malfahad — 扫码添加",
    "side.address": "办公地址", "side.address_val": "中国湖北省武汉市",
    "side.hours": "工作时间", "side.hours_val": "GMT+4 · 9:00 – 21:00",
    "faq.title": "常见问题",
    "faq.q1": "如何开始合作？", "faq.a1": "通过表单、WhatsApp 或邮箱发送产品清单或图片，我们将在 24–48 小时内回复价格与起订量。确认报价前无任何义务。",
    "faq.q2": "付款方式是什么？", "faq.a2": "通常为工厂 30% 定金、发货前 70% 尾款，按明确里程碑支付。佣金事先约定，无隐藏费用。",
    "faq.q3": "运输需要多长时间？", "faq.a3": "生产一般 15–30 天。海运到海湾港口约 10–25 天（视航线而定）；空运与快递更快但费用更高。",
    "footer.tagline": "中国采购与出口，专供海湾市场。认证工厂，价格透明，无前期费用。",
    "footer.links": "快速导航", "footer.contact": "联系方式",
    "footer.rights": "© 2026 Alfaha · alfaha.me — 保留所有权利。",
    "title.home": "Alfaha — 中国采购与出口 · 海湾国家专供",
    "title.products": "产品 — Alfaha", "title.services": "服务 — Alfaha",
    "title.about": "关于 — Alfaha", "title.contact": "联系 — Alfaha",
    "prefill.quote": "您好 Alfaha，我想询价以下产品："
  }
};

/* ============================================================
   Language engine
   ============================================================ */
const LANG_KEY = "alfaha_lang";
const SUPPORTED = ["en", "ar", "zh"];

function getSavedLang() {
  let lang = null;
  try { lang = localStorage.getItem(LANG_KEY); } catch (e) { /* storage blocked */ }
  if (!lang || !SUPPORTED.includes(lang)) {
    // Light auto-detect from browser, fall back to English
    const nav = (navigator.language || "en").toLowerCase();
    lang = nav.startsWith("ar") ? "ar" : nav.startsWith("zh") ? "zh" : "en";
  }
  return lang;
}

/**
 * Applies a language to the whole page:
 * 1. Swaps every [data-i18n] text (innerHTML — dict content is trusted, first-party)
 * 2. Swaps [data-i18n-ph] placeholders
 * 3. Sets <html lang> and <html dir> — dir="rtl" activates rtl.css for Arabic
 * 4. Toggles body.lang-* class so the correct font stack is used
 * 5. Persists the choice in localStorage
 */
function applyLang(lang, persist = true) {
  const dict = I18N[lang];
  if (!dict) return;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
  });

  // RTL handling: Arabic flips the entire document direction
  document.documentElement.setAttribute("lang", dict._htmlLang);
  document.documentElement.setAttribute("dir", dict._dir);

  document.body.classList.remove("lang-en", "lang-ar", "lang-zh");
  document.body.classList.add("lang-" + lang);

  // Page <title> from data-page attribute
  const page = document.body.getAttribute("data-page");
  if (page && dict["title." + page]) document.title = dict["title." + page];

  // Update switcher button (flag + current language name)
  const flagEl = document.querySelector(".lang-btn .flag");
  const nameEl = document.querySelector(".lang-btn .lang-current");
  if (flagEl) flagEl.textContent = dict._flag;
  if (nameEl) nameEl.textContent = dict._name;

  document.querySelectorAll(".lang-menu button").forEach(b =>
    b.classList.toggle("current", b.dataset.lang === lang)
  );

  if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ } }

  // Re-render language-dependent dynamic content (SKU cards use current lang)
  const grid = document.getElementById("sku-grid");
  if (grid) renderSKUs(grid.dataset.filter || "all");
}

/* Language switcher wiring (header dropdown) */
function initLangSwitcher() {
  const btn = document.querySelector(".lang-btn");
  const menu = document.querySelector(".lang-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", e => { e.stopPropagation(); menu.classList.toggle("open"); });
  document.addEventListener("click", () => menu.classList.remove("open"));
  menu.querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => { applyLang(b.dataset.lang); menu.classList.remove("open"); })
  );
}

/* ============================================================
   Product catalog rendering (products.html)
   ============================================================ */
const CAT_CLASS = { led: "led", phone: "phone", cleaning: "cleaning" };

function renderSKUs(filter) {
  const grid = document.getElementById("sku-grid");
  if (!grid) return;
  grid.dataset.filter = filter;
  const lang = document.documentElement.lang.startsWith("zh") ? "zh" : document.documentElement.lang.startsWith("ar") ? "ar" : "en";
  const dict = I18N[lang];

  const items = PRODUCTS.filter(p => filter === "all" || p.cat === filter);
  grid.innerHTML = items.map(p => `
    <article class="sku-card">
      <div class="sku-media ${CAT_CLASS[p.cat]}">
        <span class="cat-chip">${dict["cat." + p.cat]}</span>
        <span class="icon">${svgIcon(CAT_ICON[p.cat])}</span>
      </div>
      <div class="sku-body">
        <span class="sku-code">${p.sku}</span>
        <h3>${p.name[lang]}</h3>
        <p class="sku-desc">${p.desc[lang]}</p>
        <ul class="sku-specs">
          ${p.specs[lang].map(s => `<li>${s}</li>`).join("")}
        </ul>
        <div class="sku-meta">
          <span class="moq">${dict["card.moq"]}: <strong>${p.moq}</strong></span>
          <span class="certs">${p.certs.map(c => `<span class="cert-badge">${c}</span>`).join("")}</span>
        </div>
        <a class="btn btn-navy" href="contact.html?product=${encodeURIComponent(p.sku)}">${dict["card.quote"]}</a>
      </div>
    </article>
  `).join("");
  revealScan();                     // observe newly rendered cards
}

function initFilters() {
  document.querySelectorAll(".cat-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderSKUs(tab.dataset.filter);
    });
  });
}

/* ============================================================
   Mobile menu
   ============================================================ */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", e => { 
      e.stopPropagation(); 
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", e => {
      if (!nav.contains(e.target) && e.target !== toggle) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

/* ============================================================
   Contact page: quote pre-fill + FAQ accordion + form
   ============================================================ */
function prefillFromQuery() {
  const sku = new URLSearchParams(window.location.search).get("product");
  if (!sku) return;
  const p = PRODUCTS.find(x => x.sku.toLowerCase() === sku.toLowerCase());
  const msg = document.getElementById("f-message");
  if (!p || !msg) return;
  const lang = document.documentElement.lang.startsWith("zh") ? "zh" : document.documentElement.lang.startsWith("ar") ? "ar" : "en";
  if (!msg.value) msg.value = `${I18N[lang]["prefill.quote"]}\n${p.sku} — ${p.name[lang]}`;
  const catSel = document.getElementById("f-category");
  if (catSel) catSel.value = p.cat;
}

function initFAQ() {
  document.querySelectorAll(".faq-q").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open);
    });
  });
} 

function validateForm(form) {
  let ok = true;
  const lang = document.documentElement.lang.startsWith("zh") ? "zh" : document.documentElement.lang.startsWith("ar") ? "ar" : "en";
  form.querySelectorAll("[required]").forEach(field => {
    const group = field.closest(".form-group");
    const errEl = group ? group.querySelector(".err") : null;
    let valid = field.value.trim() !== "";
    if (valid && field.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    if (group) group.classList.toggle("invalid", !valid);
    if (errEl && !valid) errEl.textContent = I18N[lang][field.type === "email" ? "err.email" : "err.required"];
    if (!valid) ok = false;
  });
  return ok;
}

function initContactForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const lang = () => (document.documentElement.lang.startsWith("zh") ? "zh" : document.documentElement.lang.startsWith("ar") ? "ar" : "en");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "form-status";
    if (!validateForm(form)) return;

    const dict = I18N[lang()];
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = dict["form.sending"];

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      });
      if (res.ok) {
        status.textContent = dict["form.success"];
        status.classList.add("success");
        form.reset();
      } else throw new Error("HTTP " + res.status);
    } catch (err) {
      status.textContent = dict["form.error"];
      status.classList.add("error");
    } finally {
      btn.disabled = false;
      btn.textContent = dict["form.submit"];
    }
  });
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const lang = getSavedLang();
  applyLang(lang, false);           // apply saved/browser language (no re-save needed yet)
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }

  injectIcons();                    // swap [data-icon] placeholders for inline SVGs
  revealScan();                     // enable scroll-reveal animations
  initLangSwitcher();
  initMobileNav();
  initFilters();
  prefillFromQuery();
  initFAQ();
  initContactForm();

  // Reveal current page in nav
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
});

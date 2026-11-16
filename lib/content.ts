/**
 * Single source of truth for every word, number and link on the site.
 * The reel's narration is quoted verbatim in `scenes`.
 */

import { TOTAL_CATS } from "@/lib/scale";

export const SITE_URL_FALLBACK = "https://ek-lakh.vercel.app";

const BRAND = "Velto Studios";
const TITLE = "पीलू vs 1 लाख बिल्लियाँ";
const SUMMARY =
  "एक नन्हा चूज़ा। एक लाख बिल्लियाँ। और एक छोटी-सी लाल बिंदी, जिसने पूरा खेल पलट दिया।";
const WATCH_REEL = "रील देखें";
const MOTHER_QUOTE = "“बेटा, खाना खा लिया?”";
const CAT_COUNT_LABEL = "बिल्लियों की गिनती";
const CAST_WORD = "किरदार";
const RED_DOT = "लाल बिंदी";
const MOTHER_CALL = "माँ का फ़ोन";
const TEAM_HREF = "#team";

export const site = {
  brand: BRAND,
  title: TITLE,
  metaTitle: `${TITLE} | ${BRAND}`,
  description: SUMMARY,
  tagline: "Ideas don't build themselves. We do.",
  instagram: {
    url: "https://www.instagram.com/velto_studios/",
    handle: "@velto_studios",
  },
  copyright: "© 2026 Velto Studios",
  skipLink: "सीधे मुख्य सामग्री पर जाएँ",
  homeLabel: "Velto Studios, पेज के ऊपर जाएँ",
  newTab: "नई टैब में खुलता है",
} as const;

export const media = {
  reel: "/reel.mp4",
  poster: "/poster.jpg",
  og: "/og.jpg",
  ogSize: { width: 1200, height: 630 },
  sceneSize: { width: 720, height: 1280 },
} as const;

/** The nouns the page counts with, singular and plural. */
export const words = {
  peelu: "पीलू",
  cat: "बिल्ली",
  cats: "बिल्लियाँ",
  chick: "चूज़ा",
  chicks: "चूज़े",
  redDot: RED_DOT,
} as const;

export function catWord(count: number): string {
  return count === 1 ? words.cat : words.cats;
}

export function chickWord(count: number): string {
  return count === 1 ? words.chick : words.chicks;
}

export interface NavItem {
  href: string;
  label: string;
}

export const nav: readonly NavItem[] = [
  { href: "#reel", label: "रील" },
  { href: TEAM_HREF, label: "टीम" },
  { href: "#scale", label: "मैदान" },
  { href: "#story", label: "कहानी" },
  { href: "#making", label: "निर्माण" },
];

export const navCopy = {
  label: "मुख्य नेविगेशन",
  footerLabel: "फ़ुटर नेविगेशन",
  open: "मेनू खोलें",
  close: "मेनू बंद करें",
} as const;

export const hero = {
  eyebrow: { brand: "VELTO STUDIOS", line: "एक छोटी-सी लड़ाई" },
  title: TITLE,
  counterLabel: CAT_COUNT_LABEL,
  counterFrom: 1,
  counterTo: TOTAL_CATS,
  sub: SUMMARY,
  primaryCta: WATCH_REEL,
  secondaryCta: "टीम में आइए",
  secondaryHref: TEAM_HREF,
  scrollCue: "SCROLL",
} as const;

export const reel = {
  eyebrow: "THE REEL",
  heading: "पूरी लड़ाई, एक मिनट से कम में",
  paragraph:
    "गिनती एक से शुरू होती है और एक लाख पर जाकर रुकती है। फिर पीलू अपनी जेब से कुछ निकालता है।",
  chips: ["हिंदी वॉइसओवर", "हिंदी सबटाइटल", "9:16 वर्टिकल"],
  keys: "कीबोर्ड: स्पेस से चलाएँ या रोकें · ← → से 5 सेकंड आगे-पीछे · M से आवाज़ · F से फ़ुलस्क्रीन",
  player: {
    label: "रील प्लेयर",
    videoLabel: `रील: ${TITLE}`,
    play: "रील चलाएँ",
    pause: "रील रोकें",
    replay: "दोबारा देखें",
    mute: "आवाज़ बंद करें",
    unmute: "आवाज़ चालू करें",
    enterFullscreen: "फ़ुलस्क्रीन में देखें",
    exitFullscreen: "फ़ुलस्क्रीन से बाहर आएँ",
    progress: "वीडियो की प्रगति",
    loading: "वीडियो लोड हो रहा है",
    error: "वीडियो लोड नहीं हो सका",
    retry: "फिर कोशिश करें",
    posterTitle: words.peelu,
    posterNote: "REEL · 9:16",
  },
} as const;

/** Hindi month names, January first. */
export const monthsHi = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
] as const;

export const team = {
  eyebrow: "TEAM PEELU",
  heading: "हर व्यू, एक नया चूज़ा",
  lede: "अगली लड़ाई पीलू अकेले नहीं लड़ेगा। इस रील का हर व्यू, टीम पीलू में एक नया चूज़ा जोड़ता है।",
  countPrefix: "टीम पीलू:",
  /** At most this many chick icons are drawn; the rest are summed up in one line. */
  maxIcons: 300,
  more: "और",
  alone: "अभी टीम में अकेला पीलू है। पहला चूज़ा आप बनिए।",
  join: "मैं भी टीम में हूँ",
  leave: "टीम छोड़ें",
  youTag: "+1 आप",
  joined: "आपका चूज़ा टीम में है।",
  reelLink: "रील पर जाएँ",
  note: {
    before: "यह गिनती रील के व्यूज़ से समय-समय पर अपडेट की जाती है। आख़िरी अपडेट: ",
    after: "। आपका चूज़ा सिर्फ़ आपके ब्राउज़र में सेव होता है।",
  },
} as const;

export const field = {
  eyebrow: "THE FIELD",
  heading: "बिल्लियाँ गिनिए, फिर लाल बिंदी दिखाइए",
  lede: "यहाँ हर बिंदु एक बिल्ली है और बीच का पीला बिंदु पीलू। गिनती बढ़ाइए, फिर लाल बिंदी चालू कीजिए और देखिए कि मैदान कैसे ख़ाली होता है।",
  readoutLabel: "मैदान में",
  countLabel: CAT_COUNT_LABEL,
  /** There is only ever one of him. */
  chicks: 1,
  chasing: "सब लाल बिंदी के पीछे",
  legend: "पीला बिंदु: पीलू",
  hint: "घुमाने के लिए खींचें। दबाए रखने पर भी लाल बिंदी चालू रहती है। ज़ूम के लिए + और − बटन दबाएँ, या Ctrl दबाकर स्क्रॉल करें।",
  zoomIn: "ज़ूम इन",
  zoomOut: "ज़ूम आउट",
  pauseOrbit: "अपने-आप घूमना रोकें",
  resumeOrbit: "अपने-आप घूमना चालू करें",
  resetView: "दृश्य रीसेट करें",
  replay: "गिनती फिर चलाएँ",
  loading: "दृश्य तैयार हो रहा है…",
  fallbackNote: "इस डिवाइस पर 3D दृश्य उपलब्ध नहीं है, इसलिए सरल चित्र दिखाया जा रहा है।",
  sceneLabel: "3D दृश्य:",
  fallbackLabel: "सरल चित्र:",
  statsEyebrow: "BY THE NUMBERS",
  statsHeading: "पूरी लड़ाई, छह आँकड़ों में",
} as const;

export type StatKind = "cats" | "chick" | "dot" | "call" | "left" | "score";

export interface StatCard {
  kind: StatKind;
  /** What the number counts; it reads on as the unit, as in "1,00,000 बिल्लियाँ". */
  title: string;
  /** One number, or the two sides of a score. */
  values: readonly number[];
  /** Where the count starts from (0 unless given). */
  from?: number;
  quote?: string;
  line: string;
}

export const scoreSeparator = "–";

export const statCards: readonly StatCard[] = [
  {
    kind: "cats",
    title: words.cats,
    values: [TOTAL_CATS],
    line: "इतनी कि गिनते-गिनते पीलू की आँख लग जाए।",
  },
  {
    kind: "chick",
    title: words.chick,
    values: [1],
    line: "क़द छोटा, हौसला बड़ा। नाम, पीलू।",
  },
  {
    kind: "dot",
    title: words.redDot,
    values: [1],
    line: "पीलू का ब्रह्मास्त्र। न शोर, न धमाका, बस एक बिंदी।",
  },
  {
    kind: "call",
    title: MOTHER_CALL,
    values: [1],
    quote: MOTHER_QUOTE,
    line: "लड़ाई रुक सकती है, माँ का फ़ोन नहीं।",
  },
  {
    kind: "left",
    title: "बची हुई बिल्लियाँ",
    values: [0],
    from: TOTAL_CATS,
    line: "सब की सब लाल बिंदी के पीछे भाग गईं।",
  },
  {
    kind: "score",
    title: "अंतिम स्कोर",
    values: [1, 0],
    line: "पीलू एक, बिल्लियाँ शून्य। अगला मैच, टीम के साथ।",
  },
];

export interface Scene {
  n: number;
  title: string;
  line: string;
  image: string;
}

/** Narration of the reel, verbatim. */
export const scenes: readonly Scene[] = [
  {
    n: 1,
    title: "शीर्षक",
    line: "एक तरफ़, एक नन्हा चूज़ा। नाम, पीलू। दूसरी तरफ़, एक लाख बिल्लियाँ।",
    image: "/s1.jpg",
  },
  {
    n: 2,
    title: "पहली बिल्ली",
    line: "शुरुआत हुई एक बिल्ली से। पीलू ने बस पलक झपकाई, और बिल्ली फिसल गई।",
    image: "/s2.jpg",
  },
  {
    n: 3,
    title: "पाँच और सौ",
    line: "फिर आईं पाँच। फिर सौ। पीलू अब भी मुस्कुरा रहा था।",
    image: "/s3.jpg",
  },
  {
    n: 4,
    title: "दस हज़ार",
    line: "दस हज़ार पर, पीलू दब गया।",
    image: "/s4.jpg",
  },
  {
    n: 5,
    title: MOTHER_CALL,
    line: `उधर मुर्गी माँ का फ़ोन आया। ${MOTHER_QUOTE}`,
    image: "/s5.jpg",
  },
  {
    n: 6,
    title: "एक लाख",
    line: "एक लाख पर, पीलू के पास खड़े होने की जगह भी नहीं बची।",
    image: "/s6.jpg",
  },
  {
    n: 7,
    title: RED_DOT,
    line: "तभी पीलू ने निकाला अपना ब्रह्मास्त्र। एक छोटी-सी लाल बिंदी। और एक लाख बिल्लियाँ, उसके पीछे भाग गईं।",
    image: "/s7.jpg",
  },
  {
    n: 8,
    title: "जीत और न्योता",
    line: "लो, पीलू जीत गया। पर अगली बार उसे टीम चाहिए। इस रील का हर व्यू, टीम पीलू में एक नया चूज़ा। तो बताइए, आप आ रहे हैं?",
    image: "/s8.jpg",
  },
];

export const story = {
  eyebrow: "SCENE BY SCENE",
  heading: "लड़ाई के आठ दृश्य",
  sceneWord: "दृश्य",
  stripLabel: "लड़ाई के आठ दृश्य, दाएँ-बाएँ स्क्रॉल करें",
  prev: "पिछला दृश्य",
  next: "अगला दृश्य",
  progressLabel: "दृश्य",
} as const;

export type MakingIcon = "idea" | "cast" | "code" | "audio" | "web";

export interface MakingStep {
  icon: MakingIcon;
  title: string;
  body: string;
}

export const making = {
  eyebrow: "BEHIND THE CREATION",
  heading: "यह रील कैसे बनी",
  steps: [
    {
      icon: "idea",
      title: "विचार",
      body: "एक वायरल रील के \"एक बनाम एक लाख\" वाले ढाँचे से प्रेरणा ली, और उसे अपने किरदारों के साथ नई कहानी बनाया: एक चूज़ा, एक लाख बिल्लियाँ।",
    },
    {
      icon: "cast",
      title: CAST_WORD,
      body: "पीलू, बिल्लियाँ और मुर्गी माँ, तीनों Velto Studios के अपने बनाए किरदार हैं।",
    },
    {
      icon: "code",
      title: "कोड से बने दृश्य",
      body: "रील का हर फ़्रेम कोड से बनाया गया है (Python, Cairo, NumPy, OpenCV)। एक लाख वाले दृश्य में बिल्लियाँ सचमुच एक लाख हैं।",
    },
    {
      icon: "audio",
      title: "आवाज़ और संगीत",
      body: "हिंदी पुरुष वॉइसओवर Kokoro-82M (ऑफ़लाइन, ओपन-सोर्स टेक्स्ट-टू-स्पीच) से बना है; संगीत और साउंड इफ़ेक्ट कोड से सिंथेसाइज़ किए गए हैं।",
    },
    {
      icon: "web",
      title: "वेबसाइट",
      body: "Next.js, React, Tailwind CSS, Motion और React Three Fiber।",
    },
  ] satisfies MakingStep[],
} as const;

export type CastKey = "peelu" | "cats" | "hen";

export interface CastMember {
  key: CastKey;
  name: string;
  line: string;
}

export const cast = {
  eyebrow: "THE CAST",
  heading: CAST_WORD,
  members: [
    {
      key: "peelu",
      name: words.peelu,
      line: "नन्हा, पीला और बिलकुल निडर। जेब में हमेशा एक लाल बिंदी रखता है।",
    },
    {
      key: "cats",
      name: "बिल्ली गैंग",
      line: "गिनती में पूरी एक लाख। लाल बिंदी दिखते ही बाक़ी सब भूल जाती हैं।",
    },
    {
      key: "hen",
      name: "मुर्गी माँ",
      line: "लड़ाई कितनी भी बड़ी हो, खाने का पूछना कभी नहीं भूलतीं।",
    },
  ] satisfies CastMember[],
} as const;

export const closing = {
  eyebrow: "PEELU 1 – 0 CATS",
  lines: ["पीलू जीत गया।", "अगली बार, टीम के साथ।"],
  watch: WATCH_REEL,
  share: "शेयर करें",
  shareText: `${TITLE}: हर व्यू, टीम पीलू में एक नया चूज़ा।`,
  follow: "Instagram पर फ़ॉलो करें",
  copied: "लिंक कॉपी हो गया",
  copyFailed: "लिंक कॉपी नहीं हो सका। ऊपर पता बार से कॉपी कर लें।",
} as const;

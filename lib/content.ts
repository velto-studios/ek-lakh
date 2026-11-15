/**
 * Single source of truth for every word, number and link on the site.
 * Facts are quoted exactly as verified; each one carries the assumption it rests on.
 */

import type { DensityKey } from "@/lib/scale";

export const SITE_URL_FALLBACK = "https://ek-lakh.vercel.app";

export const site = {
  brand: "Velto Studios",
  title: "एक लाख लोग असल में कितने होते हैं?",
  metaTitle: "एक लाख लोग असल में कितने होते हैं? | Velto Studios",
  description: "एक संख्या, जिसे हम रोज़ सुनते हैं पर कभी देखते नहीं।",
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

export interface NavItem {
  href: string;
  label: string;
}

export const nav: readonly NavItem[] = [
  { href: "#reel", label: "रील" },
  { href: "#scale", label: "पैमाना" },
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
  eyebrow: { brand: "VELTO STUDIOS", line: "एक दृश्य कहानी" },
  title: site.title,
  counterLabel: "गिनती",
  counterFrom: 1,
  counterTo: 100_000,
  sub: "एक संख्या, जिसे हम रोज़ सुनते हैं पर कभी देखते नहीं। यहाँ उसे गिनकर, नापकर और देखकर समझिए।",
  primaryCta: "रील देखें",
  secondaryCta: "कहानी देखें",
  scrollCue: "SCROLL",
} as const;

export const reel = {
  eyebrow: "THE REEL",
  heading: { before: "पूरी कहानी, ", number: "63", after: " सेकंड में" },
  paragraph:
    "एक इंसान से शुरू होकर एक लाख तक पहुँचती गिनती, और फिर वे तुलनाएँ जो इस संख्या को आँखों के सामने खड़ा कर देती हैं।",
  chips: ["हिंदी वॉइसओवर", "हिंदी सबटाइटल", "9:16 वर्टिकल"],
  keys: "कीबोर्ड: स्पेस से चलाएँ या रोकें · ← → से 5 सेकंड आगे-पीछे · M से आवाज़ · F से फ़ुलस्क्रीन",
  player: {
    label: "रील प्लेयर",
    videoLabel: "रील: एक लाख लोग असल में कितने होते हैं?",
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
    posterTitle: "एक लाख",
    posterNote: "REEL · 9:16",
  },
} as const;

export const densityCopy: Record<DensityKey, { label: string; crowd: string }> = {
  loose: { label: "खुली", crowd: "खुली भीड़" },
  dense: { label: "सघन", crowd: "सघन भीड़" },
  packed: { label: "बेहद सघन", crowd: "बेहद सघन भीड़" },
};

export const scale = {
  eyebrow: "SCALE EXPLORER",
  heading: "ख़ुद गिनकर देखिए",
  lede: "यहाँ हर बिंदु एक इंसान है। गिनती बढ़ाइए, भीड़ की घनता बदलिए और देखिए कि फ़ुटबॉल के मैदानों पर यह भीड़ कितनी जगह घेरती है।",
  readoutLabel: "स्क्रीन पर",
  person: "व्यक्ति",
  people: "लोग",
  countLabel: "लोगों की गिनती",
  densityLabel: "भीड़ की घनता",
  sqft: "वर्ग फ़ुट",
  perPerson: "प्रति व्यक्ति",
  approx: "लगभग",
  sqm: "वर्ग मीटर",
  pitches: "मैदान",
  lessThanTenth: "0.1 से कम",
  legend: "हरी रेखाएँ: फ़ुटबॉल मैदान, 105 × 68 मीटर",
  hint: "घुमाने के लिए खींचें। ज़ूम के लिए + और − बटन दबाएँ, या Ctrl दबाकर स्क्रॉल करें।",
  zoomIn: "ज़ूम इन",
  zoomOut: "ज़ूम आउट",
  pauseOrbit: "अपने-आप घूमना रोकें",
  resumeOrbit: "अपने-आप घूमना चालू करें",
  resetView: "दृश्य रीसेट करें",
  replay: "गिनती फिर चलाएँ",
  loading: "दृश्य तैयार हो रहा है…",
  fallbackNote: "इस डिवाइस पर 3D दृश्य उपलब्ध नहीं है, इसलिए सरल चित्र दिखाया जा रहा है।",
  sceneLabel: "का 3D दृश्य, फ़ुटबॉल मैदानों की रेखाओं के ऊपर",
  fallbackLabel: "का सरल चित्र, फ़ुटबॉल मैदानों की रेखाओं के ऊपर",
  factsEyebrow: "BY THE NUMBERS",
  factsHeading: "एक लाख, छह पैमानों पर",
} as const;

/** The eight verified facts, exactly as checked, each with the assumption behind it. */
export interface Fact {
  key:
    | "countTime"
    | "spaceLoose"
    | "spaceDense"
    | "spacePacked"
    | "queue"
    | "buses"
    | "stadium"
    | "india";
  label: string;
  display: string;
  basis: string;
}

export const facts: readonly Fact[] = [
  {
    key: "countTime",
    label: "गिनने का समय",
    display: "27 घंटे 46 मिनट 40 सेकंड",
    basis: "हर सेकंड एक इंसान गिनें: 1,00,000 सेकंड",
  },
  {
    key: "spaceLoose",
    label: "जगह, खुली भीड़",
    display: "13 फ़ुटबॉल मैदान (लगभग 92,900 वर्ग मीटर)",
    basis:
      "खुली भीड़: प्रति व्यक्ति 10 वर्ग फ़ुट (जैकब्स विधि); मैदान 105 × 68 मीटर = 7,140 वर्ग मीटर",
  },
  {
    key: "spaceDense",
    label: "जगह, सघन भीड़",
    display: "लगभग 6 मैदान (लगभग 41,800 वर्ग मीटर)",
    basis: "सघन भीड़: प्रति व्यक्ति 4.5 वर्ग फ़ुट",
  },
  {
    key: "spacePacked",
    label: "जगह, बेहद सघन भीड़",
    display: "लगभग 3¼ मैदान (लगभग 23,200 वर्ग मीटर)",
    basis: "बेहद सघन: प्रति व्यक्ति 2.5 वर्ग फ़ुट, यह ऊपरी सीमा मानी जाती है",
  },
  {
    key: "queue",
    label: "कतार",
    display: "50 किलोमीटर",
    basis: "एक कतार, हर व्यक्ति को आधा मीटर",
  },
  {
    key: "buses",
    label: "बसें",
    display: "2,000 बसें",
    basis: "50 सीट वाली बस",
  },
  {
    key: "stadium",
    label: "स्टेडियम",
    display: "लगभग 76% (तीन-चौथाई)",
    basis: "दुनिया का सबसे बड़ा क्रिकेट स्टेडियम, अहमदाबाद: 1,32,000 सीटें",
  },
  {
    key: "india",
    label: "भारत",
    display: "लगभग 14,766 गुना (क़रीब पौने पंद्रह हज़ार)",
    basis:
      "भारत की अनुमानित आबादी 2026: लगभग 147.66 करोड़ (संयुक्त राष्ट्र, World Population Prospects 2024)",
  },
];

export function getFact(key: Fact["key"]): Fact {
  const fact = facts.find((item) => item.key === key);
  if (!fact) throw new Error(`Unknown fact: ${key}`);
  return fact;
}

/** Six cards; the "space" card folds the three crowd densities into one. */
export type FactCardKind = "time" | "space" | "queue" | "buses" | "stadium" | "india";

export interface FactCard {
  kind: FactCardKind;
  title: string;
  /** The number that counts up. For "time" it is a number of seconds. */
  value: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  note?: string;
  line: string;
  basis: readonly string[];
  extra?: readonly { label: string; value: string }[];
}

export const timeUnits = { hours: "घंटे", minutes: "मिनट", seconds: "सेकंड" } as const;

export const factCards: readonly FactCard[] = [
  {
    kind: "time",
    title: "समय",
    value: 100_000,
    line: "हर सेकंड एक इंसान गिनें, तो बिना रुके गिनने में इतना समय लगेगा।",
    basis: [getFact("countTime").basis],
  },
  {
    kind: "space",
    title: "जगह",
    value: 13,
    unit: "फ़ुटबॉल मैदान",
    note: "लगभग 92,900 वर्ग मीटर",
    line: "खुलकर खड़े हों, तो इन्हें इतनी जगह चाहिए।",
    extra: [
      { label: "सघन भीड़", value: getFact("spaceDense").display },
      { label: "बेहद सघन भीड़", value: getFact("spacePacked").display },
    ],
    basis: [
      getFact("spaceLoose").basis,
      getFact("spaceDense").basis,
      getFact("spacePacked").basis,
    ],
  },
  {
    kind: "queue",
    title: "कतार",
    value: 50,
    unit: "किलोमीटर",
    line: "एक कतार में खड़ा कर दें, तो लाइन इतनी लंबी होगी।",
    basis: [getFact("queue").basis],
  },
  {
    kind: "buses",
    title: "बसें",
    value: 2_000,
    unit: "बसें",
    line: "और इन सबको ले जाने के लिए इतनी बसें चाहिए।",
    basis: [getFact("buses").basis],
  },
  {
    kind: "stadium",
    title: "स्टेडियम",
    value: 76,
    prefix: "लगभग",
    suffix: "%",
    note: "तीन-चौथाई",
    line: "दुनिया का सबसे बड़ा क्रिकेट स्टेडियम भी इनसे इतना भर जाएगा।",
    basis: [getFact("stadium").basis],
  },
  {
    kind: "india",
    title: "भारत",
    value: 14_766,
    prefix: "लगभग",
    unit: "गुना",
    note: "क़रीब पौने पंद्रह हज़ार",
    line: "भारत में एक लाख की ऐसी भीड़ इतनी बार समा जाती है।",
    basis: [getFact("india").basis],
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
    title: "सवाल",
    line: "एक लाख। सुनने में बस एक संख्या है। पर एक लाख लोग असल में कितने होते हैं?",
    image: "/s1.jpg",
  },
  {
    n: 2,
    title: "गिनती",
    line: "चलिए, गिनकर देखते हैं। एक इंसान। दस। सौ। हज़ार। दस हज़ार। और अब, पूरे एक लाख।",
    image: "/s2.jpg",
  },
  {
    n: 3,
    title: "समय",
    line: "अगर आप हर सेकंड एक इंसान गिनें, तो बिना रुके गिनने में भी सत्ताईस घंटे से ज़्यादा लग जाएँगे।",
    image: "/s3.jpg",
  },
  {
    n: 4,
    title: "जगह",
    line: "खुलकर खड़े हों, तो इन्हें तेरह फ़ुटबॉल मैदान जितनी जगह चाहिए। सटकर खड़े हों, तब भी क़रीब छह।",
    image: "/s4.jpg",
  },
  {
    n: 5,
    title: "कतार और बसें",
    line: "एक कतार में खड़ा कर दें, तो लाइन पचास किलोमीटर लंबी होगी। और इन्हें ले जाने के लिए चाहिए दो हज़ार बसें।",
    image: "/s5.jpg",
  },
  {
    n: 6,
    title: "स्टेडियम",
    line: "दुनिया का सबसे बड़ा क्रिकेट स्टेडियम भी इनसे तीन-चौथाई भर जाएगा।",
    image: "/s6.jpg",
  },
  {
    n: 7,
    title: "भारत",
    line: "और भारत? यहाँ ऐसी एक लाख की भीड़, क़रीब पौने पंद्रह हज़ार बार समा जाती है।",
    image: "/s7.jpg",
  },
  {
    n: 8,
    title: "ज़िंदगियाँ",
    line: "तो अगली बार जब कोई कहे \"एक लाख\", याद रखिए: यह सिर्फ़ एक संख्या नहीं। एक लाख ज़िंदगियाँ हैं।",
    image: "/s8.jpg",
  },
];

export const story = {
  eyebrow: "SCENE BY SCENE",
  heading: "रील के आठ दृश्य",
  sceneWord: "दृश्य",
  stripLabel: "रील के आठ दृश्य, दाएँ-बाएँ स्क्रॉल करें",
  prev: "पिछला दृश्य",
  next: "अगला दृश्य",
  progressLabel: "दृश्य",
} as const;

export type MakingIcon = "idea" | "facts" | "code" | "audio" | "web";

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
      title: "संदर्भ से विचार तक",
      body: "एक वायरल रील के \"एक बनाम एक लाख\" वाले विचार से शुरुआत हुई; हमने उसे तथ्यों पर टिकी एक नई कहानी में बदला।",
    },
    {
      icon: "facts",
      title: "तथ्य और गणना",
      body: "हर आँकड़ा सार्वजनिक स्रोतों से जाँचा गया और हर तुलना के साथ उसकी मान्यता लिखी गई।",
    },
    {
      icon: "code",
      title: "कोड से बने दृश्य",
      body: "रील का हर फ़्रेम कोड से बनाया गया है (Python, Cairo, NumPy, OpenCV)। स्क्रीन पर दिखने वाले एक लाख बिंदु सचमुच एक लाख हैं।",
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

export interface Source {
  label: string;
  href: string;
}

export const sourcesBlock = {
  heading: "स्रोत और गणना",
  tableLabel: "आठ तथ्य और उनका आधार",
  columns: { fact: "तथ्य", figure: "आँकड़ा", basis: "आधार" },
  note: "ये अनुमान हैं, सटीक गिनती नहीं। भीड़ की घनता जगह और मौक़े के हिसाब से बदलती है।",
  listLabel: "स्रोत",
  sources: [
    {
      label: "FIFA Football Stadiums Guidelines, pitch dimensions",
      href: "https://publications.fifa.com/en/football-stadiums-guidelines/technical-guideline/stadium-guidelines/pitch-dimensions-and-surrounding-areas",
    },
    {
      label: "ICC venue page, stadium capacity",
      href: "https://www.icc-cricket.com/tournaments/mens-t20-world-cup-2026/venues/icc-men-s-t20-world-cup-2026-narendra-modi-stadium",
    },
    {
      label: "Columbia Journalism Review, how crowd sizes are estimated (Jacobs method)",
      href: "https://www.cjr.org/analysis/how-many-marched-protests-hong-kong-how-guess-crowd-size.php",
    },
    {
      label: "StatisticsTimes, India demographics (UN WPP 2024)",
      href: "https://statisticstimes.com/demographics/country/india-demographics.php",
    },
  ] satisfies Source[],
} as const;

export const closing = {
  eyebrow: "ONE LAKH LIVES",
  lines: ["यह सिर्फ़ एक संख्या नहीं।", "एक लाख ज़िंदगियाँ हैं।"],
  watch: "रील देखें",
  share: "शेयर करें",
  follow: "Instagram पर फ़ॉलो करें",
  copied: "लिंक कॉपी हो गया",
  copyFailed: "लिंक कॉपी नहीं हो सका। ऊपर पता बार से कॉपी कर लें।",
} as const;

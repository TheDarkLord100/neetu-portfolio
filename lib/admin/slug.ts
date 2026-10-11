// Hindi title → Latin slug in everyday Hinglish spelling ("बारिश की रात" →
// "barish-ki-raat"). A best guess only: the slug always stays editable.
// No dependency; plain rules:
// - every consonant carries an "a" unless a vowel sign or virama follows, the
//   consonant ends the word, or the "a" is dropped inside the word (checked
//   right to left: a voiced syllable before, consonant + vowel after:
//   धड़कन → dhadkan, बदलते → badalte);
// - "ा" is "aa" at the start of a word and in a closed last syllable
//   (रात → raat, हिसाब → hisaab), otherwise "a" (बारिश → barish);
// - "ी" is "i" at the end of a word (की → ki) and "ee" elsewhere (पीपल → peepal);
//   "ू" is always "oo" (धूप → dhoop);
// - "व" is "v" before i/e sounds (विजय → vijay), otherwise "w" (सावन → sawan);
// - "ें" at the end of a word is "ein" (बातें → baatein); a final "ँ" lengthens
//   the vowel instead of adding "n" (माँ → maa).

const CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v", श: "sh", ष: "sh", स: "s", ह: "h", ळ: "l",
  // Precomposed nukta letters (U+0958–U+095F).
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};
// Consonant + combining nukta (़).
const NUKTA: Record<string, string> = { क: "q", ख: "kh", ग: "g", ज: "z", ड: "r", ढ: "rh", फ: "f", य: "y" };

// Vowels by sound: "aa" / "ii" / "uu" are the long ones whose spelling depends on position.
type Sound = "a" | "aa" | "i" | "ii" | "u" | "uu" | "ri" | "e" | "ai" | "o" | "au";

const INDEPENDENT: Record<string, Sound> = {
  अ: "a", आ: "aa", इ: "i", ई: "ii", उ: "u", ऊ: "uu", ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऑ: "o",
};
const SIGNS: Record<string, Sound> = {
  "ा": "aa", "ि": "i", "ी": "ii", "ु": "u", "ू": "uu",
  "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};
const FRONT_VOWELS = new Set<Sound>(["i", "ii", "e", "ai", "ri"]);
const VIRAMA = "्";
const NUKTA_SIGN = "़";
const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";
const LABIALS = new Set(["प", "फ", "ब", "भ", "म"]);

// One syllable unit of a word.
type Unit =
  | { type: "consonant"; latin: string; letter: string; vowel: Sound | null; virama: boolean; nasal: string }
  | { type: "vowel"; vowel: Sound; nasal: string }
  | { type: "other"; latin: string };

function parseWord(word: string): Unit[] {
  const units: Unit[] = [];
  const chars = [...word.normalize("NFC")];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (CONSONANTS[c] !== undefined) {
      let latin = CONSONANTS[c];
      if (chars[i + 1] === NUKTA_SIGN) {
        latin = NUKTA[c] ?? latin;
        i++;
      }
      const unit: Extract<Unit, { type: "consonant" }> = { type: "consonant", latin, letter: c, vowel: null, virama: false, nasal: "" };
      const next = chars[i + 1];
      if (next === VIRAMA) {
        unit.virama = true;
        i++;
      } else if (next !== undefined && SIGNS[next]) {
        unit.vowel = SIGNS[next];
        i++;
      }
      units.push(unit);
    } else if (INDEPENDENT[c]) {
      units.push({ type: "vowel", vowel: INDEPENDENT[c], nasal: "" });
    } else if (c === ANUSVARA || c === CHANDRABINDU || c === VISARGA) {
      const last = units.at(-1);
      const mark = c === VISARGA ? "h" : c === CHANDRABINDU ? "~" : "n";
      if (last && last.type !== "other") last.nasal += mark;
    } else if (c >= "०" && c <= "९") {
      units.push({ type: "other", latin: String(c.charCodeAt(0) - 0x0966) });
    } else if (/[a-z0-9]/i.test(c)) {
      units.push({ type: "other", latin: c.toLowerCase() });
    }
    // Anything else (dandas, other signs) is dropped.
  }
  return units;
}

function transliterateWord(word: string): string {
  const units = parseWord(word);
  if (units.length === 0) return "";
  const lastIndex = units.length - 1;

  // Which consonants keep their inherent "a" (right to left, see above).
  const keepsA = units.map((u, i) => u.type === "consonant" && !u.virama && !u.vowel && (i < lastIndex || units.length === 1));
  const voiced = (i: number) => {
    const u = units[i];
    return !!u && (u.type === "vowel" || (u.type === "consonant" && (u.vowel !== null || keepsA[i])));
  };
  for (let i = lastIndex - 1; i >= 1; i--) {
    const u = units[i];
    if (u.type !== "consonant" || !keepsA[i] || u.nasal) continue;
    const next = units[i + 1];
    if (voiced(i - 1) && next.type === "consonant" && voiced(i + 1)) keepsA[i] = false;
  }

  const last = units[lastIndex];
  const endsClosed = last.type === "consonant" && !last.vowel && !keepsA[lastIndex];

  let out = "";
  units.forEach((u, i) => {
    if (u.type === "other") {
      out += u.latin;
      return;
    }
    const isLast = i === lastIndex;
    let sound: Sound | null = u.vowel;
    if (u.type === "consonant") {
      const nextSound = u.vowel ?? (keepsA[i] ? "a" : null);
      out += u.letter === "व" ? (nextSound && FRONT_VOWELS.has(nextSound) ? "v" : "w") : u.latin;
      sound = nextSound;
    }
    // A final "ँ" lengthens a one-letter word (माँ → maa); elsewhere it is "n" (कहानियाँ → kahaniyan).
    const finalNasal = isLast && units.length === 1 && u.nasal.includes("~");
    const medialIndependent = u.type === "vowel" && i > 0;
    if (sound) out += spell(medialIndependent && sound === "ii" ? "i" : sound, { atStart: i === 0 && u.type === "vowel", isLast, inClosedLastSyllable: endsClosed && i === lastIndex - 1, finalNasal });
    out += nasal(u.nasal, units[i + 1], isLast && units.length === 1, sound);
  });
  return out;
}

function spell(sound: Sound, at: { atStart: boolean; isLast: boolean; inClosedLastSyllable: boolean; finalNasal: boolean }): string {
  switch (sound) {
    case "aa":
      return at.atStart || at.inClosedLastSyllable || at.finalNasal ? "aa" : "a";
    case "ii":
      return at.isLast ? "i" : "ee";
    case "uu":
      return "oo";
    default:
      return sound;
  }
}

// Anusvara before p/ph/b/bh/m sounds like "m" (अंबर → ambar). "ँ" is silent in
// a one-letter word (माँ → maa); a final "ें" is "ein" (बातें → baatein).
function nasal(mark: string, next: Unit | undefined, silentChandrabindu: boolean, sound: Sound | null): string {
  if (!mark) return "";
  let out = mark.replace(/~/g, silentChandrabindu ? "" : "n");
  if (!next && sound === "e" && out.startsWith("n")) out = "i" + out;
  if (out.startsWith("n") && next?.type === "consonant" && LABIALS.has(next.letter)) out = "m" + out.slice(1);
  return out;
}

export function slugify(title: string): string {
  return title
    .split(/[\s\-–—_/.,:;!?'"“”‘’()।॥]+/)
    .map((word) => transliterateWord(word))
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Same rule as the database check on slugs. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Same normalisation as the database's normalize_search_text(): removes the
// nukta in both typed forms (separate sign U+093C, or precomposed letters
// U+0958–U+095F) and lowercases. Keep the two in sync.

const PRECOMPOSED_NUKTA: Record<string, string> = {
  "क़": "क",
  "ख़": "ख",
  "ग़": "ग",
  "ज़": "ज",
  "ड़": "ड",
  "ढ़": "ढ",
  "फ़": "फ",
  "य़": "य",
};

export function normalizeSearchText(input: string): string {
  return input
    .replace(/़/g, "")
    .replace(/[क़-य़]/g, (ch) => PRECOMPOSED_NUKTA[ch] ?? ch)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

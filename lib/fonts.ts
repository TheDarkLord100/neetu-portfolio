import { Mukta, Tiro_Devanagari_Hindi } from "next/font/google";

// The only place fonts are defined. Temporary choices until DESIGN.md exists;
// swap them here and everything else picks them up via the CSS variables.

export const headingFont = Tiro_Devanagari_Hindi({
  weight: "400",
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-heading-face",
});

export const bodyFont = Mukta({
  weight: ["400", "700"],
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-body-face",
});

export const fontVariables = `${headingFont.variable} ${bodyFont.variable}`;

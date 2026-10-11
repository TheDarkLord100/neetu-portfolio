import { routes } from "@/lib/routes";

// Home page settings (DESIGN.md §7.1). Change numbers and rows here, not in components.

export const homeConfig = {
  /** Works listed under "नई रचनाएँ". */
  latestCount: 5,
  /** Books in the पुस्तकें strip (her own printed books and anthologies, newest first). */
  booksCount: 4,
  /** Saved works shown on the home page before "सभी सहेजी रचनाएँ देखें". */
  savedCount: 4,
  /**
   * "क्या पढ़ना चाहेंगे?" rows. `label` is a key in messages `home.browse`;
   * `href` is unprefixed (the panel adds the language prefix);
   * `swatch` is a DESIGN.md colour variable.
   */
  browseRows: [
    { label: "stories", href: `${routes.works}?kind=story`, swatch: "var(--cloth-story)" },
    { label: "poems", href: `${routes.works}?kind=poem`, swatch: "var(--cloth-poem)" },
    { label: "novels", href: `${routes.works}?kind=novel`, swatch: "var(--cloth-novel)" },
    { label: "series", href: `${routes.works}?kind=series`, swatch: "var(--cloth-series)" },
    // No kind of its own: olive, as in the mockup.
    { label: "audiobooks", href: `${routes.works}?format=audiobook`, swatch: "var(--cloth-collection)" },
  ],
} as const;

export type BrowseRowLabel = (typeof homeConfig.browseRows)[number]["label"];

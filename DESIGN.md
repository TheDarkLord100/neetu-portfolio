# DESIGN.md — neetu-portfolio

The visual system for the public site. Built from `docs/design-notes.md` and the approved images in `docs/mockups/` (10 Oct 2026).

- **Never invent** colours, fonts, sizes or spacing outside this file. If something is missing, ask and add it here first.
- Where this file and a mockup image disagree, this file wins.
- Values marked *(m)* were measured from the mockup images, not stated in design-notes. Values marked *(chosen)* aren't in either source; they were decided while writing this file.
- CLAUDE.md's UI rules still apply on top of everything here.

---

## 1. Principles

1. **A handmade Hindi book.** Coffee-stained paper, ink-brown text, walnut and turmeric accents. Literary and warm, never a tech product. Works come first; her introduction comes after.
2. **Readable for older readers on phones.** Large Devanagari text with generous line-height, high contrast and plainly labelled controls.
3. **Nothing moves on its own.** No auto-rotating carousels, auto-advancing content, parallax or decorative animation. State changes (a saved button filling in, a panel opening) are instant or use a transition of 150ms or less, and are disabled under `prefers-reduced-motion`.
4. **No hover-only interactions or hidden gestures.** Hover may darken a button, but every action is visible and works by tap and keyboard.
5. **Every tap target is at least 44×44px.** Small-looking elements (pills, text buttons) get an invisible 44px hit area (see §4.7).
6. **Light mode only.** No dark theme.
7. **Paper first, texture second.** Every page must look right with the texture images missing (plain `--paper` background).

---

## 2. Colour tokens

All colours, as CSS custom properties. Nothing else is allowed.

| Token | Hex | Used for |
|---|---|---|
| `--paper` | `#EEDCB6` | page background base (under the texture); fallback when texture is off |
| `--paper-raised` | `#F4E6C8` | panels, platform side of stamps, search field, chips, outline buttons |
| `--label-paper` | `#F4EAD2` | title label on cloth covers |
| `--ink` | `#2A1E12` | body text, headings, heavy rules, footer background, focus outline |
| `--ink-soft` | `#5A4430` | secondary text: meta lines, dates, captions, `<dl>` labels |
| `--walnut` | `#6B4116` | plain links, the verb block of stamps, primary buttons, selected chips, current page |
| `--walnut-dark` | `#55320F` | pressed / hover state of walnut fills |
| `--on-walnut` | `#FBF5E8` | text and icons on walnut or ink-dark fills |
| `--turmeric` | `#B57A1E` | small accents only: active-nav underline, title-link underline, ornament, carousel marker underline, quote marks, listening dot. **Never text.** |
| `--line` | `#C9B48A` | decorative dividers between rows and sections (not for controls) |
| `--line-strong` | `#7A6446` | borders of buttons, fields, chips, checkboxes (≥3:1 on paper) |
| `--footer-text-soft` | `#D9C9A6` | secondary text on the ink footer |

### Cloth colours (cover fallback, swatches)

One colour per work kind. The title label on the cover carries the text, so the cloth itself never holds body text (only her name or the editor byline in `--label-paper`, at least 15px).

| Token | Hex | Kind |
|---|---|---|
| `--cloth-story` | `#8A5A1E` | कहानी |
| `--cloth-poem` | `#5A6233` | कविता |
| `--cloth-novel` | `#6E2F1A` | उपन्यास (incl. series parts) |
| `--cloth-series` | `#3E3122` | धारावाहिक उपन्यास |
| `--cloth-collection` | `#6B5B22` | संग्रह (all collections, poetry or story) |
| `--cloth-anthology` | `#5B3434` | साझा संकलन |

A series part's thumbnail uses `--cloth-novel`; its big cover may use `--cloth-series` (as in `03-work/desktop-3-series-part`).

### Approved contrast pairs

"Flat" is computed from the hex values; "on texture" is design-notes' check against the darkest stained paper, and is the figure that counts.

| Pair | Flat | On texture |
|---|---|---|
| ink on paper | 12.0:1 | ~11:1 |
| ink-soft on paper | 6.8:1 | ~5.4:1 |
| walnut text on paper | 6.5:1 | ~5.2:1 |
| on-walnut on walnut | 8.1:1 | — |
| on-walnut on ink (footer) | 15.0:1 | — |
| footer-text-soft on ink | 9.9:1 | — |
| line-strong borders on paper | 4.2:1 | ~2.9–3.5:1 |
| label-paper byline on cloth | 4.9:1 (story, lowest) to 10.5:1 (series) | — |
| turmeric on paper | 2.7:1 (why turmeric is never text) | — |

Don't introduce any text/background pair that isn't in this table without checking it reaches 4.5:1 (3:1 for text 24px and up).

---

## 3. Typography

### Fonts

Loaded only through `lib/fonts.ts` (`next/font`, `devanagari` + `latin` subsets, `display: swap`).

| Role | Font | Weights | Used for |
|---|---|---|---|
| Heading (`--font-heading`) | **Tiro Devanagari Hindi** | 400 only | her name, page and section headings, work titles, synopsis / lead text, excerpts, quotes, series part numbers |
| Body (`--font-sans`) | **Mukta** | 400, 500, 600, 700 | everything else: nav, buttons, meta, body, forms, labels |

- Tiro is never bolded or synthesised (`font-weight: 400`, `font-synthesis: none`).
- No all-caps. No italics for emphasis; use Mukta 600 instead.
- Platform names (Pratilipi, Kuku FM, Amazon) stay in Latin script, in Mukta.
- Numbers always use regular digits (1, 2, 3), not Devanagari digits (१, २, ३): readers are more familiar with them. This covers dates, counts, page numbers and part numbers.

### Type scale

Phone value / desktop value. Line-heights are unitless.

| Token | Font | Phone | Desktop | Line-height | Used for |
|---|---|---|---|---|---|
| `display-xl` | Tiro | 52px | 72px | 1.2 | her name on the About page |
| `display` | Tiro | 42px | 60px | 1.2 | page h1: featured title, work title, book title, catalog / books page title |
| `h2` | Tiro | 32px | 38px | 1.3 | section headings ("नई रचनाएँ", "पुस्तकें", "लेखन का सफ़र") |
| `h3` | Tiro | 25px | 28px | 1.35 | list titles (work rows, book cards), panel headings |
| `quote` | Tiro | 24px | 30px | 1.6 | About page quote |
| `lead` | Tiro | 20px | 22px | 1.9 | synopsis, featured synopsis, excerpt, About intro |
| `body` | Mukta 400 | 18px | 19px | 1.8 | paragraphs, descriptions |
| `ui` | Mukta 500–600 | 17px | 17px | 1.4 | nav, buttons, chips, labels, field text, filter rows |
| `ui-strong` | Mukta 600–700 | 17px | 17px | 1.4 | filter group headings, results count, stamp verbs |
| `meta` | Mukta 400–500 | 15px | 16px | 1.5 | kind lines, dates, detail lines, captions, counts *(m)* |

- Sizes are given in px for readability but implemented in `rem` (16px = 1rem), so they follow the reader's browser text-size setting.
- Body copy is never below 18px. `meta` is for short secondary lines only, never paragraphs.
- design-notes gives the work-page title as 58px desktop / 40px phone and the featured title as 40px phone. These are folded into `display` (60 / 42) to keep one h1 size. *(chosen; flag if the difference matters)*

---

## 4. Layout tokens

### 4.1 Page width and gutters

| Token | Value |
|---|---|
| `--content-max` | 1200px |
| `--gutter` | 16px phone; 48px desktop (content is centred, so at 1440px the left edge sits at 120px) |
| `--reading-max` | 820px *(m)*: synopsis, about text and the work-page main column |

### 4.2 Breakpoint

One layout switch at **1024px** *(chosen; mockups exist only at 390 and 1440)*.

- Below 1024px: the phone layout (single column, 4-tab nav row, stacked sections).
- **Tablet (600–1023px):** the same phone layout, with the content column capped at 720px and centred. The extra width becomes empty paper at the edges; nothing is stretched (stamps, buttons and fields stay "full width" of the 720px column, not of the screen). The paper texture and header hairline still span the full screen.
- From 1024px: the desktop layout (inline nav, sidebars, side columns, grids).

### 4.3 Spacing scale

`4, 8, 12, 16, 24, 32, 48, 64, 96` px *(m)*. Use only these.

| Use | Phone | Desktop |
|---|---|---|
| Between major page sections | 64 | 96 |
| Section heading → content | 24 | 32 |
| Between list rows (padding inside each row) | 24 | 24 |
| Panel padding | 20 | 28 |
| Gap between buttons in a row | 8 | 12 |
| Cover → text column (desktop) | — | 64–72 |

### 4.4 Radius

| Token | Value | Used for |
|---|---|---|
| `--radius-control` | 6px | buttons, fields, stamps, selects |
| `--radius-panel` | 8px | panels, empty state |
| `--radius-pill` | 999px | chips, pills, jump links |
| book corners | 2px spine side / 5–6px fore-edge | covers only |

### 4.5 Shadows

Only cover objects (books, the About photo print) cast a shadow: `0 10px 24px rgba(42,30,18,.28), 0 2px 4px rgba(42,30,18,.2)` *(m)*. Nothing else floats: no shadows on panels, buttons or the header.

### 4.6 Rules and dividers

| Rule | Spec | Used for |
|---|---|---|
| hairline | 1px `--line` | between list rows, under the header, between sections, inside panels |
| heavy | 2px `--ink` | under results headers, book-group headings and contents lists |
| ornament | hairline either side of a small turmeric diamond + short bars, centred | between major sections on the home page and the About intro |
| dotted leader | 1px dotted `--line-strong`, desktop only | title → date in work rows |

### 4.7 Tap targets and focus

- Minimum 44×44px for every link, button, field, chip and checkbox row. Where a control looks smaller (action pills ~32px, the "हटाएँ" text button, inline text links), extend the hit area with padding or a transparent `::before` so the tappable box is at least 44px tall, without changing its look. Neighbouring hit areas must not overlap.
- **Focus:** `outline: 3px solid var(--ink); outline-offset: 3px` on every interactive element, via `:focus-visible`. On walnut fills it stays ink (visible against paper around it).
- Disabled controls: 45% opacity, `cursor: default`, with `aria-disabled`/`disabled` set.

---

## 5. Paper texture

Files in `public/textures/` (ours to use):

| File | Size | Repeat |
|---|---|---|
| `paper-centre.jpg` | 512×512 | tiles both ways, light centre with faint fibres |
| `edge-left.png`, `edge-right.png` | 140×512 | `repeat-y` |
| `edge-top.png`, `edge-bottom.png` | 512×140 | `repeat-x` |

- Applied as five layered backgrounds on the page wrapper (four edges over the centre), over `background-color: var(--paper)`.
- Edge strips: 140px wide on desktop; scaled to **28px** on phone, so the stain never sits under text.
- The footer (ink) sits outside the paper wrapper.
- Panels use flat `--paper-raised`, with no texture.
- With the texture removed, the page must still look finished (`01-home/desktop-5-texture-off`).

---

## 6. Components

States are listed for each component. "Phone" means below 1024px.

### 6.1 Header

- **Name** "नीतू सिंह" (Tiro, ~40px desktop / 34px phone *(m)*) linking home, with the tagline "कहानियाँ, कविताएँ और उपन्यास" (`meta`, ink-soft) below.
- **Nav:** मुखपृष्ठ · रचनाएँ · पुस्तकें · परिचय (Mukta 500–600, `ui`). Current section: ink text plus a 3px turmeric underline under the item, and `aria-current="page"`. Work pages count as रचनाएँ, book pages as पुस्तकें.
  - Desktop: inline, right of the name.
  - Phone: a visible 4-tab row under the name (equal widths, 48px tall). No hamburger.
- **No search in the header** (decided after the mockups, which showed one). Search lives on the रचनाएँ page (§6.13, §7.2), one tap away in the nav.
- A full-width hairline under the header.

### 6.2 Footer (same on every page)

On `--ink`, text `--on-walnut` / `--footer-text-soft`.

- Name (Tiro) + tagline.
- Nav: the 4 sections, as underlined links (2 columns on phone, 1 column on desktop).
- **संपर्क:** email, "प्रतिलिपि पर नीतू सिंह" and other platform profile links, social links (from `author_profile`).
- Hairline (`--footer-text-soft` at low opacity), then "© <year> नीतू सिंह। सभी रचनाओं के अधिकार लेखिका के पास सुरक्षित हैं।"
- Desktop: three columns (name | nav | contact). Phone: stacked.

### 6.3 Breadcrumb

- Desktop: "रचनाएँ › कहानियाँ › <title>": walnut underlined links, current item plain ink, `›` separators in ink-soft, `meta` size, 44px tall links.
- Phone: last item dropped ("रचनाएँ › कहानियाँ"). Book pages show only "‹ सभी पुस्तकें".
- `<nav aria-label="breadcrumb">`, current item `aria-current="page"`.

### 6.4 Links

- **Title links** (work and book titles in lists): ink Tiro text with a 2px turmeric underline offset ~4px. On hover/press the underline thickens to 3px.
- **Plain links** (inline, "सभी पुस्तकें देखें", "इसमें भी शामिल: …"): walnut, underlined, Mukta 500–600.
- **Phone pattern:** a section's closing "see all" link ("सभी रचनाएँ देखें", "सभी पुस्तकें देखें", "सभी सहेजी रचनाएँ देखें (n)") becomes a full-width outline button on phone.
- External links (platforms) open in a new tab with `rel="noopener noreferrer"` and visually hidden text "(नई विंडो में खुलेगा)".

### 6.5 Buttons

| Variant | Look | Height | Used for |
|---|---|---|---|
| Primary | walnut fill, on-walnut text, Mukta 600 | 52–56px | "सभी फ़िल्टर हटाएँ" (empty state), "n रचनाएँ दिखाएँ", "अगला भाग पढ़ें", "उनकी रचनाएँ पढ़ें", email |
| Outline | `--paper-raised` fill, 1px `--line-strong` border, ink text, optional `›` chevron | 52–56px | "सभी रचनाएँ देखें", "पूरा परिचय पढ़ें", "भाग 1 से पढ़ना शुरू करें", "संपर्क करें", carousel पिछली / अगली |
| Text | walnut underlined text, no box | ≥44px hit area | "हटाएँ", "सभी फ़िल्टर हटाएँ" (sidebar) |

- Pressed / hover: walnut fills go `--walnut-dark`. Outline buttons get a slightly darker background *(chosen: 4% ink overlay)*.
- Phone: primary and outline buttons inside content are full-width.

### 6.6 Release button ("stamp")

The main action for every release. An `<a>` to the platform URL.

- Two parts in one bordered box (1px `--line-strong`, radius 6px):
  1. **Verb block:** walnut fill, on-walnut verb पढ़ें / सुनें / खरीदें (Mukta 700, ~20px *(m)*), ~64–96px wide, centred.
  2. **Platform side:** `--paper-raised`, platform logo (24px box) + platform name (Mukta 500, `ui`).
- Height 56px (54px minimum). Desktop: inline, min-width 250px. Phone: full width.
- **Detail line** (`meta`, ink-soft): desktop to the right of the stamp, phone directly below it. Examples: "प्रतिलिपि पर ऑनलाइन", "ऑडियो कहानी, वाचक: …", "छपी किताब, <publisher>", "Kindle ई-बुक", "प्रतिलिपि पर, 18 अध्याय", "पूरे धारावाहिक का ऑडियोबुक, वाचक: …".
- Stack: 12px gap between stamps *(m)*.
- Pressed: the verb block goes `--walnut-dark`.
- Accessible name: "<verb> — <platform>" (e.g. "पढ़ें — Pratilipi").
- Verb by format: `online` → पढ़ें, `audiobook` → सुनें, `print` / `ebook` → खरीदें.
- Platform logo: `platforms.logo_path`; if missing, a dashed 24px box with the platform's first letter (as in the mockups).

### 6.7 Action pills (compact release links)

Used in work rows, saved works and contents lists to show what's available.

- Pill: `--paper-raised`, 1px `--line-strong` border, walnut text पढ़ें / सुनें / खरीदें (Mukta 600, ~15px), ~32px visual height, radius pill.
- **Each pill links straight to that release's platform** (the title links to the work page). Hit area extended to 44px (§4.7). Accessible name includes the platform: "पढ़ें — Pratilipi".
- One pill per verb. If a work has two releases with the same verb (e.g. Amazon print + Kindle), the pill links to the work page instead *(chosen)*.
- Context text may follow on the same line (`meta`): "इसमें भी शामिल: <book link>", "धारावाहिक उपन्यास: <series link>", "किताब के रूप में भी: <book link>".

### 6.8 Cloth cover (fallback cover)

Used when a work has no `cover_path`, and as the style for all list thumbnails.

- Cloth fill by kind (§2), darker spine edge on the left (~10px, cloth darkened ~25%), thin inner rule inset ~10px (`--label-paper` at low opacity), and the book shadow (§4.5). Corners 2px spine / 6px fore-edge.
- Pasted **label** (`--label-paper`) across the middle third: title (Tiro), a short centred rule, kind (Mukta `meta`).
- Byline at the bottom in `--label-paper`: "नीतू सिंह", or "संपादक: <name>" for anthologies.
- Aspect ratio 2:3.

| Size | Phone | Desktop |
|---|---|---|
| Big (work / book / featured page) | 190–200px wide, centred | 280–300px wide |
| Book card (books page) | 96px thumbnail beside text | 180px |
| Row thumbnail (catalog) | 44×66px | 64×96px |
| Small (saved works, appears-in) | ~32×48px, label only, no text | same |

- Small and row thumbnails show the label shape only (no readable text) and are `aria-hidden`.
- Real cover images (`next/image`) keep the same size, corners and shadow.

### 6.9 Work row ("contents" list)

Used in latest works (home), catalog results, and book contents.

1. Thumbnail (catalog only, §6.8).
2. **Title** (Tiro `h3`, title link). Desktop: a dotted leader runs to the date on the right. Phone: no leader; the date joins the kind line.
3. **Kind line** (`meta`, ink-soft; kind in 600): "कविता, विषय: प्रेम", "उपन्यास, 42 अध्याय", "उपन्यास, धारावाहिक का भाग 2". On phone in the catalog, genres go on their own line ("विषय: …").
4. One-line description (`body`).
5. Action pills + context (§6.7).
6. **Save button** (catalog only), aligned right, level with the pills.

Rows are separated by hairlines, with 24px vertical padding.

### 6.10 Save button

- Outline control (44px tall), bookmark icon + "सहेजें".
- Saved: walnut fill, filled bookmark, on-walnut text "सहेजी गई". `aria-pressed="true"`.
- Renders in the unsaved state on the server, then reads `localStorage` after mount (see CLAUDE.md). No layout shift between states (fixed min-width *(chosen)*).

### 6.11 Panels

- `--paper-raised`, 1px `--line` border, radius 8px, padding 20 / 28px. No shadow.
- Heading inside: Tiro `h3`.
- Used for: saved works, browse-by-kind, series parts, "इसमें भी शामिल", awards, contributors, contact, filter sidebar, excerpt, series-part note (as a slim strip), empty state.

### 6.12 Chips

| Chip | Spec |
|---|---|
| Kind chip (catalog) | toggle `<button aria-pressed>`, 46px tall, pill, `--paper-raised` + `--line-strong` border. Selected: walnut fill, on-walnut text, tick icon. |
| Genre chip (work page) | link to the filtered catalog, 44px tall, pill, paper-raised + border. |
| Active-filter chip | button "<label> ✕" removing just that filter, 44px, pill. Accessible name "<label> हटाएँ". |
| Jump link (books page) | 46px pill link with a cloth swatch + label + count. |
| Contributor chip (anthology) | **non-interactive label** (a `<li>`, not a button): नीतू सिंह = walnut fill; featured co-authors = paper-raised + `--line` border (softer than buttons, no hover); "और N अन्य लेखक" = dashed border. |

### 6.13 Form controls (catalog)

- **Search field:** visible label "नाम या किसी शब्द से खोजें" (`ui-strong`), 56px tall, `--paper-raised`, 1px `--line-strong`, radius 6px, magnifier icon inside left, placeholder "जैसे: बारिश की रात". Clear button "✕" (44px, `aria-label="खोज साफ़ करें"`) inside right when filled.
- **Voice button "बोलें":** outline, mic icon + text, 56px, beside the field. Listening: walnut fill, text "रोकें". A status line below the field shows a turmeric dot + "सुन रहे हैं… रचना का नाम बोलिए" (`aria-live="polite"`). The button stays visible even where speech recognition is unsupported; tapping it then shows the unsupported message (§8).
- **Checkbox row:** 46–48px tall, 22px box with a `--line-strong` border; checked = walnut fill with a white tick. Label `ui`, count right-aligned in `meta` ink-soft.
- **Select** ("एक पृष्ठ पर" 10/25/50/100, "क्रम" नई पहले / पुरानी पहले / नाम से): native `<select>`, 48px, paper-raised, `--line-strong` border, radius 6px, visible label beside it.

### 6.14 Pagination

- Desktop: "‹ पिछला", page numbers, "अगला ›". Current page: walnut fill with `aria-current="page"`. Gaps shown as "…" (first, last, current ±1). Buttons 48–52px.
- Phone: "‹ पिछला" · "पृष्ठ 2 / 4" · "अगला ›".
- Disabled ends at 45% opacity.
- Line below (`meta`, centred): "कुल 34 में से 11–20 दिखाई जा रही हैं".

### 6.15 Facts list (book page)

A `<dl>` in two columns: label (`meta`, ink-soft, ~90px) and value (`ui`, ink).

- Series: भाग (count), पहला भाग (date), ताज़ा भाग (date of the latest part; omitted when there is only one), विषय.
- Collection: प्रकाशक, प्रकाशन वर्ष, कविताएँ / कहानियाँ (count), ISBN.
- Anthology: संपादक, लेखक ("नीतू सिंह और 27 अन्य"), प्रकाशक, प्रकाशन वर्ष.

### 6.16 Excerpt panel ("एक अंश")

Panel with a large turmeric opening quote mark (Tiro, ~48px), excerpt in Tiro `lead` with line breaks preserved (`white-space: pre-line`), caption (`meta`): "पूरी रचना पढ़ने के लिए ऊपर दिए गए बटन देखें।". Hidden if there is no excerpt.

### 6.17 Quote (About)

Turmeric quote mark, her words in Tiro `quote`, caption "नीतू सिंह" (`meta`). No panel. Hidden if empty.

### 6.18 Awards disclosure

- "प्रमुख सम्मान" panel: featured awards, each name (Mukta 600) with "संस्था, वर्ष" below (`meta`), separated by hairlines.
- Native `<details>`/`<summary>` "और सम्मान देखें (n)": 54px, walnut 600 text, a chevron that rotates when open. Content grouped by year (year subheading in Mukta 600, `meta`), one line each: "सम्मान, संस्था". Hidden if there are no non-featured awards.

### 6.19 Empty state

Panel, centred: open-book line icon (~64px, ink at 70%), heading "कोई रचना नहीं मिली" (Tiro `h3`), guidance text (`body`), primary button "सभी फ़िल्टर हटाएँ". Saved-only variant text in design-notes.

### 6.20 Featured carousel (home)

- Slide: big cover (left on desktop, top on phone) + "विशेष रचना" eyebrow (turmeric bar + `meta` 600) + title (`display`) + kind line + synopsis (`lead`) + stamps + detail line + optional link ("दोनों भाग देखें").
- Controls row under a hairline: counter "1 / 3" (`ui-strong`), **book-spine markers** (one per slide, in its cloth colour, ~12×24px; current one taller with a turmeric underline), "‹ पिछली" / "अगली ›" outline buttons. On phone the counter moves up beside the eyebrow.
- Markers are decorative (`aria-hidden`), not buttons; the buttons are the controls *(chosen; markers are too small to tap)*.
- Tap-only, never auto-rotates. The slide region has `aria-live="polite"` and `aria-roledescription="carousel"`; buttons have `aria-controls`. Wraps from last to first.

### 6.21 Language switch (added after the mockups)

Not in the mockups; built only from existing tokens.

- Segmented pill: each language in its own script ("हिंदी" | "English"), `ui` 600, 44px tall, `--paper-raised` with a 1px `--line-strong` border, radius pill. Current language: walnut fill, on-walnut text, `aria-current`.
- Plain links to the same page in the other language (`hrefLang`, `lang` set on each).
- Placement: header, far right. Desktop: after the nav. Phone: top right, beside the name.
- Shown only when more than one language is enabled (`lib/i18n/config.ts`); hidden while the site is Hindi-only.

---

## 7. Pages

Addresses: `/` home, `/works` catalog, `/work/<slug>` work, `/books` books list, `/book/<slug>` book, `/about` about (English paths, Hinglish slugs; see CLAUDE.md). Sections listed in order; "phone" means below 1024px.

### 7.1 मुखपृष्ठ (home) — `01-home`

1. Header.
2. **Featured carousel** (§6.20), through all works with `featured = true`. Hidden if there are none.
3. **Saved works** "आपकी सहेजी रचनाएँ": only when the reader has saved something. Panel, filled bookmark icon in the heading, line "यह सूची सिर्फ़ इसी फ़ोन या कंप्यूटर के ब्राउज़र में रहती है।", up to 4 items (small thumbnail, title link, "kind, date", pills, "हटाएँ"), "सभी सहेजी रचनाएँ देखें (n)" → catalog with `saved=1`. Desktop: 4-column grid. Phone: stacked.
4. Ornament divider.
5. **नई रचनाएँ** ("हाल में प्रकाशित कहानियाँ, कविताएँ और उपन्यास"): latest leaf works as work rows (no thumbnail, no save button), then "सभी रचनाएँ देखें".
   - Desktop: left column (~62%), with the **browse-by-kind panel** "क्या पढ़ना चाहेंगे?" on the right. Phone: the panel follows the list.
   - Panel rows (58–60px, cloth swatch, label, chevron):
     - कहानियाँ → `?kind=story`
     - कविताएँ → `?kind=poem`
     - उपन्यास → `?kind=novel`
     - धारावाहिक उपन्यास → books page, series group (`/books#dharavahik`)
     - सुनने के लिए (ऑडियोबुक) → `?format=audiobook`
6. Hairline. **पुस्तकें** ("छपी हुई किताबें, जिन्हें आप घर मँगा सकते हैं") + "सभी पुस्तकें देखें": book strip. Desktop: up to 4 cards in a row (cover 190px, title, detail line, stamp). Phone: rows of thumbnail + title/detail, full-width stamp under each.
7. Hairline. **About teaser:** photo (~220×270 desktop *(m)*), "नीतू सिंह के बारे में" (`h2`), short bio, "पूरा परिचय पढ़ें" outline button.
8. Footer.

### 7.2 रचनाएँ (catalog) — `02-catalog`


1. Title "रचनाएँ" (`display`) + intro line (`body`, ink-soft).
2. Search field + voice button (§6.13), and the voice status line when active.
3. Kind chips: सभी / कहानी / कविता / उपन्यास.
4. Filters:
   - Desktop: **sidebar** (~310px panel, always open, left), groups separated by hairlines: आपकी सूची (सिर्फ़ सहेजी हुई), कैसे उपलब्ध है (पढ़ने के लिए / सुनने के लिए (ऑडियोबुक) / छपी किताब), विषय, कहाँ मिलेगी. "सभी फ़िल्टर हटाएँ" text button when any filter is active.
   - Phone: full-width outline button "और फ़िल्टर" (with "(n चुने गए)" when active), filter icon left, chevron right, `aria-expanded`. Opens the same groups **inline below it** (not a modal), ending with the primary button "n रचनाएँ दिखाएँ" (closes the panel) and the text button "सभी फ़िल्टर हटाएँ".
5. Active-filter chips (one per filter, including "खोज: …" and "सहेजी हुई").
6. **Results header:** live count "34 रचनाएँ" / "34 में से 3 रचनाएँ" (`ui-strong`, `aria-live="polite"`), "एक पृष्ठ पर" and "क्रम" selects, heavy rule beneath. Phone: count on its own line, the selects below it.
7. Results: work rows with thumbnails and save buttons.
8. Pagination.
9. Empty state replaces 7–8 when there are no results.
10. Footer.

Data, URL state and search behaviour: see `docs/Data.md` ("Catalog query rules") and CLAUDE.md ("Client-side features").

### 7.3 रचना (work page) — `03-work`

1. Header, breadcrumb.
2. **Top:** desktop, big cover left and header block right; phone, cover centred, then the header block.
   - Kind line with a cloth swatch ("कहानी", "उपन्यास, धारावाहिक का भाग 1", "कहानी, छपी किताब के रूप में भी").
   - Title (`display`).
   - "पहली बार प्रकाशित: <month year>" (`meta`).
   - Genre chips.
   - **Series-part note** (slim panel strip), for parts only: "यह <series link> का भाग 1 है। पूरे धारावाहिक में 2 भाग हैं।"
   - **Releases:** heading (`ui-strong`) adapts: "कहाँ पढ़ें" / "कहाँ पढ़ें या सुनें" / "कहाँ पढ़ें, सुनें या खरीदें". Stamps with detail lines; a parent series' audiobook is inherited.
   - Hairline, then the **action row:** सहेजें, "WhatsApp पर भेजें" (`https://wa.me/?text=<title>, नीतू सिंह की रचना: <url>`), "लिंक कॉपी करें" (changes to "लिंक कॉपी हो गया" for 2.5s, announced via `aria-live`). Outline style, 48px. Phone: save + WhatsApp side by side, copy-link full width below. If "WhatsApp पर भेजें" doesn't fit at 390px, the phone label shortens to "WhatsApp" *(chosen fallback)*.
3. **Below:** desktop, a main column (~60%) and a side column (~33%); phone, all stacked.
   - Main: "<kind> के बारे में" (`h2`) + synopsis (Tiro `lead`); "एक अंश" (§6.16).
   - Side (phone: after the excerpt):
     - **"<series> के भाग"** panel: ordered list; current part in 600 with "आप यहाँ हैं" (not a link); other parts are links with a chevron; primary "अगला भाग पढ़ें" (hidden on the last part).
     - **"इसमें भी शामिल"** panel: small thumbnail, book title link, "साझा संकलन, नीतू सिंह और 27 अन्य लेखक".
     - **"इसी तरह की और रचनाएँ"** (no panel): 3 works sharing a genre (title link + "कहानी, पारिवारिक"), then "सभी रचनाएँ देखें".
4. Footer.

### 7.4 पुस्तकें (books list) — `04-books`

Lists every series, collection and anthology, plus single works with a `print` release.

1. Header. Title "पुस्तकें" (`display`) + intro.
2. Jump links (§6.12) to each group, with counts. A group with no books is hidden.
3. Groups, each with a `h2` heading + short note on one line (desktop) or two lines (phone), over a heavy rule. Anchor ids *(chosen)*:
   1. `#neetu-ki-pustaken`: **नीतू सिंह की पुस्तकें** ("उनकी अपनी छपी किताबें"): collections and single-story books
   2. `#sajha-sankalan`: **साझा संकलन** ("दूसरे लेखकों के साथ छपी किताबें")
   3. `#dharavahik`: **धारावाहिक उपन्यास** ("कई भागों में लिखे उपन्यास")
4. Desktop: grid `repeat(auto-fill, minmax(230px, 1fr))`, gap 44px row / 36px column. Card: 180px cover → title (`h3`, title link) → detail line (`meta`) → one stamp for the main release.
5. Phone: one book per row: 96px thumbnail + title / kind (600) / detail beside it, then a full-width 54px stamp; rows separated by hairlines.
6. The cover and title both link to the book page; the cover link is `aria-hidden` with `tabindex="-1"`.
7. Closing note: "ऑनलाइन कहानियाँ और कविताएँ <रचनाएँ link> पेज पर हैं।"
8. Footer.

### 7.5 पुस्तक / धारावाहिक (book page) — `05-book`

1. Header. Breadcrumb "पुस्तकें › <title>" (phone: "‹ सभी पुस्तकें").
2. **Top** (same split as the work page): big cover (anthology byline "संपादक: <name>"), kind line ("साझा संकलन, छपी हुई किताब"), title (`display`), facts list (§6.15).
3. **Releases:** heading "पूरा धारावाहिक सुनें" / "कहाँ खरीदें", stamps. Series also get the outline button "भाग 1 से पढ़ना शुरू करें ›".
4. Synopsis (Tiro `lead`).
5. **Contents:** heading "भाग" / "इस संग्रह की कविताएँ" / "इस संकलन में नीतू सिंह की रचना" (`h2`) + one-line note (`meta`) + heavy rule. Ordered list of work rows with a walnut Tiro number column ("भाग 1", "1"; none for anthologies). Max width `--reading-max`.
6. **Anthology only:** contributors panel "इस संकलन के लेखक": "संपादक: <name>" (600), contributor chips (§6.12), note "इस वेबसाइट पर सिर्फ़ नीतू सिंह की रचनाएँ दी गई हैं। बाक़ी रचनाएँ पढ़ने के लिए पुस्तक देखें।"
7. Footer.

### 7.6 परिचय (about) — `06-about`

1. Header.
2. **Intro:**
   - Photo as a print: cream mount (`--label-paper`), the photo rotated −1.5°, book shadow, "नीतू सिंह" in Tiro below. Desktop ~320px wide on the left; phone ~250px, centred.
   - Name (`display-xl`), "हिंदी कहानीकार और कवयित्री" (`lead`, ink-soft), short bio (Tiro `lead`).
   - Buttons: primary "उनकी रचनाएँ पढ़ें" and outline "संपर्क करें" (jumps to `#sampark`). Phone: full-width, stacked.
3. Ornament divider.
4. Desktop: two columns; phone: stacked.
   - Main: "लेखन का सफ़र" (`h2`) + 2–3 paragraphs (`body`), then the quote (§6.17).
   - Side: "प्रमुख सम्मान" panel with the disclosure (§6.18), then "उन्हें कहाँ पढ़ें और सुनें" (`h3`): 64px rows with platform logo, name (600), one-line description (`meta`) and an external-link arrow, separated by hairlines.
5. **संपर्क** panel (`id="sampark"`, full width): purpose line, primary email button (mail icon + address), "सोशल मीडिया: <links>". Desktop: text left, button right.
6. Footer.

---

## 8. Behaviour and microcopy

| Feature | Rule |
|---|---|
| Carousel | Tap-only, wraps around, never auto-rotates, `aria-live="polite"`. |
| Saved list | `localStorage` (key and rules in CLAUDE.md). Wherever it's shown, the UI says it stays on this device. |
| Voice search | `hi-IN` Speech Recognition, interim results fill the field live. Messages (`aria-live`): unsupported "इस ब्राउज़र में बोलकर खोजने की सुविधा नहीं है। कृपया नाम टाइप करें।" · permission denied "माइक की अनुमति नहीं मिली। ब्राउज़र में माइक की अनुमति दें, या नाम टाइप करें।" · not understood "आवाज़ साफ़ समझ नहीं आई। फिर से "बोलें" दबाकर कोशिश करें।" |
| Copy link | Label → "लिंक कॉपी हो गया" for 2.5s, announced via `aria-live`. |
| Filters | Instant (no "apply" step) on desktop; on phone the panel's "n रचनाएँ दिखाएँ" button closes it (results already updated). |
| Page change | Scroll to the top of the results. |
| Saved-only + nothing saved | Empty state text: "आपने अभी तक कोई रचना नहीं सहेजी है। किसी भी रचना के साथ "सहेजें" दबाएँ, वह यहाँ और मुखपृष्ठ पर दिखेगी।" |

All UI strings live in `messages/hi.json` (CLAUDE.md); this file shows them for reference.

---

## 9. Open items

- Real content: photo, bio, quote, awards, publisher / narrator / editor names, dates, email, social links. Added once a working version of the site exists.
- Platform logos (currently lettered placeholder boxes, §6.6).

Ideas considered but not taken for the first version are kept in `docs/v2_suggestions.md`.

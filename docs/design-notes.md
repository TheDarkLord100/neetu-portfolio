# Design notes — neetu-portfolio (interim)

Working notes from the mockups. Becomes `DESIGN.md` once all pages are approved.
Status: **All page mockups done, 10 Oct 2026**: home, catalog, work, books list, book, about.

Mockups:
- **Images:** `docs/mockups/`, one image per page × device × variant (phone 390px, desktop 1440px); see `docs/mockups/INDEX.md`. These plus this file are the input for `DESIGN.md`.
- **Source:** the "Author Portfolio Site" design canvas in claude.ai, with six pages: मुखपृष्ठ, रचनाएँ, रचना, पुस्तकें, पुस्तक / धारावाहिक, परिचय.

Where the images and this file disagree, this file wins.

## Direction

A handmade Hindi book: coffee-stained paper, ink-brown text, walnut and turmeric accents. Literary and warm, not a tech product. Works come first on the home page; her introduction comes after.

## Colour (light mode only)

| Token | Hex | Used for |
|---|---|---|
| paper | `#EEDCB6` | page background base (under the texture) |
| paper-raised | `#F4E6C8` | panels, buttons' platform side, search field |
| label-paper | `#F4EAD2` | title label on cloth covers |
| ink | `#2A1E12` | body text, headings, footer background |
| ink-soft | `#5A4430` | secondary text, meta lines |
| walnut | `#6B4116` | links, action block of release buttons, search button |
| walnut-dark | `#55320F` | button pressed/hover |
| on-walnut | `#FBF5E8` | text on walnut |
| turmeric | `#B57A1E` | small accents only: active nav underline, ornament, carousel marker (never text) |
| line | `#C9B48A` | dividers (decorative) |
| line-strong | `#7A6446` | button and field borders (≥3:1) |
| footer-text-soft | `#D9C9A6` | secondary text on ink footer |

Cloth cover colours by kind (title label sits on top, so text contrast comes from the label):
story `#8A5A1E` · poem `#5A6233` · novel `#6E2F1A` · series `#3E3122` · collection `#6B5B22` · anthology `#5B3434`

Contrast checked: ink on paper ~11:1, ink-soft on darkest paper ~5.4:1, walnut text on paper ~5.2:1, on-walnut on walnut ~8:1, borders ≥2.9–3.5:1.

## Paper texture

Generated, ours to use. Files in `public/textures/`:
- `paper-centre.jpg` (512×512, tiles) — light centre with faint fibres
- `edge-left.png`, `edge-right.png` (140×512, repeat-y) and `edge-top.png`, `edge-bottom.png` (512×140, repeat-x) — mottled coffee stain, crisp dark rim, tide line

Layered as five CSS backgrounds on the page wrapper: four edges + centre. Edge strips are 140px wide on desktop and scaled to 28px on phone so the stain never sits under text. Must look fine with the texture off (fallback colour `#EEDCB6`).

## Type

- **Tiro Devanagari Hindi** (400): her name, page and section headings, work titles, featured synopsis
- **Mukta** (400/500/600/700): everything else — nav, buttons, meta, body, forms
- Body: 18px phone / 19px desktop, line-height 1.75–1.8
- Featured title: 40px phone / 60px desktop; section headings 32 / 38px; list titles 25 / 28px
- No all-caps, no italics for emphasis

## Layout

- Max content width 1200px; side padding 16px phone, up to 48px desktop
- Radius: 6px buttons and fields, 8px panels, books 2px spine / 5–6px fore-edge
- Shadows only on books (cover objects); nothing else floats

## Components (home)

- **Header:** her name (Tiro) + tagline; 4 sections. Phone: visible 4-tab row under the name (no hamburger), labelled search field below. Desktop: inline nav + search field with "खोजें" button. Active section: turmeric underline.
- **Featured carousel:** tap-only, never auto-rotates. पिछली / अगली buttons, "1 / 3" counter, book-spine markers in each work's cloth colour (current one taller with turmeric underline). `aria-live="polite"` on the slide. Rotates through all works marked `featured`.
- **Saved works ("आपकी सहेजी रचनाएँ"):** right after the carousel, **only when the reader has saved something**. Raised-paper panel with a filled bookmark icon in the heading, the line "यह सूची सिर्फ़ इसी फ़ोन या कंप्यूटर के ब्राउज़र में रहती है।", up to 4 items (small cloth thumbnail, title, kind + date, action pills, "हटाएँ" text button), and a link "सभी सहेजी रचनाएँ देखें (n)" to the catalog with the saved filter on. Grid on desktop, stacked on phone.
- **Release button ("stamp"):** walnut block with the action verb (पढ़ें / सुनें / खरीदें) + raised-paper side with platform logo and name. Full-width on phone, inline on desktop. Min height 54–56px.
- **Cloth-cover fallback:** cloth colour by kind, darker spine edge, inner rule, pasted paper label with title and kind, her name at the bottom.
- **Latest works ("contents" list):** title — dotted leader — date (desktop); kind + date line on phone; one-line description; small pills for available actions; "इसमें भी शामिल" link when in a book.
- **Browse by kind panel:** list rows with a small cloth swatch per kind, 58–60px rows.
- **Books strip:** cover, title, publisher line, खरीदें stamp button.
- **About teaser:** photo, short bio, "पूरा परिचय पढ़ें".
- **Footer:** ink background, name, nav, contact, copyright.
- **Focus:** 3px ink outline, 3px offset, on every link, button and field.

## Catalog page (रचनाएँ)

Order on the page: title + intro line → search → kind chips → (phone: "और फ़िल्टर" button + panel / desktop: sidebar) → active-filter chips → results header → results → pagination.

- **Header search is not shown on this page**; the page's own search replaces it. Header search on other pages sends readers here with `?q=`.
- **Search field:** visible label "नाम या किसी शब्द से खोजें", placeholder "जैसे: बारिश की रात", magnifier icon inside left, ✕ clear button inside right when filled. Filters as the reader types. 56px tall.
- **Voice button "बोलें":** mic icon + text, beside the field, same height. While listening it turns walnut, reads "रोकें", and a status line shows a turmeric dot and "सुन रहे हैं… रचना का नाम बोलिए". Recognised text fills the field live. Messages (aria-live):
  - unsupported: "इस ब्राउज़र में बोलकर खोजने की सुविधा नहीं है। कृपया नाम टाइप करें।"
  - permission denied: "माइक की अनुमति नहीं मिली। ब्राउज़र में माइक की अनुमति दें, या नाम टाइप करें।"
  - not understood: "आवाज़ साफ़ समझ नहीं आई। फिर से "बोलें" दबाकर कोशिश करें।"
- **Kind chips:** सभी / कहानी / कविता / उपन्यास; toggle buttons (`aria-pressed`). Selected = walnut fill + tick icon. 46px tall, pill shape. "सभी" clears kind.
- **Filter groups** (checkbox rows with counts, 46–48px): आपकी सूची (सिर्फ़ सहेजी हुई), कैसे उपलब्ध है (पढ़ने के लिए / सुनने के लिए (ऑडियोबुक) / छपी किताब), विषय, कहाँ मिलेगी.
  - Desktop: left sidebar, always open, raised paper; "सभी फ़िल्टर हटाएँ" link when any are active.
  - Phone: full-width "और फ़िल्टर (n चुने गए)" button with chevron (`aria-expanded`) opening the panel inline below it; panel ends with a walnut "n रचनाएँ दिखाएँ" button (closes it) and "सभी फ़िल्टर हटाएँ".
- **Active-filter chips:** one per active filter incl. "खोज: …" and "सहेजी हुई", each with ✕, removes just that filter.
- **Results header:** live count ("34 रचनाएँ" or "34 में से 3 रचनाएँ"), "एक पृष्ठ पर" select (10/25/50/100), "क्रम" select (नई पहले / पुरानी पहले / नाम से), heavy 2px ink rule beneath.
- **Result row:** small cloth thumbnail (64×96 desktop, 44×66 phone) → title (Tiro, with dotted leader to date on desktop) → kind detail + genres → one-line description → action pills (पढ़ें/सुनें/खरीदें) + context ("इसमें भी शामिल: …", "धारावाहिक उपन्यास: …", "किताब के रूप में भी: …") → **save button** on the right.
- **Save button:** bookmark icon + "सहेजें"; when saved, walnut fill, filled icon, "सहेजी गई" (`aria-pressed`). 44px.
- **Pagination:** desktop = पिछला, page numbers (current in walnut, gaps as "…": first, last, current ±1), अगला; phone = पिछला · "पृष्ठ 2 / 4" · अगला. Buttons 48–52px; disabled ends at 45% opacity. Line beneath: "कुल 34 में से 11–20 दिखाई जा रही हैं".
- **Empty state:** raised-paper panel, open-book line icon, "कोई रचना नहीं मिली", guidance text, walnut "सभी फ़िल्टर हटाएँ" button. When only the saved filter is on and nothing is saved: "आपने अभी तक कोई रचना नहीं सहेजी है। किसी भी रचना के साथ "सहेजें" दबाएँ, वह यहाँ और मुखपृष्ठ पर दिखेगी।"

## Shared page elements (all inner pages)

- **Header:** same as home. On phone: name, 4-tab row, then a labelled search field + "खोजें" button. On desktop: inline nav + search. Header search submits to the catalog with `?q=`. The current section has the turmeric underline (work pages count as रचनाएँ, book pages as पुस्तकें).
- **Breadcrumb:** "रचनाएँ › कहानियाँ › <title>" on desktop. On phone the last item is dropped, and book pages show a single "‹ सभी पुस्तकें" back link. Links are 44px tall.
- **Raised side panels** (paper-raised, 1px line border, 8px radius) hold secondary blocks: series parts, "इसमें भी शामिल", awards, contributors, contact.
- **Big cover** (cloth fallback): 280–300px wide on desktop, 190–200px centred on phone.

## Work page (रचना)

Order: breadcrumb → cover + header block → (desktop: synopsis/excerpt left, side column right; phone: everything stacked).

- **Header block:** kind line with a cloth swatch ("कहानी", "उपन्यास, धारावाहिक का भाग 1", "कहानी, छपी किताब के रूप में भी"), title (Tiro, 58px desktop / 40px phone), "पहली बार प्रकाशित: <month year>", genre chips (44px, link to the filtered catalog).
- **Series part note:** for parts, a raised strip: "यह <series> का भाग 1 है। पूरे धारावाहिक में 2 भाग हैं।"
- **Releases:** heading adapts ("कहाँ पढ़ें" / "कहाँ पढ़ें या सुनें" / "कहाँ पढ़ें, सुनें या खरीदें"). One stamp button per release, min-width 250px desktop / full width phone, with a plain detail line (desktop beside it, phone below it): "प्रतिलिपि पर ऑनलाइन", "ऑडियो कहानी, वाचक: …", "छपी किताब, <publisher>", "Kindle ई-बुक", "प्रतिलिपि पर, 18 अध्याय", "पूरे धारावाहिक का ऑडियोबुक, वाचक: …". Inherited series audiobooks show on parts.
- **Action row:** सहेजें (same component as the catalog), "WhatsApp पर भेजें" (link to `https://wa.me/?text=<title>, नीतू की रचना: <url>`), "लिंक कॉपी करें" (clipboard; label changes to "लिंक कॉपी हो गया" for 2.5s, announced via aria-live). Phone: save + WhatsApp side by side, copy-link full width below.
- **"<kind> के बारे में":** synopsis in Tiro 22px / 20px, line-height 1.9.
- **"एक अंश":** raised panel with a large turmeric opening quote mark, excerpt in Tiro with preserved line breaks, caption "पूरी रचना पढ़ने के लिए ऊपर दिए गए बटन देखें।" Hidden if there is no excerpt.
- **Side column (desktop) / after excerpt (phone):**
  - **"<series> के भाग":** ordered list; the current part is bold with "आप यहाँ हैं" (not a link); others link with a chevron; walnut "अगला भाग पढ़ें" button (hidden on the last part).
  - **"इसमें भी शामिल":** small cloth thumbnail, book title, "साझा संकलन, नीतू और 27 अन्य लेखक" etc. Links to the book page.
  - **"इसी तरह की और रचनाएँ":** 3 works sharing a genre (title + "कहानी, पारिवारिक") and "सभी रचनाएँ देखें".

## Books list page (पुस्तकें)

The पुस्तकें tab. Lists every series, collection and anthology (`kind` in series / collection / anthology), plus single works that have a `print` release.

- Title "पुस्तकें" + one-line intro.
- **Jump links:** pill links to each group with a cloth swatch and count ("नीतू की पुस्तकें 3"), 46px. A group with no books is not shown.
- **Groups**, each with a Tiro heading + short note on one line, over a 2px ink rule:
  1. **नीतू की पुस्तकें** ("उनकी अपनी छपी किताबें"): her own collections and single-story books
  2. **साझा संकलन** ("दूसरे लेखकों के साथ छपी किताबें"): anthologies
  3. **धारावाहिक उपन्यास** ("कई भागों में लिखे उपन्यास"): series
- **Desktop:** cover grid (`repeat(auto-fill, minmax(230px, 1fr))`, gap 44/36px). Each card: 180px cloth cover (anthology covers show "संपादक: …" as byline) → title (Tiro 25px, link) → detail line ("कविता संग्रह, <publisher>, <year>" / "नीतू और 27 अन्य लेखक, <year>" / "2 भाग, पूरा ऑडियोबुक भी") → one stamp button for its main release (खरीदें · Amazon, or सुनें · Kuku FM for a series with an audiobook).
- **Phone:** one book per row: 96px thumbnail + title / kind / detail beside it, then a full-width stamp (54px) under each, like the home page's books strip. Two covers per row was rejected: the stamp doesn't fit.
- The cover and title both link to the book page; the cover link is hidden from screen readers to avoid duplicate links.
- Footer note: "ऑनलाइन कहानियाँ और कविताएँ रचनाएँ पेज पर हैं।"

## Book page (पुस्तक / धारावाहिक): series, collection, anthology

- **Header:** large cover (anthology byline on the cover: "संपादक: <name>"), kind line, title (60px / 42px), then a **facts list** (`<dl>`, label column in ink-soft):
  - series: भाग, पहला भाग, दूसरा भाग, विषय
  - collection: प्रकाशक, प्रकाशन वर्ष, कविताएँ (count), ISBN
  - anthology: संपादक, लेखक ("नीतू और 27 अन्य"), प्रकाशक, प्रकाशन वर्ष
- **Whole-book releases:** same stamp buttons ("पूरा धारावाहिक सुनें" / "कहाँ खरीदें"). Series also get a secondary button "भाग 1 से पढ़ना शुरू करें".
- **Synopsis** in Tiro, under the releases.
- **Contents:** heading "भाग" / "इस संग्रह की कविताएँ" / "इस संकलन में नीतू की रचना", a one-line note ("बाक़ी कविताएँ सिर्फ़ किताब में हैं।"), then an ordered list under a 2px ink rule. Each item: number in walnut Tiro ("भाग 1", "1", or none for anthologies), title link, detail line, one-line description, action pills.
- **Anthology contributors:** raised panel "इस संकलन के लेखक" with "संपादक: <name>", then chips: **नीतू** (walnut fill), up to **3 featured co-authors** (paper chips), then a **dashed "और 24 अन्य लेखक"** chip. Note: "इस वेबसाइट पर सिर्फ़ नीतू की रचनाएँ दी गई हैं। बाक़ी रचनाएँ पढ़ने के लिए पुस्तक देखें।" Hidden for series and collections.

## About page (परिचय)

- **Intro:** her photo as a slightly rotated (−1.5°) print on a cream mount with her name handwritten-style below (Tiro), name in 72px / 52px Tiro, "हिंदी कहानीकार और कवयित्री", short bio in Tiro, buttons "उनकी रचनाएँ पढ़ें" (walnut) and "संपर्क करें" (outline, jumps to contact).
- Ornament divider.
- **"लेखन का सफ़र":** 2–3 paragraphs (from `author_profile.bio_hi`).
- **Quote:** large turmeric quote mark, her words in Tiro 30px / 24px, caption "नीतू". Hidden if empty.
- **"प्रमुख सम्मान":** 3–4 featured awards (name bold, "संस्था, वर्ष" below). Then a native `<details>` disclosure **"और सम्मान देखें (n)"** (54px, walnut text, chevron rotates when open) listing the rest grouped by year (year subheading, one line each: "सम्मान, संस्था"). Hidden if there are no non-featured awards.
- **"उन्हें कहाँ पढ़ें और सुनें":** 64px rows: platform logo, name, one-line description, external-link arrow.
- **"संपर्क":** raised panel: purpose line, walnut email button, social links.

## Behaviour rules

- Nothing moves on its own (carousel is tap-only).
- Numbers use regular digits (1, 2, 3) for now; switching to Devanagari digits is an open decision.
- Voice search: browser Speech Recognition, `hi-IN`; in Chrome the audio goes to Google's speech service. Mention it on the privacy note.
- Saved list: browser `localStorage`, this device only; the UI says so wherever it's shown.

## Open items

- Real photo, bio, quote, awards, publisher/narrator/editor names, dates, email, social links
- Devanagari vs regular digits
- Ideas not yet taken: reading time per work, sticky filter/count bar on phone for long lists, "क्या आप यह खोज रहे थे?" suggestions on empty search, site-wide text-size control
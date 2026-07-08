# Cheddar — cheddarcam.com

Marketing + compliance site for **Cheddar**, a kids' camera app (ages 3–6).
Plain static HTML/CSS/vanilla JS. **No build step. No framework. No trackers.**

```
.
├── index.html          # Home: hero, walkthrough carousel, feature cards,
│                       #       Safety, photo band, Cheddar Says voices,
│                       #       testimonials, FAQ CTA, footer
├── faq.html            # Accordion FAQ (native <details>, no JS needed)
├── privacy.html        # Plain-language, COPPA-aware privacy policy
├── contact.html        # mailto contact card
├── css/styles.css      # The whole design system ("Painted Toy" palette)
├── js/main.js          # Progressive enhancement (audio, carousel, reveals)
├── fonts/              # Self-hosted Nunito (variable woff2, latin + latin-ext)
├── assets/img/         # Icon (png + webp, several sizes), favicon, OG image
├── assets/voices/      # 10 character voice-preview clips (.m4a) from the app
├── _headers            # Cloudflare Pages security + cache headers
├── robots.txt, sitemap.xml
```

Design direction pulls from **Adobe Aqua** (playful kid-brand warmth) and
**Optimizely** (bold section stacking, big type). Key mechanics:

- **Floating header** — a logo pill on the left + a nav-cluster pill on the right
  (Features · Safety · Testimonials · FAQ + store badges), floating over the hero.
- **Stacked "sheet" sections** — full-width panels with **rounded top corners
  only**, each sliding up over the previous with a soft top shadow. Section
  backgrounds do the color-blocking (no white gaps between them).
- **Bold color blocking** — yellow hero, solid **Gallery-Blue Safety** band, solid
  **Timer-Purple FAQ** band, with lighter tinted sections between.
- **CSS camera-UI hero** — a hand-built phone showing Cheddar's camera screen
  (shutter + colored toy buttons) with floating sticker buttons and sparkles. No
  image asset needed; it's all CSS.

## Local preview

No build needed. Any static server works:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

(Open via a server, not `file://` — the self-hosted fonts and audio need HTTP.)

## Deploy — Cloudflare Pages

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `/`** (the repo root is the site).
4. After the first deploy, **Custom domains → Set up `cheddarcam.com`**. DNS is
   already on Cloudflare, so it's one click.

### Support email (contact page)

The contact page links `mailto:support@cheddarcam.com`. Set up free
**Cloudflare Email Routing** (dashboard → Email → Email Routing) to forward that
address to Ian's real inbox. If you'd rather not, change the address in
`contact.html` to a real inbox.

## What's left to do (manual, by Ian)

### 1. App screenshots  ← DONE (real screenshots wired in)

Real app screenshots now live in **`assets/screenshots/`** (optimized WebP,
~30–45KB each, source PNGs came from the app repo's `assets/Screenshots/`). They
appear in the hero phone (`camera.webp`), the four walkthrough carousel slides
(`camera`, `gallery`, `cheddar-says`, `settings`), and the download section's
phone (`say-cheese.webp`). To refresh one, drop a new WebP at the same path (or
re-run the resize+`cwebp` step). `photo-detail.webp` is included but unused —
available if you want another slide. The CSS app-screen mockups remain as the
fallback if a screenshot ever fails to load.

### 1b. The full-width lifestyle photo ("Happiest in little hands")

That full-bleed band shows a gradient placeholder until you add a real photo of a
kid using the app. Save it as **`assets/img/kid-using-app.jpg`** and it becomes the
band's background automatically (JS probes for it; a legibility scrim is applied).
**Privacy:** shoot it specifically for the site — no other child's identifiable
face; toys/objects or your own kid with consent.

### 2. Real testimonials (placeholders in place)

The "Parents and kids love it!" section currently uses **sample quotes** with
monogram avatars (M / J / P on colored circles). Replace the three `<blockquote>`
texts and `.testi-name` lines in `index.html` with real ones before launch. To
use a real photo instead of a monogram, put an `<img>` inside `.testi-avatar`.

### 3. Real "Cheddar Says" & "Story" demo audio (optional, delightful)

The voice section has two locked ContentCards ("Demo coming soon"). To light them
up, save web-playable audio (e.g. `.m4a`/`.mp3`) and, on each `.content-card`,
add `data-audio="assets/voices/…"`, remove `is-locked`, and remove `disabled`
from its `.cc-play` button:

```html
<div class="content-card accent-purple" data-audio="assets/voices/cheddar-says-demo.m4a">
  <button class="cc-play" type="button" aria-label="Play Cheddar Says demo"> … </button>
```

**Privacy:** record demo content specifically for the site (Ian narrating; photos
of toys/objects). Do not publish a real child's voice or identifiable photos.

### 4. Go-live: the Play Store link

When the Play Store listing is live, paste the URL into `PLAY_STORE_URL` at the
top of `js/main.js`. Every "Get it on Google Play" button/badge updates from that
one line. Until then the buttons are intentionally inert. (The iOS App Store badge
shows "Coming soon.")

## Design system

The app's **"Painted Toy"** palette, radii, and motion live as CSS custom
properties atop `css/styles.css` — Shutter `#FFD54A`, Gallery `#3E9BD1`, Settings
`#EE9A17`, Flip `#2CB283`, Timer `#7A67D9`, Delete `#E45B4E`, Favorite `#F06BA3`.
Accent theming uses `.accent-*` utility classes (no inline styles, so the strict
CSP needs no `unsafe-inline`). Buttons are the app's "ToyButtons" (chunky pill
with a solid darker bottom edge that presses down on click). Store badges are
self-hosted inline SVG (no third-party embeds). All decorative motion — the hero
icon bob, cheese-hole float, reveals, carousel smooth-scroll — is disabled under
`prefers-reduced-motion`, and the whole site is readable with JS off.

## Notes on the carousel

The feature carousel is a native horizontal scroll-snap track inside the phone
frame: touch/trackpad swipe drives it, and arrows, dots, and arrow keys enhance
it. JS keeps the caption (title/description/accent) and active dot in sync with
the centered slide. With JS off, the first slide's caption shows and the track is
still swipeable.

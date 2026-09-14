# Cheddar — "Warm Camera" color palette

The shared brand palette for **cheddarcam.com** and the **Cheddar app**. A warm,
retro-camera identity: yellow + midnight navy + cream + caramel, with two accent
"poppers" — sea-glass teal and coral. This is the complete system; don't add hues.

Adopted 2026-09-11 (supersedes the earlier blue "Poster" palette). On the website
these live as CSS custom properties in `css/styles.css` `:root` (token names kept
from the old system for cascade — see the mapping notes below).

## Core palette

| Color | Hex | Role |
|---|---|---|
| Cheddar yellow | `#FFCB33` | Main brand / hero ground / the shutter / highlights |
| Indigo navy | `#243C6C` | Dominant dark ground, primary buttons, camera body, strong text (matched to the logo) |
| Deeper navy | `#1A2B52` | Pressed/bottom edge under navy, depth, deepest shadow |
| Warm cream | `#FFF0CE` | Light grounds, cards on dark, lens ring |
| Peach | `#FCE4CC` | Soft warm light accent / panel (from the logo's lens ring) |
| Caramel brown | `#986747` | Warm supporting accent (small doses) |
| Sea-glass teal | `#2BAF9E` | **Pop #1 (cool)** — "calm" cues: privacy / on-device, secondary actions |
| Deep teal | `#15736A` | Teal for surfaces carrying **white text** (bright teal fails contrast) |
| Coral | `#E56A4F` | **Pop #2 (warm)** — "lively" cues: record, highlights, "new", attention |

## Supporting / text

| Color | Hex | Role |
|---|---|---|
| Ink (near-black) | `#20283A` | Primary text + icon strokes on light grounds |
| Ink-soft | `#5F6472` | Secondary / muted text (AA on cream & white) |
| Gold (yellow-deep) | `#E5A81C` | Pressed edge under the yellow button / cheese-hole shadows |
| Splash (light yellow) | `#FFDB63` | Lighter yellow highlight / hero glow |

## Soft tints (pastel panels / chips on light UI)

| Tint | Hex |
|---|---|
| Cream tint | `#FFF4DD` |
| Navy tint | `#E8ECF4` |
| Teal tint | `#DCF1EE` |
| Coral tint | `#FBE7DF` |
| Yellow tint | `#FFF3CC` |

## Usage rules

- **Primary action** (main buttons / CTAs): midnight-navy face, deeper-navy bottom
  edge, white text. Navy pops hardest on yellow — keep the primary button navy, not
  a popper. Website button shape: flat chunky rounded rectangle (radius ~14px),
  solid face, hard bottom edge, no domed sheen.
- **The shutter** stays Cheddar yellow (its signature).
- **Backgrounds:** yellow is the brand ground; cream/white for light surfaces; navy
  (and deep teal) for dark "moment" surfaces. Alternate light/dark; don't stack
  multiple dark surfaces.
- **Text contrast:** Ink on light grounds; white on navy / deep-teal; Ink-soft for
  secondary. **Never** put white text on bright teal `#2BAF9E` — use deep teal
  `#15736A` when a teal surface needs white text. Bright teal is for accents, tints,
  and dark-text surfaces only.
- **The two poppers have jobs** (keep them distinct so neither gets noisy):
  - **Teal** = calm / trust / secondary (privacy & on-device messaging, secondary
    buttons, "safe / parent" affordances).
  - **Coral** = lively / attention (record indicator, "new" badges, playful
    highlights, Photo Hunt accents).
- **Semantic states** (success / warning / error) are separate from the accents;
  derive harmonizing versions rather than adding unrelated hues.

## Website band rhythm ("navy-anchored", chosen 2026-09-12)

hero **yellow** → features **peach** → voices **navy** → stories **coral-tint** →
Photo Hunt **deep teal `#15736A`** → "so simple" **peach** → for-parents **navy** →
more tricks **peach** → download **yellow** → footer **navy `#243C6C`**.

## CSS token mapping (website)

The old token *names* were kept when the values were remapped, so a few names no
longer match their color:

| Token | Value | Note |
|---|---|---|
| `--yellow` | `#FFCB33` | |
| `--sky` | `#243C6C` | now **navy** (still named `--sky`); drives `--btn-primary` |
| `--navy` | `#1A2B52` | deeper navy edge |
| `--cream` | `#FFF0CE` | |
| `--cocoa` / `--orange` | `#986747` | caramel |
| `--mint` | `#2BAF9E` | sea-glass teal |
| `--coral` / `--pink` | `#E56A4F` | coral |
| `--purple` | `#243C6C` | → navy |
| `--ink` | `#20283A` | |

`.band--green` is overridden to deep teal `#15736A` for white-text contrast.

## Jetpack Compose values (app)

```kotlin
val CheddarYellow  = Color(0xFFFFCB33)
val IndigoNavy     = Color(0xFF243C6C)
val NavyDeep       = Color(0xFF1A2B52)
val WarmCream      = Color(0xFFFFF0CE)
val Peach          = Color(0xFFFCE4CC)
val Caramel        = Color(0xFF986747)
val SeaGlassTeal   = Color(0xFF2BAF9E)
val DeepTeal       = Color(0xFF15736A)
val Coral          = Color(0xFFE56A4F)
val Ink            = Color(0xFF20283A)
val InkSoft        = Color(0xFF5F6472)
val Gold           = Color(0xFFE9B91E)
val Splash         = Color(0xFFFFE27A)
```

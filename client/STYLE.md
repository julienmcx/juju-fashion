# Juju · Design System (web app)

Ce document est la **source de vérité** esthétique de l'app web. Objectif : aligner
l'app sur la **landing** (`/landing/index.html`) — élégante, haut de gamme, joyeuse.

> Règle d'or : on **ne touche jamais** à la logique (state, appels API, routing,
> hooks). On ne change que la **présentation**. Toute page réutilise les primitives
> de `src/components/ui/`.

---

## 1. Typographie

| Usage | Police | Détail |
|---|---|---|
| Titres / display (`font-display`) | **Fraunces** | poids 500, `line-height 1.1`, `letter-spacing -0.025em`, `font-variation-settings: "SOFT" 50, "WONK" 0` |
| Accent italique | **Fraunces italic** | classe `.accent-italic` → dégradé doré→violet, `"SOFT" 100, "WONK" 1` |
| Corps de texte (`font-sans`) | **Plus Jakarta Sans** | 400 / 500 / 600 / 700 |
| Petits labels majuscules | Plus Jakarta Sans | via `<Eyebrow>` ou `<SectionLabel>` — **jamais** Fraunces |

Les balises `h1, h2, h3` sont en Fraunces par défaut (couche `base`). Pour un petit
label majuscule, utiliser `<SectionLabel>` (ou `<Eyebrow>`), pas un `hN`.

Échelle indicative : `h1` clamp(2.25→3.5rem), titres de page `text-3xl/4xl`,
titres de carte `text-lg/xl`.

## 2. Couleurs (tokens Tailwind `juju-*`)

**Clair (thème par défaut, signature de la marque)**
- `juju-light-bg` #FAFAFE · `juju-light-card` #FFFFFF · `juju-light-bordure` #E8E5F0
- `juju-light-texte` #0F0820 · `juju-light-texte-mute` #6B5B8A

**Sombre (toggle, soigné)**
- `juju-noir` #0A0A0F · `juju-bleu` #0F1538 · `juju-bleu-clair` #1A2155
- `juju-bordure` #2A2F5C · `juju-texte` #F5F0E8 · `juju-texte-mute` #A19FB0

**Accents**
- Violet (action principale) : `juju-violet` #7C3AED · `juju-violet-dark` #9333EA · `juju-violet-deep` #6D28D9
- Doré (accent de luxe) : `juju-dore` #D4AF37 · `juju-dore-clair` #E5C158

**Rôles**
- **Violet = action n°1** (boutons primaires en dégradé, liens d'action, focus).
- **Doré = accent** : états actifs (nav), chiffres clés, étoile du logo, survols, détails premium.
- Sur fond **sombre**, l'eyebrow et certains accents passent au **doré**.

## 3. Boutons — `<Button>`

| variant | rendu |
|---|---|
| `primary` (défaut) | dégradé violet `135deg #7C3AED→#9333EA`, texte blanc, `shadow-violet`, hover `translateY(-3px)` + `shadow-violet-lg` |
| `secondary` | bord 1.5px, fond carte, hover bord+texte violet, `translateY(-2px)` |
| `gold` | dégradé doré, texte noir (accent fort, rare) |
| `ghost` | transparent, texte mute → texte plein au hover |
| `danger` | rouge, pour suppressions |

Props : `variant`, `size` (`sm`/`md`/`lg`), `as` (`button`|`a`|`Link`), `to`/`href`,
`icon`, `iconRight`, `loading`, `fullWidth`. Toujours `rounded-full`, transition
`ease-bounce`.

## 4. Cartes — `<Card>`

- `rounded-2xl` (20px), fond carte, bord `juju-light-bordure`/`juju-bordure`, `shadow-card`.
- `hover` (booléen) → `translateY(-6px)` + bord doré/violet + `shadow-card-hover`.
- Espacement interne généreux (`p-5`/`p-6`).

## 5. Eyebrow & en-têtes

- `<Eyebrow>✦ Texte</Eyebrow>` : 0.7rem, `uppercase`, `tracking-[0.18em]`, violet (doré sur sombre), 700, étoile dorée.
- `<PageHeader eyebrow="…" title="…" subtitle="…" actions={…} />` : en-tête standard de page
  (eyebrow + titre Fraunces + sous-titre + zone d'actions à droite).
- `<SectionLabel>` : petit label de section majuscule (remplace les anciens `h2.text-xs.uppercase`).

## 6. Fonds & ambiance

- Le `Layout` applique un fond avec **dégradés radiaux subtils** (doré en haut à droite,
  violet en bas à gauche) via `.app-bg`. Blobs animés `drift` (désactivés si `prefers-reduced-motion`).
- Champs de formulaire : voir `<Input>`, `<Select>`, `<Textarea>` (focus → anneau violet).

## 7. Animations

- **Apparition au scroll** : `<Reveal>` (IntersectionObserver) → `.fade-in`/`.visible`
  (opacity + `translateY(24px)`, 0.8s `cubic-bezier(.4,0,.2,1)`).
- **Hover** cartes/boutons : translateY + ombre colorée.
- Toujours respecter `prefers-reduced-motion` (déjà géré globalement dans `index.css`).

## 8. Responsive / mobile (priorité absolue)

- Mobile-first. La `BottomTabBar` (5 onglets) sur mobile, la `Sidebar` dès `md`.
- Conteneurs : `px-4 py-6 md:px-8 md:py-10`, largeurs `max-w-*`, grilles
  `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- Cibles tactiles ≥ 44px, `safe-area` en bas (tabbar).
- Tester chaque écran à 375px (mobile), 768px (tablette), 1280px (desktop).

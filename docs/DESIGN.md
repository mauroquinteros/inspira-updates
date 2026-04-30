# Inspira Updates — Design Prompt

Use this prompt to generate UI designs for the Inspira Updates product: a WhatsApp message scheduling platform for businesses. All copy is in Spanish. The visual language is dark, premium, and minimal.

## Brand Identity

### Logo
A 44×44px rounded square (border-radius ~20px) with a gradient background. Inside: a white `MessagesSquare` icon (Lucide icon, ~20px). Keep this logo exactly as described in all screens.

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| Turquoise | `#2ae5dc` | Primary accent, active states, icons |
| Blue | `#0f3994` | Mid-gradient, secondary accents |
| Purple | `#4740ff` | Gradient end, highlights |
| Green | `#14e478` | Success states, "connected" |
| Orange | `#fe924b` | Warnings, errors, failed states |
| Dark Background | `#040535` | Page background |
| Card Background | `oklch(0.23 0.04 273)` ≈ `#1a1a3e` | Card surfaces |

**Logo gradient**: `from-[#2ae5dc] via-[#0f3994] to-[#4740ff]` (top-left to bottom-right)

**Page background**: Dark deep-navy (`#040535`) with subtle radial glows — purple top-left, cyan top-right, teal bottom-center.

### Typography
- Font: Avenir Next / Segoe UI / Helvetica Neue (system sans-serif fallback)
- Headings: semibold or bold
- Body: regular weight, high contrast on dark backgrounds
- UI labels: medium weight, slightly muted

### Tone
Professional, calm, clarity-first. Spanish UI copy throughout. Short sentences, active voice.

## Global App Shell — Header Navigation

**Replace the sidebar with a sticky top header.** Structure:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Inspira Updates  │  Inicio · Grupos · Program.  │  [user@email] [Salir]
└─────────────────────────────────────────────────────────┘
```

- **Left**: Logo + product name "Inspira Updates"
- **Center** (or right of logo): Navigation links — `Inicio`, `Grupos`, `Programación`, `Historial`
- **Right**: User email (small, muted) + "Salir" button (ghost style)
- Active link indicator: a bottom border or small pill in turquoise (`#2ae5dc`)
- Background: near-transparent dark with `backdrop-blur`, border-bottom subtle
- Height: ~60px
- Mobile: hamburger icon that reveals a dropdown or bottom sheet with nav links

## Screen 1 — Landing Page (`/`)

A clean marketing page for visitors who are not logged in.

### Layout (single column, centered, max-width ~1100px)

**1. Header bar** (same sticky header but with "Iniciar sesión" button on right instead of user info)

**2. Hero section**
- Large heading (2–3 lines): "Programa tus anuncios en WhatsApp con claridad y control"
- Subheading (1–2 lines, muted): "Conecta tu número, organiza tus grupos y programa mensajes con contexto completo."
- Two CTA buttons: primary "Iniciar sesión" (turquoise fill) + secondary "Ver cómo funciona" (ghost/outline)
- No dashboard mockup preview — keep it clean and focused

**3. Three feature cards** (horizontal row on desktop, stacked on mobile)
- Card 1: Smartphone icon — "Conexión guiada" — "Vincula tu WhatsApp en segundos con un código QR."
- Card 2: Clock icon — "Programación clara" — "Define grupo, mensaje y fecha. Sin pasos innecesarios."
- Card 3: ShieldCheck icon — "Historial confiable" — "Consulta cada envío con su estado y detalle."
- Cards: dark surface, subtle border, icon in turquoise, heading white, description muted

**4. Simple footer**: "© 2025 Inspira Tech · Todos los derechos reservados"

## Screen 2 — Inicio (Home + Connection merged) (`/inicio`)

This is the first screen after login. It combines the connection status and the key stats into one focused view. **No hero banner, no excessive cards.**

### Layout

**Top section — Connection Status (full-width card)**

```
┌───────────────────────────────────────────────────────────┐
│  [Status badge: Conectado ✓ / Desconectado ✗]            │
│                                                           │
│  IF CONNECTED:                                            │
│    Large green checkmark icon + "Sesión activa"          │
│    Small text: "Tu número está listo para enviar."       │
│    Button: "Programar mensaje →" (primary)               │
│                                                           │
│  IF DISCONNECTED:                                         │
│    QR code (280×280px) centered                          │
│    Helper: "Abre WhatsApp → Dispositivos vinculados →    │
│             Vincular dispositivo → Escanear QR"          │
│    Button: "Actualizar QR" (ghost)                       │
└───────────────────────────────────────────────────────────┘
```

- The QR and connected state share the same card — they toggle based on session state
- Status badge colors: green (`#14e478`) for connected, orange (`#fe924b`) for disconnected, turquoise for connecting

**Bottom section — Three stat cards** (3 columns on desktop, stacked on mobile)

| Card | Icon | Value | Label |
|------|------|-------|-------|
| Grupos activos | UsersRound | e.g. "4" | "grupos guardados" |
| Mensajes programados | CalendarClock | e.g. "2" | "en cola" |
| Próximo envío | Clock | e.g. "mañana 09:00" | "próximo mensaje" |

- Each card: dark surface, icon in turquoise, large bold number, small muted label below
- No "alerts" card — keep it to three

## Screen 3 — Grupos (`/groups`)

Manage the list of WhatsApp groups to send messages to.

### Layout

**Header row** (between app header and content)
- Left: "Grupos" title + "Mantén tus destinos listos" subtitle
- Right: "Agregar grupo" button (primary, + icon)

**Groups table card** (full-width)
- Table columns: Nombre | Identificador (hidden on mobile) | Estado | Acciones
- Estado badge: "Activo" (turquoise tint) / "Pausado" (muted gray)
- Actions: toggle active/paused + delete (with confirmation)
- Empty state: centered illustration + "Aún no guardaste grupos" + "Agregar grupo" CTA

**Add Group modal (Dialog)**
- Title: "Agregar grupo de WhatsApp"
- Search input to filter available groups
- List of groups fetched from WhatsApp connection (each row: group name + "Guardar" button)
- Error state if WhatsApp is not connected: orange alert with link to /inicio

## Screen 4 — Programación (`/schedule`)

Create and manage scheduled messages.

### Layout (two columns on desktop, stacked on mobile)

**Left column — "Crear envío"**
- Card with form:
  - Group select dropdown (label: "Grupo de destino")
  - Message textarea (label: "Contenido del mensaje")
  - Date + time input (label: "Fecha y hora de envío")
  - Submit button: "Programar envío" (full-width, primary)
  - Error state if no active groups: alert with link to /groups

**Right column — "Cola de programación"**
- Card listing pending and past messages
- Each item: group name (small label, uppercase) · message preview (2-line clamp) · timestamp · status badge · cancel button (if scheduled)
- Status badge colors:
  - Programado: turquoise tint
  - Enviado: green tint
  - Falló: orange tint
  - Cancelado: muted gray
- Empty state: "Aún no tienes mensajes programados"

## Screen 5 — Historial (`/history`)

View the full send history with filtering.

### Layout

**Filter bar** (above the table)
- Five pill buttons: "Todos" · "Programados" · "Enviados" · "Con fallos" · "Cancelados"
- Active filter: turquoise border + background tint

**History table** (full-width card)
- Columns: Grupo | Mensaje (preview) | Programado para | Enviado a las | Estado
- Failed rows are clickable — opens a detail modal showing error message + response payload
- Empty state per filter: e.g. "No hay mensajes fallidos"
- Pagination or infinite scroll for large datasets

## Shared Patterns

### Status Badges
```
Activo / Enviado / Conectado:   green tint   (#14e478 / 12% opacity background)
Programado / Conectando:        cyan tint    (#2ae5dc / 12% opacity background)
Falló / Desconectado:           orange tint  (#fe924b / 12% opacity background)
Cancelado / Pausado:            neutral gray (white / 6% opacity background)
```

### Cards
- Background: dark surface (~`#1a1a3e`) with subtle border (white 8% opacity)
- Border-radius: 16px
- Padding: 24px
- No heavy shadows — rely on background contrast

### Buttons
- Primary: turquoise background (`#2ae5dc`), dark text, rounded
- Ghost/outline: transparent background, white border with opacity, white text
- Destructive: orange tint background, orange text

### Empty States
- Centered icon (muted, larger size)
- Short label: what's missing
- CTA button if actionable

### Mobile
- Header collapses to logo + hamburger
- Tables scroll horizontally
- Two-column layouts stack to single column
- Stat cards stack 1-per-row on small screens

## What to Avoid

- No sidebar navigation (replaced by top header)
- No hero banners inside authenticated pages
- No more than 3 stat cards on the home screen
- No mixed or redundant pages — session and home are one screen
- No light mode — dark only throughout

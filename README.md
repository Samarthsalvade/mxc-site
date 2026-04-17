# MXC — Dummy Webpage Design

> **This is a demo/portfolio project. MXC is a fictional brand created purely for design and development practice. All products, prices, customer names, and statistics shown are completely made up.**

---

## What This Is

A cinematic, scroll-driven landing page concept built to explore modern web animation techniques. The page is designed around a fictional FiveM asset marketplace called MXC — the brand, content, and data are all placeholder/dummy material.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, animations, transitions) |
| 3D Rendering | Three.js r160 (ES modules via import map) |
| 3D Model | McLaren MP4/5 Formula 1 — GLB format |
| Icons | Lucide Icons (CDN) |
| Fonts | Bebas Neue + Syne (Google Fonts) |
| Hosting | Vercel |
| Version Control | Git / GitHub |

---

## Features

### 3D Car
- Real GLB model rendered with Three.js WebGL
- Cinematic scroll-driven camera with 12 keyframes — front wing, cockpit overhead, rear diffuser, exhaust close-up and more
- Click and drag to freely orbit the car
- Mouse parallax tilt
- Rev + flame particle system at page bottom
- ACЕС Filmic tone mapping with PCF soft shadows

### Scroll Animations
- Apple-style sticky word reveal — words light up one by one as you scroll
- IntersectionObserver-based staggered card reveals
- Animated counters on hero stats

### Theme Toggle
- Dark mode (default): deep navy, cyan accent
- Light mode: warm cream, orange-red accent
- Transition sequence: tire spins → car lighting flips mid-spin → page wipe reveals new theme
- Saved to localStorage

### Text Effects
- RAF-based character scramble on heading hover — smooth left-to-right resolve
- Magnetic pull on headings following the cursor
- Custom cursor with lag-lerp ring

### Other
- Live purchases ticker (marquee)
- Product card marquee (hover to pause)
- Animated showcase modal with stat bars and highlight cards
- Lucide SVG icons throughout
- Grain texture overlay
- Responsive layout

---

## Project Structure

```
mxc-site/
├── index.html          # Main page
├── mclaren.glb         # 3D car model (not in repo — add manually) from sketchfab
├── css/
│   ├── reset.css       # Base reset
│   ├── main.css        # All page styles + light theme
│   └── modal.css       # Showcase modal styles
└── js/
    ├── car.js          # Three.js 3D car, camera, flames
    ├── cursor.js       # Custom cursor with lerp
    ├── scroll.js       # Scroll reveals, sticky words, nav state
    ├── counter.js      # Animated number counters
    ├── modal.js        # Showcase modal logic
    ├── theme.js        # Theme toggle + wipe animation
    └── textfx.js       # Scramble + magnetic text effects
```

---

## Setup

### Prerequisites
- [VS Code](https://code.visualstudio.com/)
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (for local dev)
- A `mclaren.glb` file placed in the project root (not included in repo due to file size)

### Run locally
```bash
git clone https://github.com/your-username/mxc-site.git
cd mxc-site
# Add mclaren.glb to the root folder
# Right-click index.html in VS Code → Open with Live Server
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys on every push.

---

## Adding the 3D Model

The GLB file is not committed to the repository because of its size (~30MB). To run the project:

1. Download a free F1 car GLB from [Sketchfab](https://sketchfab.com/search?q=formula+1&type=models) (filter: Free + Downloadable)
2. Rename it to `mclaren.glb`
3. Place it in the `mxc-site/` root folder (same level as `index.html`)

---

## Disclaimer

This project is a **design demo only**. It is not affiliated with, endorsed by, or connected to:
- Any real FiveM marketplace or asset store
- Cfx.re or Rockstar Games
- McLaren Automotive
- Any of the customer names or products mentioned on the page

All testimonials, purchase data, product names, and statistics are entirely fictional and created for visual demonstration purposes.

---

## License

Free to use as inspiration or a learning reference. Not for commercial use as-is.

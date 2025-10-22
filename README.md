# MOV Landing Page

An interactive marketing site for MOV that pairs a liquid-glass interface with motion-rich storytelling to showcase the platform’s architecture and performance.

## Live Demo

- GitHub Pages: _coming soon_ (build with `npm run build` and deploy the `dist/` folder)

## Highlights

- **Liquid Glass System** – Shared primitives in `src/components/LiquidGlassUI.jsx` drive the navigation halo, cards, and magnifier overlays with GPU-accelerated gradients and pointer tracking.
- **Animated Storytelling** – Framer Motion sequences hero entrances, feature cards, and stat callouts for smooth section reveals.
- **SDK Preview** – `CodeExample.jsx` renders tabbed TypeScript, Python, and Unity snippets to hint at developer tooling.
- **Accessible Typewriter** – `Typewriter.jsx` supports reduced-motion users and announces updates via ARIA labels.
- **Responsive Layout** – Clamp-based spacing and fluid typography keep the page consistent across desktop, tablet, and mobile.

## Tech Stack

- **React 19** with modern hooks and suspense-ready patterns.
- **Vite** (rolldown build) for rapid iteration and optimized bundles.
- **Framer Motion** for declarative animations.
- **ESLint 9** enforcing React Hooks, Refresh, and project style guides.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm (bundled with Node)

### Installation

```bash
git clone <your-repo-url>
cd mov
npm install
npm run dev
```

Visit `http://localhost:5173` for the dev preview.

## Liquid Glass Architecture

The liquid-glass aesthetic is composed of:

- `LiquidGlassContainer` – wraps each card, computing pointer-driven highlights, sheen layers, and optional magnifier regions.
- `LiquidGlassNavigation` – magnifies the active link using shared state so keyboard focus and pointer movement stay in sync.
- `LiquidGlassStats` and `LiquidGlassCard` – extend the base container with tailored padding, flex layouts, and hover micro-interactions.

These primitives keep glass styling consistent while letting sections such as the System Architecture specs reuse the same magnifier logic.

## Available Scripts

- `npm run dev` – Launch Vite dev server with hot reload.
- `npm run build` – Output production assets to `dist/`.
- `npm run preview` – Serve the build locally for smoke testing.
- `npm run lint` – Run ESLint against the repo.

## Project Structure

```
mov/
├── src/
│   ├── components/
│   │   ├── LiquidGlassUI.jsx   # Liquid glass primitives & magnifier system
│   │   ├── Typewriter.jsx      # Accessible hero typewriter
│   │   └── CodeExample.jsx     # Tabbed SDK snippet showcase
│   ├── App.jsx                 # Landing page sections and motion wiring
│   ├── App.css                 # Section-level styles
│   ├── index.css               # Global styles, glass variables
│   └── main.jsx                # React bootstrap
├── public/                     # Static assets (favicon, hero image)
├── index.html                  # Vite HTML template
└── vite.config.js              # Vite configuration
```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the contents of `dist/` to your target host.
   - **GitHub Pages**: push the `dist/` folder to a `gh-pages` branch or use the GitHub Pages build workflow.
   - **Vercel/Netlify**: connect the repo and set the build command to `npm run build`, output directory `dist`.
   - **Static hosting**: upload the folder to S3, Cloudflare Pages, or your CDN.

## License

All rights reserved.

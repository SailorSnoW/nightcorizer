# ミ Nightcorizer

Transform your music into 2010s nightcore style, easily.

**[Live Demo](https://nightcorizer.snxw.moe)**

## Features

- **Speed control** — 0.5x to 2x playback
- **Pitch shifting** — -12 to +12 semitones
- **Bass boost** — Up to +12dB
- **Presets** — Classic, Extreme, Soft
- **Export** — MP3 or FLAC
- **100% client-side** — Your files never leave your browser

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS v4
- Web Audio API (preview)
- FFmpeg WASM (export)
- Pinia (state)

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment (Cloudflare Pages)

```bash
# First time: login to Cloudflare
wrangler login

# Deploy to production
bun run deploy

# Deploy preview
bun run deploy:preview
```

Or connect your GitHub repo to Cloudflare Pages with:
- Build command: `bun run build`
- Output directory: `dist`

## License

MIT — [snxw.moe](https://snxw.moe)

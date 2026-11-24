# spruceandink.ca

Website for Spruce & Ink, a custom printing studio in Caledon, Ontario.

- `src/page.html`: page source (edit this)
- `build.sh`: builds `public/index.html` from the source
- `public/`: what Cloudflare serves (index.html, logo, js/three.min.js)
- `wrangler.jsonc`: Cloudflare Worker config (static assets from `public/`)

Every push to `main` deploys automatically through Cloudflare Workers Builds.

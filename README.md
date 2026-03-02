# karigar-website — Public Site
Static files for the Karigar Services & Supplies website.
Deployed via Cloudflare Pages — auto-deploys on every push to `main`.

## Tech Stack
- Pure HTML / CSS / JavaScript
- No build step required
- CDN delivery via Cloudflare Pages

## Local Development
Just open `index.html` in a browser. Or use any static server:
```sh
npx serve .
```

## Deployment
Connected to Cloudflare Pages. Push to `main` → automatically deployed.

## Configuring the Worker URL
Edit `app.js` and update the `WORKER_URL` constant after deploying the worker.

# Kwispel Promosite

Promotional website for the Flemish children’s IP “Kwispel”. Built with Vite, vanilla JavaScript modules, and Tailwind CSS. Default language is Flemish with groundwork for future translations.

## Prerequisites
- Node.js 18+
- npm 9+

## Install
```bash
npm install
```

## Development
Start the Vite dev server with hot module replacement:
```bash
npm run dev
```
Open the URL printed in the terminal (defaults to `http://localhost:5173`).

## Build
Generate the production-ready static files:
```bash
npm run build
```
Outputs to `dist/`. Deploy the contents of that directory to GitHub Pages or any static host.

## Preview Production Build
Serve the built files locally to sanity check before deploying:
```bash
npm run preview
```
This starts a read-only server using the `dist/` bundle.

## Localization
- Default copy lives in `src/locales/nl.json`.
- Add new locale files (e.g., `en.json`) and register them via `registerLocale` in `src/i18n.js` to expose additional languages.
- `src/main.js` listens to language changes through a `localechange` event and rerenders UI strings accordingly.

## Tailwind Styling
- Tailwind is configured in `tailwind.config.js` with custom colors and fonts from the visual identity.
- Global layers and components live in `src/styles/global.css`.
- Run `npm run build` (or `npm run dev`) to process Tailwind classes via PostCSS.

## Deployment Notes
- Ensure the `base` option in `vite.config.js` matches your GitHub Pages repository subpath if hosting from a project repo (defaults to relative `./`).
- Commit the `dist/` folder only if using GitHub Pages via the `docs/` pattern; otherwise publish directly from the build artifact.

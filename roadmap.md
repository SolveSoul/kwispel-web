# Kwispel Promosite Roadmap

## Vision
Launch a kid-friendly promotional website for the Flemish children’s IP “Kwispel” that introduces the characters, showcases the book, and offers playful activities for children ages 2-6.

## Guiding Principles
- **Delightful & accessible**: simple language (Flemish), clear navigation, mobile-first layout.
- **Playful visual identity**: bright whites with accent color `#903c38`, rounded shapes, large typography (Happy Monkey headers, Quicksand body).
- **Future-proof**: static build via Vite, ES modules, minimal dependencies to keep GitHub Pages hosting simple.

## Target Audience
- Primary: children ages 2-6 exploring with guardian assistance.
- Secondary: parents/guardians evaluating the Kwispel book and downloadable activities.

## Requirements Breakdown
- **Brand presentation**: hero section introducing Kwispel and Chilli; highlight the book with CTA to purchase/learn more.
- **Activities**: dedicated games section featuring memory, puzzles, and coloring page teasers.
- **Downloads**: page to download printable coloring pages.
- **Navigation**: desktop layout with logo left, menu right; responsive mobile nav.
- **Localization**: Flemish default content with groundwork for future translations.
- **Tech stack**: Vite + vanilla JS modules with Tailwind CSS utility layer, static output compatible with GitHub Pages.

## Progress Checklist

### Deliverables Status
- [x] Vite project scaffold configured for static deployment.
- [x] Landing page (`index.html`) with hero, features, book highlight, testimonials/CTA, footer.
- [x] Games page detailing memory, puzzles, coloring activity (with placeholders for game modules).
- [x] Downloads page offering coloring pages (placeholder links) and printing tips.
- [x] Shared layout components (header/nav, footer) and Tailwind-driven global styles.
- [x] Translation-ready content structure (e.g., JSON/JS resources, language toggle scaffolding).
- [x] Responsive styling covering common breakpoints (mobile, tablet, desktop).
- [x] Documentation for build/deploy workflow (README updates).

## Milestones & Tasks
### Milestone 1: Project Setup
- [x] Scaffold Vite vanilla project with ES module structure.
- [x] Configure fonts (Google Fonts preload) and Tailwind theme tokens (colors, typography scale).
- [x] Establish layout shell (header, footer, responsive grid).
- [x] Implement lightweight localization infrastructure (content resource files, helper utilities) with Flemish default copy.

### Milestone 2: Landing Page Experience
- [x] Create hero section with Kwispel intro text and CTA buttons.
- [x] Add book showcase section with feature highlights and purchase CTA.
- [x] Build characters/friends teaser section introducing Chilli and others.
- [x] Implement testimonials or parent reassurance section (placeholder content).

### Milestone 3: Games Hub
- [x] Build games overview page with cards for Memory, Puzzles, Coloring.
- [x] Add CTA buttons linking to respective game experiences or coming soon notes.
- [x] Prepare JS modules scaffolds for future interactive mini-games.

### Milestone 4: Coloring Downloads
- [x] Create downloads page with list of coloring PDFs (placeholder links).
- [x] Include instructions for printing and usage tips for guardians.

### Milestone 5: Polish & Deployment
- [ ] Expand animations/micro-interactions appropriate for children (hover wiggles, gentle transitions across CTAs/cards).
- [ ] Ensure navigation works on mobile (hamburger menu) and desktop through final QA.
- [ ] Run responsive checks, accessibility pass (contrast, focus states, alt text placeholders).
- [x] Wire up language switcher scaffolding (UI + fallback when other languages unavailable).
- [x] Document build (`npm run build`) and deployment workflow for GitHub Pages.

## Risks & Considerations
- **Content creation**: need Flemish copy; plan placeholders with TODO markers until final text delivered.
- **Font performance**: ensure font loading strategy avoids layout shifts (use `display=swap`).
- **Interactivity scope**: mini-games may grow in complexity—start with modular JS to allow progressive enhancement.
- **Localization drift**: maintain single source of truth for copy to keep translations in sync across languages.

## Success Criteria
- Site renders correctly on modern desktop/mobile browsers with no console errors.
- Navigation remains intuitive for guardians and accessible for screen readers.
- Build outputs static assets suitable for GitHub Pages without extra server requirements.
- Stakeholders sign off on visual style and readiness for future game expansions.

## Ideas & Explorations
- Evaluate expanding the downloads offering with a 3D print corner (e.g., seasonal ornaments). Consider whether to generalise `Kleurplaten` into a broader `Downloads` hub or to present 3D models as a separate section to avoid overwhelming parents.
- Add an optional custom difficulty selector for the memory game aimed at guardians/kids seeking more challenge. Hide it behind an "advanced" affordance so the default one-click age-appropriate options stay front and centre.

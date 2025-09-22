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

## Deliverables
1. Vite project scaffold configured for static deployment.
2. Landing page (`index.html`) with hero, features, book highlight, testimonials/CTA, footer.
3. Games page detailing memory, puzzles, coloring activity (with placeholders for game modules).
4. Downloads page offering coloring pages (placeholder links) and printing tips.
5. Shared layout components (header/nav, footer) and Tailwind-driven global styles.
6. Translation-ready content structure (e.g., JSON/JS resources, language toggle scaffolding).
7. Responsive styling covering common breakpoints (mobile, tablet, desktop).
8. Documentation for build/deploy workflow (README updates).

## Milestones & Tasks
### Milestone 1: Project Setup
- Scaffold Vite vanilla project with ES module structure.
- Configure fonts (Google Fonts preload) and Tailwind theme tokens (colors, typography scale).
- Establish layout shell (header, footer, responsive grid).
- Implement lightweight localization infrastructure (content resource files, helper utilities) with Flemish default copy.

### Milestone 2: Landing Page Experience
- Create hero section with Kwispel intro text and CTA buttons.
- Add book showcase section with feature highlights and purchase CTA.
- Build characters/friends teaser section introducing Chilli and others.
- Implement testimonials or parent reassurance section (placeholder content).

### Milestone 3: Games Hub
- Build games overview page with cards for Memory, Puzzles, Coloring.
- Add CTA buttons linking to respective game experiences or coming soon notes.
- Prepare JS modules scaffolds for future interactive mini-games.

### Milestone 4: Coloring Downloads
- Create downloads page with list of coloring PDFs (placeholder links).
- Include instructions for printing and usage tips for guardians.

### Milestone 5: Polish & Deployment
- Add animations/micro-interactions appropriate for children (e.g., hover wiggles, gentle transitions).
- Ensure navigation works on mobile (hamburger menu) and desktop.
- Run responsive checks, accessibility pass (contrast, focus states, alt text placeholders).
- Wire up language switcher scaffolding (UI + fallback when other languages unavailable).
- Document build (`npm run build`) and deployment workflow for GitHub Pages.

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

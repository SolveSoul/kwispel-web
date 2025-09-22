import './styles/global.css';
import { getAvailableLanguages, getLanguage, setLanguage, t } from './i18n.js';

const appRoot = document.querySelector('#app');

if (!appRoot) {
  throw new Error('Kan #app niet vinden in het document.');
}

const NAV_ITEMS = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.games', href: '#games' },
  { key: 'nav.downloads', href: '#downloads' },
  { key: 'nav.about', href: '#about' },
];

function renderLanguageOptions() {
  const languages = getAvailableLanguages();
  const active = getLanguage();

  if (languages.length <= 1) {
    return `
      <button
        class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white px-4 py-2 text-sm text-accent opacity-70"
        type="button"
        disabled
        aria-disabled="true"
      >
        <span aria-hidden="true">🌍</span>
        ${t('nav.language')}
      </button>
    `;
  }

  const buttons = languages
    .map(
      (code) => `
        <button
          class="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white px-4 py-2 text-sm text-accent hover:border-accent"
          type="button"
          data-lang="${code}"
          aria-pressed="${code === active}"
        >
          ${code.toUpperCase()}
        </button>
      `,
    )
    .join('');

  return `<div class="flex flex-wrap items-center gap-2" role="group" aria-label="${t('nav.language')}">${buttons}</div>`;
}

function render() {
  appRoot.innerHTML = `
    <div class="site-shell">
      <a class="visually-hidden" href="#main">${t('layout.skipToContent')}</a>
      <header class="site-header">
        <div class="site-container">
          <nav class="flex items-center justify-between gap-6">
            <div class="flex items-center gap-3">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl font-heading text-accent shadow-soft">
                K
              </div>
              <span class="text-2xl font-heading text-accent">Kwispel</span>
            </div>
            <button
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-white text-accent transition md:hidden"
              type="button"
              aria-label="${t('layout.toggleMenu')}"
            >
              <span class="sr-only">${t('layout.toggleMenu')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div class="hidden items-center gap-6 md:flex">
              ${NAV_ITEMS.map(
                ({ key, href }) => `
                  <a class="text-base font-medium text-text transition hover:text-accent" href="${href}">
                    ${t(key)}
                  </a>
                `,
              ).join('')}
              ${renderLanguageOptions()}
            </div>
          </nav>
        </div>
      </header>
      <main id="main" class="site-main">
        <div class="site-container flex flex-col gap-16">
          <section id="home" class="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div class="flex flex-col gap-6">
              <span class="inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-accent shadow-soft">Kwispel &amp; vrienden</span>
              <h1 class="text-4xl leading-tight md:text-5xl">${t('hero.title')}</h1>
              <p class="text-lg text-text/80 md:text-xl">${t('hero.subtitle')}</p>
              <div class="flex flex-wrap gap-4">
                <a class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="#book">
                  ${t('hero.ctaPrimary')}
                </a>
                <a class="inline-flex items-center justify-center rounded-full border border-accent/30 bg-white px-6 py-3 text-base font-semibold text-accent transition hover:-translate-y-0.5" href="#games">
                  ${t('hero.ctaSecondary')}
                </a>
              </div>
            </div>
            <div class="aspect-square rounded-[2.5rem] border border-dashed border-accent/30 bg-white p-6 shadow-soft">
              <div class="flex h-full w-full items-center justify-center rounded-3xl border-4 border-accent/20 bg-accent/10 text-center text-accent">
                <span class="max-w-[14ch] text-xl font-heading leading-snug">Illustratie ruimte voor Kwispel</span>
              </div>
            </div>
          </section>
          <section id="book" class="grid gap-10 rounded-3xl bg-white p-8 shadow-soft md:p-12 lg:grid-cols-2">
            <div class="flex flex-col gap-4">
              <h2 class="text-3xl">${t('book.heading')}</h2>
              <p class="text-base text-text/80 md:text-lg">${t('book.description')}</p>
              <ul class="grid gap-3 text-base text-text/90">
                ${t('book.features')
                  .map((feature) => `<li class="flex items-start gap-3"><span aria-hidden="true">✨</span><span>${feature}</span></li>`)
                  .join('')}
              </ul>
              <a class="mt-4 inline-flex w-fit items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="#contact">
                ${t('book.cta')}
              </a>
            </div>
            <div class="flex items-center justify-center">
              <div class="flex h-72 w-60 items-center justify-center rounded-[2rem] border-4 border-accent/30 bg-muted text-accent">
                <span class="max-w-[16ch] text-center text-lg font-heading leading-snug">Boekcover placeholder</span>
              </div>
            </div>
          </section>
          <section id="games" class="flex flex-col gap-6">
            <div class="flex flex-col gap-3 text-center">
              <h2 class="text-3xl">${t('games.heading')}</h2>
              <p class="text-base text-text/70 md:text-lg">${t('games.comingSoon')}</p>
            </div>
            <div class="grid gap-6 md:grid-cols-3">
              ${['memory', 'puzzles', 'coloring']
                .map(
                  (activity) => `
                    <article class="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft">
                      <div class="flex h-40 items-center justify-center rounded-2xl border border-dashed border-accent/30 bg-muted text-accent">
                        <span class="text-center text-lg font-heading">${t(`games.${activity}.title`)}</span>
                      </div>
                      <div class="flex flex-1 flex-col justify-between gap-4">
                        <p class="text-sm text-text/80">${t(`games.${activity}.description`)}</p>
                        <span class="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent">${t('games.comingSoon')}<span aria-hidden="true">→</span></span>
                      </div>
                    </article>
                  `,
                )
                .join('')}
            </div>
          </section>
          <section id="downloads" class="grid gap-8 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:p-12">
            <div class="flex flex-col gap-4">
              <h2 class="text-3xl">${t('downloads.heading')}</h2>
              <p class="text-base text-text/80 md:text-lg">${t('downloads.description')}</p>
              <a class="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="#">
                ${t('downloads.cta')}
              </a>
              <p class="text-sm text-text/70">${t('downloads.printingTips')}</p>
            </div>
            <div class="flex items-center justify-center">
              <div class="flex h-56 w-full max-w-sm items-center justify-center rounded-[2rem] border border-accent/20 bg-muted text-center text-accent">
                <span class="max-w-[16ch] text-lg font-heading leading-snug">Voorbeeld kleurplaat</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer class="site-footer">
        <div class="site-container space-y-2">
          <small>${t('footer.legal')}</small>
          <div>
            <small>${t('footer.contact')}</small>
          </div>
        </div>
      </footer>
    </div>
  `;

  wireLanguageControls();
}

function wireLanguageControls() {
  const langButtons = appRoot.querySelectorAll('[data-lang]');

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.lang);
    });
  });
}

document.addEventListener('localechange', render);

render();

if (typeof window !== 'undefined') {
  window.__kwispelSetLanguage = setLanguage;
}

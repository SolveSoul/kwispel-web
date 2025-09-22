import { getAvailableLanguages, getLanguage, setLanguage, t } from '../i18n.js';

export function renderLanguageOptions() {
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

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="site-container space-y-2">
        <small>${t('footer.legal')}</small>
        <div>
          <small>${t('footer.contact')}</small>
        </div>
      </div>
    </footer>
  `;
}

export function wireLanguageControls(root) {
  const langButtons = root.querySelectorAll('[data-lang]');

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.lang);
    });
  });
}

export function renderHeader(navItemsMarkup) {
  return `
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
            ${navItemsMarkup}
            ${renderLanguageOptions()}
          </div>
        </nav>
      </div>
    </header>
  `;
}

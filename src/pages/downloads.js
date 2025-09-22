import '../styles/global.css';
import { setLanguage, t } from '../i18n.js';
import { resolveNavItems } from '../content/navigation.js';
import { getColoringPages } from '../content/downloads.js';
import { renderFooter, renderHeader, wireLanguageControls } from '../ui/layout.js';

const appRoot = document.querySelector('#app');

if (!appRoot) {
  throw new Error('Kan #app niet vinden in het document.');
}

function createNavMarkup() {
  const items = resolveNavItems({
    basePath: './index.html',
    overrides: { games: './games.html' },
  }).map((item) => {
    if (item.id === 'downloads') {
      return { ...item, href: '#overview' };
    }

    return item;
  });

  return items
    .map(
      ({ key, href }) => `
        <a class="text-base font-medium text-text transition hover:text-accent" href="${href}">
          ${t(key)}
        </a>
      `,
    )
    .join('');
}

function renderColoringCard(id) {
  const title = t(`downloadsPage.items.${id}.title`);
  const description = t(`downloadsPage.items.${id}.description`);
  const tags = t(`downloadsPage.items.${id}.tags`) ?? [];
  const tagMarkup = Array.isArray(tags)
    ? tags
        .map((tag) => `<span class="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent/80">${tag}</span>`)
        .join('')
    : '';

  return `
    <article class="flex h-full flex-col gap-4 rounded-3xl border border-accent/15 bg-white p-6 shadow-soft">
      <div class="flex h-40 items-center justify-center rounded-2xl border border-dashed border-accent/20 bg-muted text-accent">
        <span class="max-w-[14ch] text-center text-sm font-heading leading-snug">${t('downloadsPage.cards.placeholderAlt')}</span>
      </div>
      <div class="flex flex-col gap-3">
        <h3 class="text-2xl">${title}</h3>
        <p class="text-sm text-text/80">${description}</p>
      </div>
      <div class="flex flex-wrap gap-2" aria-label="${t('downloadsPage.cards.tagsLabel')}">
        ${tagMarkup}
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="inline-flex items-center justify-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent opacity-70" type="button" disabled>
          ${t('downloadsPage.actions.print')}
        </button>
        <button class="inline-flex items-center justify-center gap-2 rounded-full border border-accent/30 bg-white px-4 py-2 text-sm font-semibold text-accent opacity-70" type="button" disabled>
          ${t('downloadsPage.actions.download')}
        </button>
        <span class="inline-flex items-center text-xs font-medium uppercase tracking-wide text-accent/70">${t('downloadsPage.actions.comingSoon')}</span>
      </div>
    </article>
  `;
}

function render() {
  const navMarkup = createNavMarkup();
  const cardsMarkup = getColoringPages().map(({ id }) => renderColoringCard(id)).join('');
  const tips = t('downloadsPage.tips.items') ?? [];
  const tipMarkup = Array.isArray(tips)
    ? tips
        .map(
          (tip) => `
            <li class="flex items-start gap-3 rounded-2xl border border-accent/15 bg-white p-4 shadow-soft">
              <span aria-hidden="true" class="mt-1 text-accent">✔</span>
              <span>${tip}</span>
            </li>
          `,
        )
        .join('')
    : '';

  appRoot.innerHTML = `
    <div class="site-shell">
      <a class="visually-hidden" href="#main">${t('layout.skipToContent')}</a>
      ${renderHeader(navMarkup)}
      <main id="main" class="site-main">
        <div class="site-container flex flex-col gap-16">
          <section id="overview" class="grid gap-10 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:p-12">
            <div class="flex flex-col gap-5">
              <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">${t('downloadsPage.hero.eyebrow')}</span>
              <h1 class="text-4xl leading-tight md:text-5xl">${t('downloadsPage.hero.heading')}</h1>
              <p class="text-lg text-text/80 md:text-xl">${t('downloadsPage.hero.intro')}</p>
              <div class="flex flex-wrap gap-4">
                <a class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="./index.html">
                  ${t('downloadsPage.hero.cta')}
                </a>
              </div>
            </div>
            <div class="aspect-square rounded-[2.5rem] border border-dashed border-accent/20 bg-muted p-6">
              <div class="flex h-full w-full items-center justify-center rounded-3xl border-4 border-accent/20 bg-accent/10 text-center text-accent">
                <span class="max-w-[16ch] text-xl font-heading leading-snug">Illustratie ruimte voor kleurplaten</span>
              </div>
            </div>
          </section>
          <section class="flex flex-col gap-6">
            <div class="flex flex-col gap-3 text-center">
              <h2 class="text-3xl">${t('downloadsPage.overview.heading')}</h2>
              <p class="text-base text-text/70 md:text-lg">${t('downloadsPage.overview.description')}</p>
              <p class="text-sm font-medium text-accent/80">${t('downloadsPage.overview.note')}</p>
            </div>
            <div class="grid gap-6 md:grid-cols-3">
              ${cardsMarkup}
            </div>
          </section>
          <section class="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-soft md:p-12">
            <h2 class="text-3xl text-center">${t('downloadsPage.tips.heading')}</h2>
            <ul class="grid gap-4 md:grid-cols-3">
              ${tipMarkup}
            </ul>
          </section>
        </div>
      </main>
      ${renderFooter()}
    </div>
  `;

  wireLanguageControls(appRoot);
}

document.addEventListener('localechange', render);

render();

if (typeof window !== 'undefined') {
  window.__kwispelSetLanguage = setLanguage;
}

import '../styles/global.css';
import { setLanguage, t } from '../i18n.js';
import { resolveNavItems } from '../content/navigation.js';
import { getActivities } from '../content/activities.js';
import { renderFooter, renderHeader, wireLanguageControls } from '../ui/layout.js';

const appRoot = document.querySelector('#app');

if (!appRoot) {
  throw new Error('Kan #app niet vinden in het document.');
}

function createNavMarkup() {
  const items = resolveNavItems().map((item) => {
    if (item.id === 'games') {
      return { ...item, href: '#overview' };
    }

    if (item.href.startsWith('#')) {
      return { ...item, href: `./index.html${item.href}` };
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

function renderActivityDetails(id) {
  const status = t(`gamesPage.activities.${id}.status`);
  const bullets = t(`gamesPage.activities.${id}.bullets`) ?? [];
  const cta = t(`gamesPage.activities.${id}.cta`);
  const bulletMarkup = Array.isArray(bullets)
    ? bullets
        .map(
          (item) => `
            <li class="flex items-start gap-2">
              <span aria-hidden="true">•</span>
              <span>${item}</span>
            </li>
          `,
        )
        .join('')
    : '';

  return `
    <article class="flex h-full flex-col gap-5 rounded-3xl border border-accent/15 bg-white p-6 shadow-soft">
      <div class="flex flex-col gap-3">
        <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">${status}</span>
        <h3 class="text-2xl">${t(`games.${id}.title`)}</h3>
        <p class="text-sm text-text/80">${t(`games.${id}.description`)}</p>
      </div>
      <ul class="flex flex-col gap-2 text-sm text-text/80">
        ${bulletMarkup}
      </ul>
      ${
        id === 'memory' && typeof cta === 'string' && !cta.startsWith('gamesPage.')
          ? `<a class="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent" href="./memory.html">${cta}<span aria-hidden="true">→</span></a>`
          : `<p class="text-sm font-medium text-accent/80">${t('games.comingSoon')}</p>`
      }
    </article>
  `;
}

function render() {
  const navMarkup = createNavMarkup();
  const activityMarkup = getActivities().map(({ id }) => renderActivityDetails(id)).join('');
  const tips = t('gamesPage.tips.items') ?? [];
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
              <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">${t('gamesPage.hero.eyebrow')}</span>
              <h1 class="text-4xl leading-tight md:text-5xl">${t('gamesPage.hero.heading')}</h1>
              <p class="text-lg text-text/80 md:text-xl">${t('gamesPage.hero.intro')}</p>
              <div class="flex flex-wrap gap-4">
                <a class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5" href="./index.html">
                  ${t('gamesPage.hero.cta')}
                </a>
              </div>
            </div>
            <div class="aspect-square rounded-[2.5rem] border border-dashed border-accent/20 bg-muted p-6">
              <div class="flex h-full w-full items-center justify-center rounded-3xl border-4 border-accent/20 bg-accent/10 text-center text-accent">
                <span class="max-w-[16ch] text-xl font-heading leading-snug">Illustratie ruimte voor spelbeeld</span>
              </div>
            </div>
          </section>
          <section class="flex flex-col gap-6">
            <div class="flex flex-col gap-3 text-center">
              <h2 class="text-3xl">${t('gamesPage.overview.heading')}</h2>
              <p class="text-base text-text/70 md:text-lg">${t('gamesPage.overview.description')}</p>
            </div>
            <div class="grid gap-6 md:grid-cols-3">
              ${activityMarkup}
            </div>
            <p class="text-center text-sm text-text/70">${t('gamesPage.availabilityNote')}</p>
          </section>
          <section class="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-soft md:p-12">
            <h2 class="text-3xl text-center">${t('gamesPage.tips.heading')}</h2>
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

import './styles/global.css';
import { setLanguage, t } from './i18n.js';
import { resolveNavItems } from './content/navigation.js';
import { getActivities } from './content/activities.js';
import { renderFooter, renderHeader, wireLanguageControls, wireMobileNavigation } from './ui/layout.js';

const appRoot = document.querySelector('#app');

if (!appRoot) {
  throw new Error('Kan #app niet vinden in het document.');
}

function createNavMarkup(items) {
  return items
    .map(
      ({ key, href }) => `
        <a class="nav-link" href="${href}">
          ${t(key)}
        </a>
      `,
    )
    .join('');
}

function render() {
  const navMarkup = createNavMarkup(resolveNavItems());

  if (typeof appRoot.__mobileNavCleanup === 'function') {
    appRoot.__mobileNavCleanup();
    appRoot.__mobileNavCleanup = undefined;
  }

  appRoot.innerHTML = `
    <div class="site-shell">
      <a class="visually-hidden" href="#main">${t('layout.skipToContent')}</a>
      ${renderHeader(navMarkup)}
      <main id="main" class="site-main">
        <div class="site-container flex flex-col gap-16">
          <section id="home" class="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div class="flex flex-col gap-6">
              <span class="inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-accent shadow-soft">Kwispel &amp; vrienden</span>
              <h1 class="text-4xl leading-tight md:text-5xl">${t('hero.title')}</h1>
              <p class="text-lg text-text/80 md:text-xl">${t('hero.subtitle')}</p>
              <div class="flex flex-wrap gap-4">
                <a class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition" data-cta="primary" href="#book">
                  ${t('hero.ctaPrimary')}
                </a>
                <a class="inline-flex items-center justify-center rounded-full border border-accent/30 bg-white px-6 py-3 text-base font-semibold text-accent transition" data-cta="secondary" href="#games">
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
              <a class="mt-4 inline-flex w-fit items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition" data-cta="primary" href="#contact">
                ${t('book.cta')}
              </a>
            </div>
            <div class="flex items-center justify-center">
              <div class="flex h-72 w-60 items-center justify-center rounded-[2rem] border-4 border-accent/30 bg-muted text-accent">
                <span class="max-w-[16ch] text-center text-lg font-heading leading-snug">Boekcover placeholder</span>
              </div>
            </div>
          </section>
          <section id="about" class="grid gap-10 rounded-3xl border border-accent/10 bg-white p-8 shadow-soft md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:p-12">
            <div class="flex flex-col gap-4">
              <h2 class="text-3xl">${t('characters.heading')}</h2>
              <p class="text-base text-text/80 md:text-lg">${t('characters.intro')}</p>
              <a class="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition" data-cta="primary" href="#games">
                ${t('characters.cta')}
              </a>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              ${t('characters.list')
                .map(
                  ({ name, role, description }) => `
                    <article class="flex h-full flex-col gap-3 rounded-2xl border border-accent/15 bg-muted p-5 shadow-soft">
                      <span class="text-sm font-semibold uppercase tracking-wide text-accent/70">${role}</span>
                      <h3 class="text-2xl">${name}</h3>
                      <p class="text-sm text-text/80">${description}</p>
                    </article>
                  `,
                )
                .join('')}
            </div>
          </section>
          <section class="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-soft text-center md:p-12">
            <h2 class="text-3xl">${t('testimonials.heading')}</h2>
            <p class="text-base text-text/80 md:text-lg">${t('testimonials.placeholder')}</p>
          </section>
          <section id="games" class="flex flex-col gap-6">
            <div class="flex flex-col gap-3 text-center">
              <h2 class="text-3xl">${t('games.heading')}</h2>
              <p class="text-base text-text/70 md:text-lg">${t('games.comingSoon')}</p>
            </div>
            <div class="grid gap-6 md:grid-cols-3">
              ${getActivities()
                .map(({ id }) => {
                  const playableIds = new Set(['memory', 'coloring']);
                  const isPlayable = playableIds.has(id);
                  const cta = t(`games.${id}.cta`);
                  const actionMarkup = isPlayable && typeof cta === 'string' && !cta.startsWith('gamesPage.')
                    ? `<a class="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent transition" data-cta="secondary" href="./${id}.html">${cta}<span aria-hidden="true">→</span></a>`
                    : `<span class="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent/80">${t('games.comingSoon')}</span>`;

                  return `
                    <article class="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft">
                      <div class="flex h-40 items-center justify-center rounded-2xl border border-dashed border-accent/30 bg-muted text-accent">
                        <span class="text-center text-lg font-heading">${t(`games.${id}.title`)}</span>
                      </div>
                      <div class="flex flex-1 flex-col justify-between gap-4">
                        <p class="text-sm text-text/80">${t(`games.${id}.description`)}</p>
                        ${actionMarkup}
                      </div>
                    </article>
                  `;
                })
                .join('')}
            </div>
          </section>
          <section id="downloads" class="grid gap-8 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:p-12">
            <div class="flex flex-col gap-4">
              <h2 class="text-3xl">${t('downloads.heading')}</h2>
              <p class="text-base text-text/80 md:text-lg">${t('downloads.description')}</p>
              <a class="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition" data-cta="primary" href="./downloads.html">
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
      ${renderFooter()}
    </div>
  `;

  wireLanguageControls(appRoot);
  appRoot.__mobileNavCleanup = wireMobileNavigation(appRoot);
}

document.addEventListener('localechange', render);

render();

if (typeof window !== 'undefined') {
  window.__kwispelSetLanguage = setLanguage;
}

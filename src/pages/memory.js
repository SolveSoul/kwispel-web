import '../styles/global.css';
import { setLanguage, t } from '../i18n.js';
import { resolveNavItems } from '../content/navigation.js';
import { renderFooter, renderHeader, wireLanguageControls, wireMobileNavigation } from '../ui/layout.js';
import { mountMemoryGame } from '../games/memory.js';

const appRoot = document.querySelector('#app');

if (!appRoot) {
  throw new Error('Kan #app niet vinden in het document.');
}

let teardown = null;

function createNavMarkup() {
  const items = resolveNavItems({ basePath: './index.html', overrides: { games: './games.html' } });

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
  if (teardown) {
    teardown.destroy();
    teardown = null;
  }

  const navMarkup = createNavMarkup();

  if (typeof appRoot.__mobileNavCleanup === 'function') {
    appRoot.__mobileNavCleanup();
    appRoot.__mobileNavCleanup = undefined;
  }

  appRoot.innerHTML = `
    <div class="site-shell">
      <a class="visually-hidden" href="#main">${t('layout.skipToContent')}</a>
      ${renderHeader(navMarkup)}
      <main id="main" class="site-main">
        <div class="site-container flex flex-col gap-10">
          <section class="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-soft md:p-10">
            <div class="flex flex-col gap-3">
              <span class="inline-flex w-fit items-center rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent">${t('memoryGame.pageEyebrow')}</span>
              <h1 class="text-4xl leading-tight md:text-5xl">${t('memoryGame.pageTitle')}</h1>
              <p class="text-base text-text/80 md:text-lg">${t('memoryGame.pageIntro')}</p>
            </div>
            <div data-memory-root class="flex flex-col gap-6"></div>
          </section>
        </div>
      </main>
      ${renderFooter()}
    </div>
  `;

  wireLanguageControls(appRoot);
  appRoot.__mobileNavCleanup = wireMobileNavigation(appRoot);

  const gameRoot = appRoot.querySelector('[data-memory-root]');

  teardown = gameRoot ? mountMemoryGame(gameRoot) : null;
}

document.addEventListener('localechange', render);

render();

if (typeof window !== 'undefined') {
  window.__kwispelSetLanguage = setLanguage;
  window.addEventListener('beforeunload', () => {
    if (teardown) {
      teardown.destroy();
      teardown = null;
    }
  });
}

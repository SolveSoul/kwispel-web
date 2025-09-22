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
  const languageControls = renderLanguageOptions();

  return `
    <header class="site-header">
      <div class="site-container">
        <nav class="flex items-center justify-between gap-6" aria-label="${t('layout.primaryNav')}">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl font-heading text-accent shadow-soft">
              K
            </div>
            <span class="text-2xl font-heading text-accent">Kwispel</span>
          </div>
          <button
            class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-white text-accent transition md:hidden"
            type="button"
            data-mobile-nav-toggle
            aria-controls="mobile-navigation"
            aria-expanded="false"
            aria-label="${t('layout.openMenu')}"
            data-open-label="${t('layout.openMenu')}"
            data-close-label="${t('layout.closeMenu')}"
          >
            <span class="sr-only" data-mobile-nav-toggle-label>${t('layout.openMenu')}</span>
            <svg data-mobile-nav-icon="open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg data-mobile-nav-icon="close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="hidden h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
          <div class="hidden items-center gap-6 md:flex">
            ${navItemsMarkup}
            ${languageControls}
          </div>
        </nav>
        <div class="mobile-nav" id="mobile-navigation" data-mobile-nav hidden aria-hidden="true">
          <div class="mobile-nav__panel">
            <div class="mobile-nav__links">
              ${navItemsMarkup}
            </div>
            <div class="mobile-nav__footer" data-mobile-nav-footer>
              ${languageControls}
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function wireMobileNavigation(root) {
  const toggle = root.querySelector('[data-mobile-nav-toggle]');
  const mobileNav = root.querySelector('[data-mobile-nav]');

  if (!toggle || !mobileNav) {
    return () => {};
  }

  const openLabel = toggle.dataset.openLabel || toggle.getAttribute('aria-label') || '';
  const closeLabel = toggle.dataset.closeLabel || openLabel;
  const labelElement = toggle.querySelector('[data-mobile-nav-toggle-label]');
  const icons = toggle.querySelectorAll('[data-mobile-nav-icon]');

  let isOpen = false;
  let closingTimeout;
  let frameId;
  let destroyed = false;

  function updateState() {
    if (destroyed) {
      return;
    }

    if (closingTimeout) {
      clearTimeout(closingTimeout);
      closingTimeout = undefined;
    }

    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = undefined;
    }

    toggle.setAttribute('aria-expanded', String(isOpen));
    const label = isOpen ? closeLabel : openLabel;
    toggle.setAttribute('aria-label', label);

    if (labelElement) {
      labelElement.textContent = label;
    }

    icons.forEach((icon) => {
      const isCloseIcon = icon.dataset.mobileNavIcon === 'close';
      icon.classList.toggle('hidden', isCloseIcon ? !isOpen : isOpen);
    });

    if (isOpen) {
      mobileNav.removeAttribute('hidden');
      mobileNav.dataset.state = 'opening';
      mobileNav.setAttribute('aria-hidden', 'false');
      syncHeight();
      frameId = requestAnimationFrame(() => {
        mobileNav.dataset.state = 'open';
        frameId = undefined;
        const focusTarget = mobileNav.querySelector('a, button');

        if (focusTarget && typeof focusTarget.focus === 'function') {
          focusTarget.focus();
        }
      });
      document.addEventListener('keydown', handleKeyDown);
    } else {
      mobileNav.dataset.state = 'closing';
      mobileNav.setAttribute('aria-hidden', 'true');
      mobileNav.style.maxHeight = '0px';
      document.removeEventListener('keydown', handleKeyDown);
      closingTimeout = window.setTimeout(() => {
        mobileNav.dataset.state = 'closed';
        mobileNav.setAttribute('hidden', '');
        closingTimeout = undefined;
      }, 220);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      isOpen = false;
      updateState();
      toggle.focus();
    }
  }

  function handleToggleClick() {
    isOpen = !isOpen;
    updateState();
  }

  function handleMobileNavClick(event) {
    const target = event.target;
    const linkTarget = target && typeof target.closest === 'function' ? target.closest('a[href]') : null;

    if (linkTarget) {
      isOpen = false;
      updateState();
    }
  }

  function syncHeight() {
    mobileNav.style.maxHeight = `${mobileNav.scrollHeight}px`;
  }

  function handleResize() {
    if (!isOpen) {
      return;
    }

    syncHeight();
  }

  function handleTransitionEnd(event) {
    if (event.propertyName === 'max-height' && !isOpen && !mobileNav.hasAttribute('hidden')) {
      mobileNav.setAttribute('hidden', '');
    }
  }

  toggle.addEventListener('click', handleToggleClick);
  mobileNav.addEventListener('click', handleMobileNavClick);
  mobileNav.addEventListener('transitionend', handleTransitionEnd);
  window.addEventListener('resize', handleResize);

  mobileNav.dataset.state = 'closed';
  mobileNav.style.maxHeight = '0px';
  updateState();

  const cleanup = () => {
    destroyed = true;

    if (closingTimeout) {
      clearTimeout(closingTimeout);
      closingTimeout = undefined;
    }

    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = undefined;
    }

    document.removeEventListener('keydown', handleKeyDown);
    toggle.removeEventListener('click', handleToggleClick);
    mobileNav.removeEventListener('click', handleMobileNavClick);
    mobileNav.removeEventListener('transitionend', handleTransitionEnd);
    window.removeEventListener('resize', handleResize);
  };

  return cleanup;
}

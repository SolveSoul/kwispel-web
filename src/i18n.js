import nl from './locales/nl.json';

const resources = {
  nl,
};

let currentLanguage = 'nl';

updateDocumentLang(currentLanguage);

function updateDocumentLang(lang) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lang);
  }
}

export function t(key) {
  const segments = key.split('.');
  let value = resources[currentLanguage];

  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in value) {
      value = value[segment];
    } else {
      return key;
    }
  }

  return value;
}

export function setLanguage(lang) {
  if (!(lang in resources)) {
    return false;
  }

  if (lang === currentLanguage) {
    return true;
  }

  currentLanguage = lang;
  updateDocumentLang(lang);

  if (typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent('localechange', {
        detail: { language: lang },
      }),
    );
  }

  return true;
}

export function getLanguage() {
  return currentLanguage;
}

export function getAvailableLanguages() {
  return Object.keys(resources);
}

export function registerLocale(code, messages) {
  resources[code] = messages;
}

export const NAV_ITEMS = [
  { id: 'home', key: 'nav.home', href: '#home' },
  { id: 'games', key: 'nav.games', href: '#games' },
  { id: 'downloads', key: 'nav.downloads', href: '#downloads' },
  { id: 'about', key: 'nav.about', href: '#about' },
];

export function resolveNavItems(options = {}) {
  const { basePath = '', overrides = {} } = options;

  return NAV_ITEMS.map((item) => {
    const overrideHref = overrides[item.id] ?? overrides[item.key];
    const targetHref = overrideHref ?? item.href;

    if (basePath && targetHref.startsWith('#')) {
      return { ...item, href: `${basePath}${targetHref}` };
    }

    return { ...item, href: targetHref };
  });
}

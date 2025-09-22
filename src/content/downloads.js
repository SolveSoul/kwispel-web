export const COLORING_PAGE_IDS = ['kwispelIntro', 'chilliPlay', 'friendsParade'];

export function getColoringPages() {
  return COLORING_PAGE_IDS.map((id) => ({ id }));
}

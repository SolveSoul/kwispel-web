const COLORING_PAGES = [
  {
    id: 'kwispelIntro',
    previewUrl: './downloads/coloring/kwispel_tong_preview.png',
    pdfUrl: './downloads/coloring/kwispel_tong.pdf',
  },
  { id: 'chilliPlay' },
  { id: 'friendsParade' },
];

export const COLORING_PAGE_IDS = COLORING_PAGES.map(({ id }) => id);

export function getColoringPages() {
  return COLORING_PAGES;
}

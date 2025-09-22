export const ACTIVITY_IDS = ['memory', 'puzzles', 'coloring'];

export function getActivities() {
  return ACTIVITY_IDS.map((id) => ({ id }));
}

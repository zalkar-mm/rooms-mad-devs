/** Единственное место приложения, где читается системное время (docs/data.md §7). */
export function clockNow(): number {
  return Date.now();
}

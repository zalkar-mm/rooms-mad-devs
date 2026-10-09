/** Медиазапросы раскладки (SPEC §11, D28, D36): те же границы, что `md:` и `xl:` в Tailwind. */
export const MEDIA = {
  /** От 768: вид по умолчанию — «Неделя» (D28). */
  md: "(min-width: 48rem)",
  /** От 1200: панель справа от сетки (SPEC §11). */
  xl: "(min-width: 75rem)",
  /** Сенсорный экран: слот 48 px, двойное касание вместо протягивания (D36). */
  coarsePointer: "(pointer: coarse)",
} as const;

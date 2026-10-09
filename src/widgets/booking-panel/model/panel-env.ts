import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

/** Что нужно всем режимам панели: правила из настроек, «сейчас» и подсказки названия (D35). */
export type PanelEnv = {
  config: BookingRulesConfig;
  now: RulesNow;
  titleSuggestions: readonly string[];
};

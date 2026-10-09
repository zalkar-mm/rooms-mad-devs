import { CalendarSection } from "./calendar-section";
import { ControlsSection } from "./controls-section";
import { FeedbackSection } from "./feedback-section";
import { PanelSection } from "./panel-section";
import { RoomsSection } from "./rooms-section";

/**
 * Страница проверки UI kit (только dev): каждый компонент во всех состояниях.
 * Подписи состояний — служебные, в texts.ts не выносятся. hover и focus показаны через data-state.
 */
export default function UiKitPage() {
  return (
    <main className="mx-auto flex max-w-300 flex-col gap-10 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title text-grey-100">UI kit — Бронирование переговорных</h1>
        <p className="text-small text-grey-50">
          Служебная страница: состояния hover и focus показаны принудительно, остальные — живые.
        </p>
      </header>
      <FeedbackSection />
      <ControlsSection />
      <RoomsSection />
      <CalendarSection />
      <PanelSection />
    </main>
  );
}

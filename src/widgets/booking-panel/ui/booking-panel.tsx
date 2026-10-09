import { type RefObject, useEffect, useRef } from "react";

import type { SavedKind } from "@/features/booking-form/model/booking-form.types";
import { LeaveDraftConfirm } from "@/features/leave-draft/ui/leave-draft-confirm";

import type { Booking } from "@/entities/booking/model/booking.types";
import { type BookingDraft, useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingSelection } from "@/entities/booking/model/booking-selection.types";

import { TEXTS } from "@/shared/consts/texts";
import { assertNever } from "@/shared/lib/assert-never";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";

import type { PanelEnv } from "../model/panel-env";
import { usePanelEnv } from "../model/use-panel-env";

import { BookingDetailsPanel } from "./booking-details-panel";
import { BookingFormPanel } from "./booking-form-panel";
import { PanelContainer, type PanelLayout } from "./panel-container";
import { PanelEmpty } from "./panel-empty";

/** Что открыто в панели и как она его показывает. */
export type PanelSelection = {
  /** Бронь из сетки, «Не найдена» или ничего (SPEC §6.3). */
  current: BookingSelection;
  /** «Бронь создана» над деталями только что созданной брони. */
  successText: string | undefined;
  /** Перевести фокус в пустую панель — сразу после удаления (SPEC §12). */
  focusEmpty: boolean;
  /** Поверх сетки черновик спрятан «Назад к календарю», но не удалён (D33). */
  draftHidden: boolean;
  /** «Забронировать» не нашла свободного слота на дату (D34). */
  noTime: boolean;
};

export type PanelActions = {
  onClose: () => void;
  onBookingSaved: (booking: Booking, kind: SavedKind) => void;
  /** Правка перенесла дату брони (T10 §4.3а). */
  onDraftDateChange: (date: IsoDate) => void;
  /** Сервер ответил `404` на открытую бронь: панель «Не найдена» (D14). */
  onBookingMissing: () => void;
  /** Бронь удалена: панель пустая, фокус в ней (SPEC §12). */
  onBookingDeleted: () => void;
  onHideDraft: () => void;
};

/** «Все комнаты» с черновиком: вопрос «Уйти к списку комнат?» (D33). */
export type LeaveConfirm = { onStay: () => void; onLeave: () => void };

export type BookingPanelProps = {
  roomId: string;
  selection: PanelSelection;
  actions: PanelActions;
  /** Подписи времени в поясе режима; данные — во времени комнаты (D23). */
  display: TimeDisplay;
  layout: PanelLayout;
  /** Бронь или слот, из которых открыли панель: туда возвращается фокус. */
  returnFocusRef: RefObject<HTMLElement | null>;
  leaveConfirm: LeaveConfirm | undefined;
};

type PanelModeProps = BookingPanelProps & { env: PanelEnv };

/**
 * Боковая панель (SPEC §6.3, D12). «Пусто»: от 1200 px — справа от сетки, уже — не показывается. Бронь и
 * «Не найдена» — справа или поверх сетки по ширине (SPEC §11).
 */
export function BookingPanel(props: BookingPanelProps) {
  const env = usePanelEnv();
  const draft = useBookingDraftStore((state) => state.draft);
  if (!env) return null;

  const roomDraft = draft?.roomId === props.roomId ? draft : null;
  if (props.leaveConfirm && draft) return <LeavePanel {...props} draft={draft} confirm={props.leaveConfirm} />;
  if (roomDraft) return <DraftPanel {...props} env={env} draft={roomDraft} />;
  if (props.selection.noTime) return <NoTimePanel {...props} />;
  return <SelectionPanel {...props} env={env} />;
}

function LeavePanel({
  draft,
  confirm,
  layout,
  returnFocusRef,
}: BookingPanelProps & { draft: BookingDraft; confirm: LeaveConfirm }) {
  const title = TEXTS.panel.formTitle[draft.editing ? "edit" : "create"];
  // Esc — «Остаться»: черновик и форма на месте.
  return (
    <PanelContainer title={title} onClose={confirm.onStay} layout={layout} returnFocusRef={returnFocusRef}>
      <LeaveDraftConfirm onStay={confirm.onStay} onLeave={confirm.onLeave} />
    </PanelContainer>
  );
}

function DraftPanel({
  draft,
  env,
  display,
  layout,
  returnFocusRef,
  selection,
  actions,
}: PanelModeProps & { draft: BookingDraft }) {
  const revision = useBookingDraftStore((state) => state.revision);
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const isEdit = draft.editing !== undefined;
  const isHidden = layout === "overlay" && selection.draftHidden;
  if (isHidden) return null;
  // Отмена правки возвращает к деталям брони, отмена новой брони — к пустой панели (T06, T10 §4.2а).
  const handleCancel = () => {
    clearDraft();
    if (!isEdit) actions.onClose();
  };
  const formActions = {
    onSaved: actions.onBookingSaved,
    onDateChange: actions.onDraftDateChange,
    onNotFound: actions.onBookingMissing,
    onCancel: handleCancel,
    // «Назад к календарю» в правке — та же отмена: спрятанная правка закрыла бы сетку пустой панелью.
    onBack: isEdit ? handleCancel : actions.onHideDraft,
  };
  // Новый интервал из сетки пересоздаёт форму с его значениями (`revision`), название сохраняется.
  return (
    <BookingFormPanel
      key={revision}
      draft={draft}
      env={env}
      display={display}
      layout={layout}
      returnFocusRef={returnFocusRef}
      actions={formActions}
    />
  );
}

function NoTimePanel({ actions, layout, returnFocusRef }: BookingPanelProps) {
  const closeButton = <CloseButton onClose={actions.onClose} />;
  return (
    <PanelContainer
      title={TEXTS.panel.formTitle.create}
      onClose={actions.onClose}
      footer={closeButton}
      layout={layout}
      returnFocusRef={returnFocusRef}
    >
      <Notice variant="neutral">{TEXTS.form.noFreeTime}</Notice>
    </PanelContainer>
  );
}

/** Панель без черновика — по выбранной брони: «Пусто», «Не найдена» или «Бронь» (SPEC §6.3). */
function SelectionPanel({ selection, actions, env, display, layout, returnFocusRef }: PanelModeProps) {
  const current = selection.current;
  switch (current.kind) {
    case "none":
      return <EmptyPanel layout={layout} focusOnMount={selection.focusEmpty} />;
    case "notFound":
      return (
        <NotFoundPanel
          title={current.title}
          onClose={actions.onClose}
          layout={layout}
          returnFocusRef={returnFocusRef}
        />
      );
    case "booking": {
      const detailsActions = {
        onClose: actions.onClose,
        onDeleted: actions.onBookingDeleted,
        onNotFound: actions.onBookingMissing,
      };
      return (
        <BookingDetailsPanel
          booking={current.booking}
          env={env}
          display={display}
          layout={layout}
          returnFocusRef={returnFocusRef}
          successText={selection.successText}
          actions={detailsActions}
        />
      );
    }
    default:
      return assertNever(current);
  }
}

type NotFoundPanelProps = Pick<BookingPanelProps, "layout" | "returnFocusRef"> & {
  /** Название из последней известной версии брони, если она была. */
  title: string | undefined;
  onClose: () => void;
};

function NotFoundPanel({ title, onClose, layout, returnFocusRef }: NotFoundPanelProps) {
  const closeButton = <CloseButton onClose={onClose} />;
  const panelTitle = title ?? TEXTS.panel.notFound;
  return (
    <PanelContainer
      title={panelTitle}
      onClose={onClose}
      footer={closeButton}
      layout={layout}
      returnFocusRef={returnFocusRef}
    >
      <Notice variant="neutral">{TEXTS.panel.notFound}</Notice>
    </PanelContainer>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Button variant="text" onClick={onClose}>
      {TEXTS.common.close}
    </Button>
  );
}

/** «Пусто» справа от сетки; поверх сетки не показывается. После удаления получает фокус (SPEC §12). */
function EmptyPanel({ layout, focusOnMount }: { layout: PanelLayout; focusOnMount: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  if (layout === "overlay") return null;
  return (
    <aside ref={ref} tabIndex={-1} className="w-90 shrink-0 border-l border-grey-20 bg-white p-6 focus:outline-none">
      <PanelEmpty />
    </aside>
  );
}

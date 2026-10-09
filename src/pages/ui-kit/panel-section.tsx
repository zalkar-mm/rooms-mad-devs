import type { ReactNode } from "react";

import { Pencil, Trash2 } from "lucide-react";

import { PanelContainer, type PanelLayout } from "@/widgets/booking-panel/ui/panel-container";
import { PanelEmpty } from "@/widgets/booking-panel/ui/panel-empty";

import { FormStatus } from "@/features/booking-form/ui/form-status";
import { DeleteConfirm } from "@/features/delete-booking/ui/delete-confirm";
import { LeaveDraftConfirm } from "@/features/leave-draft/ui/leave-draft-confirm";

import { BookingDetails } from "@/entities/booking/ui/booking-details";

import { TEXTS } from "@/shared/consts/texts";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";

import { BookingFormDemo } from "./booking-form-demo";
import { KitCase } from "./kit-case";
import { KitSection } from "./kit-section";
import { noop } from "./ui-kit.fixtures";

const DELETE_TEXT = TEXTS.panel.deleteQuestion("Созвон", "7 октября", "10:00–11:00");

const closeButton = (
  <Button variant="text" onClick={noop}>
    {TEXTS.common.close}
  </Button>
);

const futureFooter = (
  <>
    <Button variant="danger" iconLeft={Trash2} onClick={noop}>
      {TEXTS.panel.delete}
    </Button>
    <Button variant="secondary" iconLeft={Pencil} onClick={noop}>
      {TEXTS.panel.edit}
    </Button>
    {closeButton}
  </>
);

type DemoPanelProps = {
  label: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  layout?: PanelLayout;
};

/** Панель в рамке фиксированной высоты; фокус при монтировании не забирает — панелей на странице много. */
function DemoPanel({ label, title, children, footer, layout = "side" }: DemoPanelProps) {
  return (
    <KitCase label={label}>
      <div className="relative flex h-140 max-w-full border border-grey-20 bg-grey-10">
        <PanelContainer title={title} onClose={noop} footer={footer} layout={layout} focusOnOpen={false}>
          {children}
        </PanelContainer>
      </div>
    </KitCase>
  );
}

const PAST_TIME_TEXT = TEXTS.pastTime("14:30");

export function PanelSection() {
  return (
    <>
      <PanelBasicCases />
      <PanelFormCases />
      <PanelQuestionCases />
      <PanelOverlayCases />
    </>
  );
}

function PanelBasicCases() {
  return (
    <KitSection title="Панель: пусто и бронь">
      <DemoPanel label="пусто" title={TEXTS.panel.formTitle.create}>
        <PanelEmpty />
      </DemoPanel>
      <DemoPanel label="бронь · будущая, после создания" title="Созвон" footer={futureFooter}>
        <BookingDetails
          dateText="Ср, 7 октября"
          timeText="10:00–11:00"
          durationText="1 ч"
          status="future"
          success={TEXTS.panel.savedText.created}
        />
      </DemoPanel>
      <DemoPanel label="бронь · прошедшая" title="Планирование" footer={closeButton}>
        <BookingDetails
          dateText="Пн, 5 октября"
          timeText="09:00–10:00"
          durationText="1 ч"
          status="past"
          note={TEXTS.panel.pastLocked}
        />
      </DemoPanel>
      <DemoPanel label="бронь · идёт" title="Созвон" footer={closeButton}>
        <BookingDetails
          dateText="Ср, 7 октября"
          timeText="10:00–11:30"
          durationText="1 ч 30 мин"
          status="ongoing"
          note={TEXTS.panel.ongoingLocked}
        />
      </DemoPanel>
    </KitSection>
  );
}

function PanelFormCases() {
  return (
    <KitSection title="Панель: форма">
      <DemoPanel label="новая бронь" title={TEXTS.panel.formTitle.create}>
        <BookingFormDemo mode="create" />
      </DemoPanel>
      <DemoPanel label="409: сообщение, значения на месте" title={TEXTS.panel.formTitle.create}>
        <BookingFormDemo mode="create" initialTitle="Созвон" status={<FormStatus kind="conflict" onRetry={noop} />} />
      </DemoPanel>
      <DemoPanel label="ошибка поля, «Сохранить» недоступна" title={TEXTS.panel.formTitle.create}>
        <BookingFormDemo mode="create" titleError={TEXTS.errors.TITLE_REQUIRED} submitDisabled />
      </DemoPanel>
      <DemoPanel label="отправка" title={TEXTS.panel.formTitle.create}>
        <BookingFormDemo mode="create" initialTitle="Встреча" submitting />
      </DemoPanel>
      <DemoPanel label="правка без изменений" title={TEXTS.panel.formTitle.edit}>
        <BookingFormDemo mode="edit" initialTitle="Встреча" submitDisabled />
      </DemoPanel>
      <DemoPanel label="сбой сети / 5xx" title={TEXTS.panel.formTitle.create}>
        <BookingFormDemo mode="create" initialTitle="Встреча" status={<FormStatus kind="failure" onRetry={noop} />} />
      </DemoPanel>
      <DemoPanel label="422 без поля" title={TEXTS.panel.formTitle.edit}>
        <BookingFormDemo
          mode="edit"
          initialTitle="Встреча"
          status={<FormStatus kind="validation" serverText={PAST_TIME_TEXT} onRetry={noop} />}
        />
      </DemoPanel>
      <DemoPanel label="нет свободного времени" title={TEXTS.panel.formTitle.create} footer={closeButton}>
        <Notice variant="neutral">{TEXTS.form.noFreeTime}</Notice>
      </DemoPanel>
    </KitSection>
  );
}

function PanelQuestionCases() {
  return (
    <KitSection title="Панель: удаление, не найдена, уход с черновиком">
      <DemoPanel label="удаление" title="Созвон">
        <DeleteConfirm text={DELETE_TEXT} onKeep={noop} onDelete={noop} />
      </DemoPanel>
      <DemoPanel label="удаление · отправка" title="Созвон">
        <DeleteConfirm text={DELETE_TEXT} onKeep={noop} onDelete={noop} deleting />
      </DemoPanel>
      <DemoPanel label="после удаления" title={TEXTS.panel.formTitle.create}>
        <div className="flex flex-col gap-4">
          <Notice variant="success">{TEXTS.panel.deleted}</Notice>
          <PanelEmpty />
        </div>
      </DemoPanel>
      <DemoPanel label="не найдена (404)" title="Созвон" footer={closeButton}>
        <Notice variant="neutral">{TEXTS.panel.notFound}</Notice>
      </DemoPanel>
      <DemoPanel label="уход с черновиком" title={TEXTS.panel.formTitle.create}>
        <LeaveDraftConfirm onStay={noop} onLeave={noop} />
      </DemoPanel>
    </KitSection>
  );
}

function PanelOverlayCases() {
  return (
    <KitSection title="Панель: overlay (< 1200)">
      <div className="w-full max-w-200">
        <DemoPanel label="поверх сетки, «Назад к календарю»" title="Созвон" footer={futureFooter} layout="overlay">
          <BookingDetails dateText="Ср, 7 октября" timeText="11:00–12:00" durationText="1 ч" status="future" />
        </DemoPanel>
      </div>
    </KitSection>
  );
}

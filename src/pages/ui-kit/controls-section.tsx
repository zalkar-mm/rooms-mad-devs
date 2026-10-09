import { useState } from "react";

import { ChevronLeft, Pencil, Trash2, X } from "lucide-react";

import { TEXTS } from "@/shared/consts/texts";
import { Button, type ButtonVariant } from "@/shared/ui/button";
import { ChipGroup } from "@/shared/ui/chip-group";
import { DatePicker } from "@/shared/ui/date-picker";
import { IconButton } from "@/shared/ui/icon-button";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Switch } from "@/shared/ui/switch";
import { TextField } from "@/shared/ui/text-field";
import { TimeSelect } from "@/shared/ui/time-select";

import { KitCase } from "./kit-case";
import { KitSection } from "./kit-section";
import {
  type CalendarView,
  DATE_BUTTON,
  DATE_FIELD,
  DATE_FIELD_WEEKEND,
  DATES,
  dateText,
  END_OPTIONS,
  KIT_BOOK_RANGE,
  KIT_SETTINGS,
  KIT_VIEW_RANGE,
  noop,
  START_OPTIONS,
  SUGGESTIONS,
  VIEW_OPTIONS,
} from "./ui-kit.fixtures";

const BUTTON_VARIANTS: { variant: ButtonVariant; text: string }[] = [
  { variant: "primary", text: TEXTS.panel.save },
  { variant: "secondary", text: TEXTS.panel.cancel },
  { variant: "danger", text: TEXTS.panel.delete },
  { variant: "text", text: TEXTS.common.close },
];

const FORCED_STATES = [
  { label: "default", state: undefined },
  { label: "hover", state: "hover" },
  { label: "focus", state: "focus" },
] as const;

const EMPTY_COUNTER = TEXTS.form.counter(0, KIT_SETTINGS.titleMaxLength);
const LONG_TITLE = "Очень длинное название встречи, которое не помещается в шестьдесят символов";
const LONG_COUNTER = TEXTS.form.counter(LONG_TITLE.length, KIT_SETTINGS.titleMaxLength);
const LONG_TITLE_ERROR = TEXTS.ruleErrors.TITLE_TOO_LONG(KIT_SETTINGS);
const TOO_LONG_ERROR = TEXTS.ruleErrors.TOO_LONG(KIT_SETTINGS);
const TWO_SUGGESTIONS = SUGGESTIONS.slice(0, 2);

export function ControlsSection() {
  return (
    <>
      <ButtonCases />
      <IconButtonCases />
      <ToggleCases />
      <TextFieldCases />
      <PickerCases />
    </>
  );
}

function ButtonCases() {
  return (
    <KitSection title="Button">
      {BUTTON_VARIANTS.map(({ variant, text }) =>
        FORCED_STATES.map(({ label, state }) => (
          <KitCase key={`${variant}-${label}`} label={`${variant} · ${label}`} state={state}>
            <Button variant={variant}>{text}</Button>
          </KitCase>
        )),
      )}
      <KitCase label="primary · disabled">
        <Button disabled>{TEXTS.panel.save}</Button>
      </KitCase>
      <KitCase label="secondary · disabled">
        <Button variant="secondary" disabled>
          {TEXTS.panel.cancel}
        </Button>
      </KitCase>
      <KitCase label="text · disabled">
        <Button variant="text" disabled>
          {TEXTS.common.close}
        </Button>
      </KitCase>
      <KitCase label="primary · loading">
        <Button loading loadingText={TEXTS.panel.saving}>
          {TEXTS.panel.save}
        </Button>
      </KitCase>
      <KitCase label="primary tone=danger · loading">
        <Button tone="danger" loading loadingText={TEXTS.panel.deleting} iconLeft={Trash2}>
          {TEXTS.panel.delete}
        </Button>
      </KitCase>
      <KitCase label="md / lg + иконка">
        <div className="flex gap-2">
          <Button variant="secondary" size="md" iconLeft={Pencil}>
            {TEXTS.panel.edit}
          </Button>
          <Button size="lg">{TEXTS.calendar.book}</Button>
        </div>
      </KitCase>
    </KitSection>
  );
}

function IconButtonCases() {
  return (
    <KitSection title="IconButton">
      {FORCED_STATES.map(({ label, state }) => (
        <KitCase key={label} label={`outline · ${label}`} state={state}>
          <IconButton label={TEXTS.calendar.prev} icon={ChevronLeft} />
        </KitCase>
      ))}
      <KitCase label="ghost">
        <IconButton label={TEXTS.common.close} icon={X} variant="ghost" />
      </KitCase>
      <KitCase label="disabled">
        <IconButton label={TEXTS.calendar.prev} icon={ChevronLeft} disabled />
      </KitCase>
      <KitCase label="lg (44)">
        <IconButton label={TEXTS.calendar.prev} icon={ChevronLeft} size="lg" />
      </KitCase>
    </KitSection>
  );
}

function ToggleCases() {
  const [view, setView] = useState<CalendarView>("week");
  const [myTime, setMyTime] = useState(false);

  return (
    <KitSection title="SegmentedControl · Switch">
      {FORCED_STATES.map(({ label, state }) => (
        <KitCase key={label} label={`segmented · ${label}`} state={state}>
          <SegmentedControl label="Вид календаря" options={VIEW_OPTIONS} value={view} onChange={setView} />
        </KitCase>
      ))}
      <KitCase label="segmented · disabled">
        <SegmentedControl label="Вид календаря" options={VIEW_OPTIONS} value="day" onChange={noop} disabled />
      </KitCase>
      {FORCED_STATES.map(({ label, state }) => (
        <KitCase key={label} label={`switch · ${label}`} state={state}>
          <Switch label={TEXTS.calendar.myTime} checked={myTime} onCheckedChange={setMyTime} />
        </KitCase>
      ))}
      <KitCase label="switch · вкл / disabled">
        <div className="flex gap-4">
          <Switch label={TEXTS.calendar.myTime} checked onCheckedChange={noop} />
          <Switch label={TEXTS.calendar.myTime} checked={false} onCheckedChange={noop} disabled />
        </div>
      </KitCase>
    </KitSection>
  );
}

function TextFieldCases() {
  const [title, setTitle] = useState("Созвон");
  const titleCounter = TEXTS.form.counter(title.length, KIT_SETTINGS.titleMaxLength);
  const handleTitleChange = (event: { target: { value: string } }) => {
    setTitle(event.target.value);
  };
  const handlePick = (text: string) => {
    setTitle(text);
  };

  return (
    <KitSection title="TextField · ChipGroup">
      <KitCase label="пустое" className="w-80">
        <TextField label={TEXTS.form.title} placeholder={TEXTS.form.titlePlaceholder} counter={EMPTY_COUNTER} />
      </KitCase>
      <KitCase label="заполненное + подсказки" className="w-80">
        <div className="flex flex-col gap-3">
          <TextField
            label={TEXTS.form.title}
            value={title}
            onChange={handleTitleChange}
            maxLength={60}
            counter={titleCounter}
          />
          <ChipGroup items={SUGGESTIONS} onPick={handlePick} />
        </div>
      </KitCase>
      <KitCase label="focus" state="focus" className="w-80">
        <TextField label={TEXTS.form.title} defaultValue="Встреча" />
      </KitCase>
      <KitCase label="error + счётчик сверх лимита" className="w-80">
        <TextField
          label={TEXTS.form.title}
          value={LONG_TITLE}
          onChange={noop}
          maxLength={60}
          counter={LONG_COUNTER}
          error={LONG_TITLE_ERROR}
        />
      </KitCase>
      <KitCase label="disabled" className="w-80">
        <TextField label={TEXTS.form.title} defaultValue="Созвон" disabled />
      </KitCase>
      <KitCase label="chips · hover / disabled">
        <div className="flex flex-col gap-3">
          <div data-state="hover">
            <ChipGroup items={TWO_SUGGESTIONS} onPick={noop} />
          </div>
          <ChipGroup items={TWO_SUGGESTIONS} onPick={noop} disabled />
        </div>
      </KitCase>
    </KitSection>
  );
}

function PickerCases() {
  const [start, setStart] = useState<string | undefined>("14:30");
  const [date, setDate] = useState<string>(DATES.today);
  const dateLabel = dateText(date);

  return (
    <KitSection title="TimeSelect · DatePicker">
      <KitCase label="default (откройте: недоступные зачёркнуты)" className="w-48">
        <TimeSelect label={TEXTS.form.start} value={start} options={START_OPTIONS} onChange={setStart} />
      </KitCase>
      <KitCase label="focus" state="focus" className="w-48">
        <TimeSelect label={TEXTS.form.end} value="15:00" options={END_OPTIONS} onChange={noop} />
      </KitCase>
      <KitCase label="error" className="w-48">
        <TimeSelect label={TEXTS.form.end} value="15:00" options={END_OPTIONS} onChange={noop} error={TOO_LONG_ERROR} />
      </KitCase>
      <KitCase label="disabled" className="w-48">
        <TimeSelect label={TEXTS.form.start} value="14:30" options={START_OPTIONS} onChange={noop} disabled />
      </KitCase>
      <KitCase label="date · field, book (выходные недоступны)" className="w-64">
        <DatePicker
          trigger={DATE_FIELD}
          mode="book"
          value={date}
          valueText={dateLabel}
          onChange={setDate}
          range={KIT_BOOK_RANGE}
        />
      </KitCase>
      <KitCase label="date · field, error" className="w-64">
        <DatePicker
          trigger={DATE_FIELD_WEEKEND}
          mode="book"
          value="2026-10-10"
          valueText="Сб, 10 октября"
          onChange={noop}
          range={KIT_BOOK_RANGE}
        />
      </KitCase>
      <KitCase label="date · button, view (выходные выбираются)">
        <DatePicker
          trigger={DATE_BUTTON}
          mode="view"
          value={DATES.today}
          valueText={DATES.todayText}
          onChange={noop}
          range={KIT_VIEW_RANGE}
        />
      </KitCase>
    </KitSection>
  );
}

import { DOM_IDS } from "@/shared/consts/dom-ids";
import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import { announce } from "@/shared/lib/announce";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Notice } from "@/shared/ui/notice";
import { RetryButton } from "@/shared/ui/retry-button";
import { ScreenMessage } from "@/shared/ui/screen-message";
import { Skeleton } from "@/shared/ui/skeleton";
import { SkipLink } from "@/shared/ui/skip-link";
import { Spinner } from "@/shared/ui/spinner";
import { StatusBadge, type StatusBadgeVariant } from "@/shared/ui/status-badge";

import { KitCase } from "./kit-case";
import { KitSection } from "./kit-section";
import { noop } from "./ui-kit.fixtures";

const SWATCHES = [
  { name: "accent", cn: "bg-accent" },
  { name: "accent-hover", cn: "bg-accent-hover" },
  { name: "accent-subtle", cn: "bg-accent-subtle" },
  { name: "danger", cn: "bg-danger" },
  { name: "danger-subtle", cn: "bg-danger-subtle" },
  { name: "success", cn: "bg-success" },
  { name: "success-subtle", cn: "bg-success-subtle" },
  { name: "grey-10", cn: "bg-grey-10" },
  { name: "grey-20", cn: "bg-grey-20" },
  { name: "grey-40", cn: "bg-grey-40" },
  { name: "grey-50", cn: "bg-grey-50" },
  { name: "grey-100", cn: "bg-grey-100" },
  { name: "bg-hatch", cn: "bg-hatch" },
];

const BADGES: StatusBadgeVariant[] = ["future", "ongoing", "past", "weekend", "today"];

const handleAnnounce = () => {
  announce(TEXTS.panel.savedText.created);
};

const retryButton = <RetryButton onRetry={noop} />;

export function FeedbackSection() {
  return (
    <>
      <TokenCases />
      <BadgeCases />
      <NoticeCases />
      <EmptyCases />
      <A11yCases />
    </>
  );
}

function TokenCases() {
  return (
    <KitSection title="Токены">
      {SWATCHES.map((swatch) => (
        <KitCase key={swatch.name} label={swatch.name}>
          <Swatch tone={swatch.cn} />
        </KitCase>
      ))}
      <KitCase label="caption / small / body / title">
        <div className="flex flex-col gap-1 tabular-nums">
          <span className="text-caption">10:00 Созвон</span>
          <span className="text-small">10:00–11:00</span>
          <span className="text-body">Ср, 7 октября</span>
          <span className="text-title">Переговорная 1</span>
        </div>
      </KitCase>
      <KitCase label="shadow-1 / shadow-2">
        <div className="flex gap-4">
          <div className="size-16 rounded-m bg-white shadow-1" />
          <div className="size-16 rounded-m bg-white shadow-2" />
        </div>
      </KitCase>
    </KitSection>
  );
}

function BadgeCases() {
  return (
    <KitSection title="StatusBadge · Spinner">
      {BADGES.map((variant) => (
        <KitCase key={variant} label={variant}>
          <StatusBadge variant={variant} />
        </KitCase>
      ))}
      <KitCase label="spinner">
        <Spinner />
      </KitCase>
    </KitSection>
  );
}

function NoticeCases() {
  return (
    <KitSection title="Notice">
      <KitCase label="neutral" className="w-full max-w-120">
        <Notice variant="neutral">{TEXTS.panel.pastLocked}</Notice>
      </KitCase>
      <KitCase label="warning (409)" className="w-full max-w-120">
        <Notice variant="warning">{TEXTS.errors.CONFLICT}</Notice>
      </KitCase>
      <KitCase label="error + действие" className="w-full max-w-120">
        <Notice variant="error" action={retryButton}>
          {TEXTS.errors.NETWORK}
        </Notice>
      </KitCase>
      <KitCase label="success" className="w-full max-w-120">
        <Notice variant="success">{TEXTS.panel.deleted}</Notice>
      </KitCase>
    </KitSection>
  );
}

function EmptyCases() {
  return (
    <KitSection title="EmptyState · Skeleton · ScreenMessage">
      <KitCase label="empty" className="w-80">
        <EmptyState text={TEXTS.rooms.empty} />
      </KitCase>
      <KitCase label="overlay поверх сетки" className="w-80">
        <div className="relative h-48 bg-hatch">
          <EmptyState overlay text={TEXTS.calendar.emptyDay} />
        </div>
      </KitCase>
      <KitCase label="skeleton" className="w-48">
        <div aria-busy="true" className="flex flex-col gap-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </KitCase>
      <KitCase label="screen message" className="w-full max-w-120">
        <div className="border border-grey-20 bg-white">
          <ScreenMessage
            className="min-h-0"
            text={TEXTS.errors.ROOM_NOT_FOUND}
            action={<Button href={ROUTES.ROOMS}>{TEXTS.common.allRooms}</Button>}
          />
        </div>
      </KitCase>
      <KitCase label="screen message · настройки" className="w-full max-w-120">
        <div className="border border-grey-20 bg-white">
          <ScreenMessage className="min-h-0" text={TEXTS.calendar.settingsFailed} action={retryButton} />
        </div>
      </KitCase>
    </KitSection>
  );
}

function A11yCases() {
  return (
    <KitSection title="SkipLink · LiveRegion">
      <KitCase label="skip link · focus" state="focus" className="w-80">
        <div className="relative h-16 transform-gpu border border-dashed border-grey-20">
          <SkipLink targetId={DOM_IDS.calendarGrid}>{TEXTS.calendar.skipToCalendar}</SkipLink>
        </div>
      </KitCase>
      <KitCase label="announce() → live region (слышно в читалке)">
        <Button variant="secondary" onClick={handleAnnounce}>
          Объявить «{TEXTS.panel.savedText.created}»
        </Button>
      </KitCase>
    </KitSection>
  );
}

function Swatch({ tone }: { tone: string }) {
  const swatchCn = cn("size-12 rounded-m border border-grey-20", tone);
  return <div className={swatchCn} />;
}

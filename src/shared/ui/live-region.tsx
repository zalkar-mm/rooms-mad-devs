import { useSyncExternalStore } from "react";

import { getAnnouncements, subscribeAnnouncements } from "../lib/announce";

/** Невидимые live-регионы для `announce()`. Монтируется один раз в `app/app.tsx`. */
export function LiveRegion() {
  const announcements = useSyncExternalStore(subscribeAnnouncements, getAnnouncements);

  return (
    <div className="sr-only">
      <div role="status" aria-live="polite" aria-atomic="true">
        {announcements.polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {announcements.assertive}
      </div>
    </div>
  );
}

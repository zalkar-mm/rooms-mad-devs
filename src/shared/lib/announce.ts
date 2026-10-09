export type AnnouncePriority = "polite" | "assertive";

export type Announcements = Record<AnnouncePriority, string>;

/** Регион очищается, и текст пишется после паузы: так читалка объявляет и повтор той же фразы. */
const REANNOUNCE_DELAY_MS = 100;

let announcements: Announcements = { polite: "", assertive: "" };
const listeners = new Set<() => void>();
const timers: Partial<Record<AnnouncePriority, ReturnType<typeof setTimeout>>> = {};

function write(priority: AnnouncePriority, text: string) {
  announcements = { ...announcements, [priority]: text };
  listeners.forEach((listener) => {
    listener();
  });
}

/** Объявляет текст читалке через `<LiveRegion />` без перевода фокуса (docs/ui.md §7). */
export function announce(text: string, priority: AnnouncePriority = "polite") {
  clearTimeout(timers[priority]);
  write(priority, "");
  timers[priority] = setTimeout(() => {
    write(priority, text);
  }, REANNOUNCE_DELAY_MS);
}

export function subscribeAnnouncements(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAnnouncements() {
  return announcements;
}

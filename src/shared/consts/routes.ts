export const ROUTES = {
  ROOMS: "/",
  ROOM_PATTERN: "/rooms/:roomId",
  ROOM: (roomId: string) => `/rooms/${roomId}`,
  UI_KIT: "/ui-kit",
} as const;

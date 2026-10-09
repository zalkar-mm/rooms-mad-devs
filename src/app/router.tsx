import type { ComponentType } from "react";

import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { ROUTES } from "@/shared/consts/routes";

type PageModule = { default: ComponentType };

const toRoute = (module: PageModule) => ({ Component: module.default });

/** Пока грузится ленивая страница первого захода, ничего не рисуем. Без него react-router предупреждает в консоли. */
function HydrateFallback() {
  return null;
}

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [{ path: ROUTES.UI_KIT, lazy: () => import("@/pages/ui-kit/ui-kit.page").then(toRoute) }]
  : [];

export const router = createBrowserRouter([
  {
    HydrateFallback,
    children: [
      { path: ROUTES.ROOMS, lazy: () => import("@/pages/rooms/rooms.page").then(toRoute) },
      { path: ROUTES.ROOM_PATTERN, lazy: () => import("@/pages/room/room.page").then(toRoute) },
      ...devRoutes,
      { path: "*", element: <Navigate to={ROUTES.ROOMS} replace /> },
    ],
  },
]);

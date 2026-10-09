import { lazy, Suspense } from "react";

import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { RouterProvider } from "react-router";

import { env } from "@/shared/config/env";
import { Gate } from "@/shared/ui/gate";
import { LiveRegion } from "@/shared/ui/live-region";
import { Toaster } from "@/shared/ui/toaster";

import { QueryProvider } from "./providers/query-provider";
import { router } from "./router";

// Служебная панель mock API грузится отдельным чанком и только в режиме mock (docs/mocks.md §5).
const MockPanel = lazy(() => import("@/mocks/ui/mock-panel"));

export function App() {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
      <Toaster />
      <LiveRegion />
      <Gate when={env.VITE_API_MOCK}>
        <Suspense>
          <MockPanel />
        </Suspense>
      </Gate>
    </QueryProvider>
  );
}

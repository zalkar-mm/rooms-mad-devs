import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { env } from "@/shared/config/env";

import { App } from "./app";

import "./index.css";

async function enableMocks() {
  if (!env.VITE_API_MOCK) return;
  const { worker } = await import("@/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

function renderApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element #root not found");

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Воркер не стартовал — запросы уходят в сеть и экраны показывают свою ошибку загрузки настроек.
void enableMocks()
  .catch((error: unknown) => {
    console.error("[MSW] Failed to start mock API worker", error);
  })
  .then(renderApp);

import { HttpResponse } from "msw";

import { useMockControls } from "../controls";

/** Флаг «сбой на следующий запрос» (docs/mocks.md §5): отвечает `503` один раз и сбрасывается. */
export function takeFailNext(): Response | null {
  const controls = useMockControls.getState();
  if (!controls.failNext) return null;
  controls.setFailNext(false);
  return new HttpResponse(null, { status: 503 });
}

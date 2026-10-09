import { useState } from "react";

import { FlaskConical, X } from "lucide-react";

import { Gate } from "@/shared/ui/gate";
import { IconButton } from "@/shared/ui/icon-button";
import { Switch } from "@/shared/ui/switch";

import { useMockControls } from "../controls";

/**
 * Служебная панель mock API (docs/mocks.md §5): свёрнута в угол, подписи служебные. Только при
 * `VITE_API_MOCK=true`; к продуктовому интерфейсу не относится.
 */
export default function MockPanel() {
  const [open, setOpen] = useState(false);
  const { conflictNext, failNext, setConflictNext, setFailNext } = useMockControls();

  const toggleIcon = open ? X : FlaskConical;

  const handleToggle = () => {
    setOpen((value) => !value);
  };

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col items-start gap-2 md:bottom-4">
      <Gate when={open}>
        <div className="flex flex-col gap-1 rounded-m border border-grey-20 bg-white px-4 py-2 shadow-2">
          <p className="text-caption text-grey-50">Mock API — на один запрос</p>
          <Switch label="Конфликт 409 при сохранении" checked={conflictNext} onCheckedChange={setConflictNext} />
          <Switch label="Сбой 503 на следующий запрос" checked={failNext} onCheckedChange={setFailNext} />
        </div>
      </Gate>
      <IconButton label="Mock API" icon={toggleIcon} onClick={handleToggle} className="shadow-1" />
    </div>
  );
}

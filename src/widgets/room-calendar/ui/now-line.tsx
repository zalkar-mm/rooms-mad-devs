export type NowLineProps = {
  /** Позиция в px от верха колонки — считает родитель. */
  top: number;
};

/** Линия «сейчас» на сегодняшней колонке: поверх слотов, под бронями. Вне рабочих часов родитель её не рендерит. */
export function NowLine({ top }: NowLineProps) {
  const position = { top };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-10 h-0.5 -translate-y-1/2 bg-danger"
      style={position}
    >
      <span className="absolute top-1/2 left-0 size-2 -translate-1/2 rounded-full bg-danger" />
    </div>
  );
}

import { useEffect, useState, type RefObject } from "react";

const MIN_CARD_WIDTH = 220;
const GAP = 16;

export function useResponsiveColumns(ref: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setColumns(Math.max(1, Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return columns;
}

import { useEffect, useRef, useState } from 'react';

// keeps a dynamic element visible for lingerMs after it becomes inactive, fading it out
// smoothly at the end instead of an abrupt disappearance. With activateMs, a hidden element only
// appears once active has held that long, so brief blips don't pop it up (and then linger)
export function useLingering(
  active: boolean,
  lingerMs: number,
  activateMs = 0,
): { visible: boolean; fading: boolean } {
  const [visible, setVisible] = useState(active && activateMs <= 0);
  const [fading, setFading] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    if (active) {
      setFading(false);
      if (visibleRef.current || activateMs <= 0) {
        setVisible(true);
        return undefined;
      }
      const activateTimer = setTimeout(() => setVisible(true), activateMs);
      return () => clearTimeout(activateTimer);
    }
    if (!visibleRef.current) return undefined;

    const fadeLeadMs = Math.min(600, lingerMs);
    const fadeTimer = setTimeout(() => setFading(true), Math.max(0, lingerMs - fadeLeadMs));
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, lingerMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [active, lingerMs, activateMs]);

  return { visible, fading };
}

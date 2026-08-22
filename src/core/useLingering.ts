import { useEffect, useRef, useState } from 'react';

// keeps a dynamic element visible for lingerMs after it becomes inactive, fading it out
// smoothly at the end instead of an abrupt disappearance
export function useLingering(active: boolean, lingerMs: number): { visible: boolean; fading: boolean } {
  const [visible, setVisible] = useState(active);
  const [fading, setFading] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    if (active) {
      setFading(false);
      setVisible(true);
      return undefined;
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
  }, [active, lingerMs]);

  return { visible, fading };
}

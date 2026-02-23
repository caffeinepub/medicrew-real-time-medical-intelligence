import { useEffect, useState } from 'react';

/**
 * Custom hook that provides visibility-aware polling intervals for React Query.
 * Automatically pauses polling when the browser tab is inactive and resumes when active.
 * 
 * @param interval - The polling interval in milliseconds when tab is active
 * @returns The dynamic interval value (interval when visible, false when hidden)
 */
export function useVisibilityPolling(interval: number): number | false {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible ? interval : false;
}

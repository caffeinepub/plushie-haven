import { useEffect, useRef, useCallback, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes before timeout

/**
 * Hook for managing session timeout with automatic logout after inactivity.
 */
export function useSessionTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const { identity, clear } = useInternetIdentity();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeoutMs);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    setShowWarning(false);
    await clear();
    // The clear function will handle cache clearing and navigation
  }, [clear]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    clearTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();
    setRemainingTime(timeoutMs);

    // Store last activity in sessionStorage
    sessionStorage.setItem('lastActivity', lastActivityRef.current.toString());

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, timeoutMs - WARNING_THRESHOLD_MS);

    // Set logout timer
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [isAuthenticated, timeoutMs, clearTimers, handleTimeout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    // Check if session expired while page was closed
    const lastActivity = sessionStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > timeoutMs) {
        handleTimeout();
        return;
      }
    }

    // Initialize timer
    resetTimer();

    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only reset if more than 1 second has passed (debounce)
      if (timeSinceLastActivity > 1000) {
        resetTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Update remaining time every second when warning is shown
    let intervalId: NodeJS.Timeout | null = null;
    if (showWarning) {
      intervalId = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = Math.max(0, timeoutMs - elapsed);
        setRemainingTime(remaining);
      }, 1000);
    }

    return () => {
      clearTimers();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, timeoutMs, resetTimer, clearTimers, handleTimeout, showWarning]);

  return {
    showWarning,
    remainingTime,
    extendSession,
  };
}

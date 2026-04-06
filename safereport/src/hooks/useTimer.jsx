import { useState, useEffect, useCallback } from 'react';
import { getTimerSession, saveTimerSession, clearTimerSession, triggerTimerEmergency } from '../data/localStore';

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = getTimerSession();
    if (saved && saved.active) {
      if (Date.now() > saved.expiresAt) {
        // Already expired while app was closed
        triggerTimerEmergency(saved);
        setIsActive(false);
        setSession(null);
      } else {
        setSession(saved);
        setIsActive(true);
      }
    }
  }, []);

  // Timer Countdown logic
  useEffect(() => {
    if (!isActive || !session) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        // Timer Expired!
        triggerTimerEmergency(session);
        setIsActive(false);
        setSession(null);
        window.location.reload(); // Refresh to show the new SOS report
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, session]);

  const startTimer = useCallback(async (durationMinutes, location = {}) => {
    const sessionId = `timer_${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = Date.now() + durationMinutes * 60000;
    
    const newSession = {
      sessionId,
      durationMinutes,
      expiresAt,
      lat: location.lat || 13.0418,
      lng: location.lng || 80.2341,
      area: location.area || 'T. Nagar',
      active: true,
    };

    // 1. Try Backend
    try {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      const data = await res.json();
      if (data.success) {
        newSession.expiresAt = data.expiresAt; // Use server time if possible
      }
    } catch (err) {
      console.warn('Backend timer start failed, using LocalStorage only.');
    }

    // 2. Save Locally
    saveTimerSession(newSession);
    setSession(newSession);
    setIsActive(true);
  }, []);

  const stopTimer = useCallback(async () => {
    if (!session) return;

    // 1. Try Backend
    try {
      await fetch('/api/timer/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
    } catch (err) {
      console.warn('Backend timer stop failed.');
    }

    // 2. Clear Locally
    clearTimerSession();
    setIsActive(false);
    setSession(null);
  }, [session]);

  return {
    isActive,
    timeLeft,
    session,
    startTimer,
    stopTimer,
  };
}

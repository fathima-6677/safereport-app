import React, { useState, useEffect, useCallback } from 'react';
import { IconClock, IconAlert, IconShield } from './Icons';

const TIMER_PRESETS = [
  { label: 'Short Walk', mins: 5 },
  { label: 'Commute', mins: 15 },
  { label: 'Late Journey', mins: 30 },
  { label: 'Custom', mins: 60 }
];

export default function SafetyTimer() {
  const [isActive, setIsActive] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId] = useState(() => localStorage.getItem('timerSessionId') || `timer_${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    localStorage.setItem('timerSessionId', sessionId);
  }, [sessionId]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/timer/status/${sessionId}`);
      const data = await res.json();
      if (data.active) {
        setIsActive(true);
        setExpiresAt(data.expiresAt);
      }
    } catch (err) {
      console.error('Timer status check failed:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!isActive || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsActive(false);
        // Server will auto-trigger SOS
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, expiresAt]);

  const startTimer = async (mins) => {
    try {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          durationMinutes: mins,
          // In a real app, we'd pass user's current GPS here
          lat: 13.0418, 
          lng: 80.2341,
          area: 'T. Nagar'
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsActive(true);
        setExpiresAt(data.expiresAt);
      }
    } catch (err) {
      alert('Failed to start safety timer.');
    }
  };

  const stopTimer = async () => {
    try {
      await fetch('/api/timer/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      setIsActive(false);
      setExpiresAt(null);
    } catch (err) {
      console.error('Stop timer failed:', err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isActive) {
    const isUrgent = timeLeft < 60;
    return (
      <div className={`glass-card p-4 rounded-card border-l-4 ${isUrgent ? 'border-danger animate-pulse' : 'border-accent'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconClock className={isUrgent ? 'text-danger' : 'text-accent'} />
            <span className="text-[14px] font-bold text-txt">Virtual Escort Active</span>
          </div>
          <span className={`text-[16px] font-mono font-bold ${isUrgent ? 'text-danger' : 'text-accent'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <p className="text-[11px] text-txt-3 mb-3 leading-tight font-medium">
          Rift Flame monitoring active. If timer expires, an emergency SOS is triggered automatically.
        </p>
        <button 
          onClick={stopTimer}
          className="w-full py-2 bg-success text-white text-[12px] font-bold rounded-btn hover:bg-success/90 transition shadow-lg shadow-success/10"
        >
          Check-In (I'm Safe)
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-card border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <IconShield className="text-accent" />
        <span className="text-[14px] font-bold text-txt">Virtual Escort</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {TIMER_PRESETS.map((p) => (
          <button
            key={p.mins}
            onClick={() => startTimer(p.mins)}
            className="px-2 py-2 bg-white/5 text-txt-2 border border-white/5 rounded-btn text-[11px] font-medium hover:bg-white/10 hover:text-txt transition"
          >
            {p.label} ({p.mins}m)
          </button>
        ))}
      </div>
      <p className="text-[10px] text-txt-3 italic font-medium">
        Set a timer whenever walking alone. If it runs out, server-side SOS is triggered.
      </p>
    </div>
  );
}

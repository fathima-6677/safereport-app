import React, { useState } from 'react';
import { IconClock, IconShield } from './Icons';
import { useTimer } from '../hooks/useTimer';

const TIMER_PRESETS = [
  { label: 'Short Walk', mins: 5 },
  { label: 'Commute', mins: 15 },
  { label: 'Late Journey', mins: 30 },
  { label: 'Custom', mins: 60 }
];

export default function SafetyTimer() {
  const { isActive, timeLeft, startTimer, stopTimer } = useTimer();
  const [loading, setLoading] = useState(false);

  const startWithLocation = async (mins) => {
    setLoading(true);
    let location = { lat: 13.0418, lng: 80.2341, area: 'T. Nagar' }; // Default

    // Try Geo-location
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        area: 'My Location',
      };
    } catch {
      console.warn('Geolocation denied, using default.');
    }

    await startTimer(mins, location);
    setLoading(false);
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
            disabled={loading}
            onClick={() => startWithLocation(p.mins)}
            className="px-2 py-2 bg-white/5 text-txt-2 border border-white/5 rounded-btn text-[11px] font-medium hover:bg-white/10 hover:text-txt transition disabled:opacity-50"
          >
            {p.label} ({p.mins}m)
          </button>
        ))}
      </div>
      <p className="text-[10px] text-txt-3 italic font-medium">
        Set a timer when walking alone. If it runs out, server-side/local SOS is triggered.
      </p>
    </div>
  );
}


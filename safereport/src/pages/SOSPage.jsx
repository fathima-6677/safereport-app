import { useState, useRef, useEffect, useCallback } from 'react';
import { sosPing, sosStop } from '../utils/api';

export default function SOSPage() {
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [position, setPosition] = useState(null);
  const [pingCount, setPingCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const watchRef = useRef(null);
  const timerRef = useRef(null);
  const pingRef = useRef(null);
  const posRef = useRef(null);
  const sidRef = useRef(null);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startSOS = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    const sid = 'sos_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setSessionId(sid);
    sidRef.current = sid;
    setActive(true);
    setElapsed(0);
    setPingCount(0);

    // Get initial position and send first ping
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        posRef.current = loc;
        setPosition(loc);
        sosPing(sid, loc.lat, loc.lng).then((r) => setPingCount(r.pointCount || 1));
      },
      () => {},
      { enableHighAccuracy: true }
    );

    // Watch position continuously
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        posRef.current = loc;
        setPosition(loc);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    // Ping server every 30 seconds
    pingRef.current = setInterval(() => {
      const loc = posRef.current;
      const s = sidRef.current;
      if (loc && s) {
        sosPing(s, loc.lat, loc.lng).then((r) => setPingCount(r.pointCount || 0)).catch(() => {});
      }
    }, 30000);

    // Elapsed timer
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  const stopSOS = useCallback(() => {
    setActive(false);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    clearInterval(timerRef.current);
    clearInterval(pingRef.current);
    if (sidRef.current) sosStop(sidRef.current).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      clearInterval(timerRef.current);
      clearInterval(pingRef.current);
    };
  }, []);

  const trailUrl = sessionId ? `${window.location.origin}/sos/trail/${sessionId}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(trailUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg">
        <h1 className="font-serif text-[22px] text-txt font-normal">SOS Emergency</h1>
        <p className="text-[12px] text-txt-3 mt-0.5">One tap to start live GPS tracking and share your location trail</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-7 py-10">
        <div className="text-center max-w-[420px] w-full">
          {!active ? (
            /* ── Panic Button ── */
            <div className="fade-up">
              <div className="relative inline-flex items-center justify-center mb-8">
                {/* Pulse rings */}
                <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-danger/30 sos-pulse-ring" />
                <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-danger/20 sos-pulse-ring" style={{ animationDelay: '0.5s' }} />
                <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-danger/10 sos-pulse-ring" style={{ animationDelay: '1s' }} />

                <button
                  onClick={startSOS}
                  className="relative w-[160px] h-[160px] rounded-full bg-gradient-to-br from-[#ff4d6a] to-[#e8547a] text-white font-bold text-[28px] tracking-wider shadow-[0_0_40px_rgba(232,84,122,0.4)] hover:shadow-[0_0_60px_rgba(232,84,122,0.6)] hover:scale-105 transition-all duration-300 z-10 flex items-center justify-center"
                >
                  <div>
                    <svg className="w-10 h-10 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M2 2l20 20M8.5 7.5L2.5 21.5l6-2.5 6 2.5-1.5-3.5" />
                    </svg>
                    SOS
                  </div>
                </button>
              </div>

              <div className="text-[14px] text-txt-2 leading-relaxed">
                Press the button to start <strong className="text-txt">live GPS tracking</strong>.<br />
                Your location will be recorded every 30 seconds.
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-txt-3">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Encrypted · No personal data stored
              </div>
            </div>
          ) : (
            /* ── Active Tracking ── */
            <div className="fade-up">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-[140px] h-[140px] rounded-full bg-danger/10 animate-ping" />
                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#ff4d6a] to-[#e8547a] flex items-center justify-center shadow-[0_0_40px_rgba(232,84,122,0.5)] z-10">
                  <div className="text-white text-center">
                    <div className="text-[10px] uppercase tracking-widest font-medium opacity-80">Tracking</div>
                    <div className="text-[24px] font-bold font-mono">{formatTime(elapsed)}</div>
                  </div>
                </div>
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-bg-2 border border-brd rounded-card p-4">
                  <div className="text-[10px] text-txt-3 uppercase tracking-wider mb-1">Position</div>
                  <div className="text-[12px] text-txt font-mono">
                    {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'Acquiring...'}
                  </div>
                </div>
                <div className="bg-bg-2 border border-brd rounded-card p-4">
                  <div className="text-[10px] text-txt-3 uppercase tracking-wider mb-1">Pings Sent</div>
                  <div className="text-[20px] text-accent font-bold">{pingCount}</div>
                </div>
              </div>

              {/* Share trail */}
              {sessionId && (
                <div className="bg-bg-2 border border-brd rounded-card p-4 mb-5 text-left">
                  <div className="text-[10px] text-txt-3 uppercase tracking-wider mb-2">Share Trail Link</div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={trailUrl}
                      className="flex-1 bg-bg-3 border border-brd-2 rounded-btn text-[11px] text-txt font-mono px-3 py-2 outline-none"
                    />
                    <button
                      onClick={copyLink}
                      className="px-3 py-2 bg-accent text-white text-[11px] font-medium rounded-btn hover:bg-accent-2 transition-all"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* I'm Safe button */}
              <button
                onClick={stopSOS}
                className="w-full py-3.5 bg-success/15 text-success border border-success/30 rounded-btn text-[14px] font-semibold hover:bg-success/25 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                I'm Safe — Stop Tracking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

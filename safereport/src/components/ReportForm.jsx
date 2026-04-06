import { useState, useRef, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

const INCIDENT_TYPES = [
  'Verbal harassment',
  'Physical threat or assault',
  'Stalking or following',
  'Indecent exposure',
  'Poor lighting / dark area',
  'Unsafe infrastructure',
  'Other safety concern',
];

const TIME_OPTIONS = [
  'Early morning (5am–8am)',
  'Morning (8am–12pm)',
  'Afternoon (12pm–5pm)',
  'Evening (5pm–9pm)',
  'Night (9pm–12am)',
  'Late night (12am–5am)',
];

const AREAS = [
  'T. Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Tambaram',
  'Chromepet', 'Mylapore', 'Guindy', 'Nungambakkam', 'Egmore',
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ReportForm({ onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: '',
    timeOfDay: TIME_OPTIONS[0],
    description: '',
    area: '',
    lat: 13.0827,
    lng: 80.2707,
  });
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // ── Voice Recording State ──
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const detectKeywords = useCallback((text) => {
    const lower = text.toLowerCase();
    if (/harass|follow|shout/.test(lower)) {
      setFormData((p) => ({ ...p, incidentType: 'Verbal harassment' }));
    } else if (/dark|light/.test(lower)) {
      setFormData((p) => ({ ...p, incidentType: 'Poor lighting / dark area' }));
    } else if (/hit|assault|touch/.test(lower)) {
      setFormData((p) => ({ ...p, incidentType: 'Physical threat or assault' }));
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setFormData((p) => ({ ...p, description: transcript }));
      detectKeywords(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [isRecording, detectKeywords]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // Initialize mini map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [13.0827, 80.2707],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      const marker = L.marker([13.0827, 80.2707], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setFormData((prev) => ({ ...prev, lat: pos.lat, lng: pos.lng }));
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setFormData((prev) => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      });

      mapInstance.current = map;
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const setSeverity = (sev) => {
    setFormData((prev) => ({ ...prev, severity: sev }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude }));
      if (mapInstance.current) {
        mapInstance.current.setView([latitude, longitude], 15);
        markerRef.current?.setLatLng([latitude, longitude]);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.incidentType || !formData.severity) return;
    onSubmit({
      incidentType: formData.incidentType,
      severity: formData.severity,
      location: {
        lat: formData.lat,
        lng: formData.lng,
        area: formData.area || 'Unknown area',
      },
      timeOfDay: formData.timeOfDay,
      description: formData.description,
    });
  };

  const sevBtnClass = (sev) => {
    const base = 'flex-1 py-2 text-center rounded-btn cursor-pointer text-[12px] font-medium border transition-all duration-150';
    if (formData.severity === sev) {
      if (sev === 'low') return `${base} bg-success-bg text-success border-success/30`;
      if (sev === 'medium') return `${base} bg-warn-bg text-warn border-warn/30`;
      if (sev === 'high') return `${base} bg-danger-bg text-danger border-danger/30`;
    }
    return `${base} bg-bg-3 text-txt-2 border-brd-2 hover:bg-bg-4`;
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 max-w-[980px]">
      {/* Left — Form fields */}
      <div>
        {/* Privacy notice */}
        <div className="flex gap-2.5 items-start bg-sblue-bg border border-sblue/20 rounded-btn p-3 mb-5 text-[12px] text-sblue leading-relaxed">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>
          </svg>
          No account needed. No IP address logged. Reports are assigned a random ID only — nothing links back to you.
        </div>

        <div className="bg-bg-2 border border-brd rounded-card p-4 lg:p-6 shadow-xl">
          <div className="font-serif text-[15px] lg:text-[16px] text-txt mb-4 lg:mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Incident details
          </div>

          {/* Incident Type */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-medium text-txt-2 mb-1.5">Type of incident</label>
            <select
              value={formData.incidentType}
              onChange={(e) => setFormData((p) => ({ ...p, incidentType: e.target.value }))}
              className="form-select-dark w-full bg-bg-3 border border-brd-2 rounded-btn text-txt text-[13px] px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-bg transition"
              required
            >
              <option value="">Select a category...</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-medium text-txt-2 mb-1.5">Severity level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((s) => (
                <button key={s} type="button" onClick={() => setSeverity(s)} className={sevBtnClass(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-medium text-txt-2 mb-1.5">Time of day</label>
            <select
              value={formData.timeOfDay}
              onChange={(e) => setFormData((p) => ({ ...p, timeOfDay: e.target.value }))}
              className="form-select-dark w-full bg-bg-3 border border-brd-2 rounded-btn text-txt text-[13px] px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-bg transition"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Description + Voice */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11.5px] font-medium text-txt-2">
                Description <span className="font-normal text-txt-3">(optional — share only what you&apos;re comfortable with)</span>
              </label>
              {SpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-btn text-[11px] font-medium transition-all border ${
                    isRecording
                      ? 'bg-danger/15 text-danger border-danger/30'
                      : 'bg-bg-3 text-txt-2 border-brd-2 hover:bg-bg-4 hover:text-txt'
                  }`}
                >
                  {isRecording && <span className="w-2 h-2 rounded-full bg-danger recording-dot" />}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  {isRecording ? 'Stop' : 'Voice'}
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder={isRecording ? 'Listening... speak now' : 'Describe what happened...'}
                className={`w-full bg-bg-3 border rounded-btn text-txt text-[13px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent-bg transition resize-y min-h-[90px] leading-relaxed ${
                  isRecording ? 'border-danger/40 focus:border-danger' : 'border-brd-2 focus:border-accent'
                }`}
                maxLength={500}
              />
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-danger/15 text-danger text-[10px] font-medium px-2 py-0.5 rounded-full border border-danger/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger recording-dot" />
                  Recording...
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !formData.incidentType || !formData.severity}
            className="w-full py-3 text-[13px] font-medium bg-accent text-white rounded-btn hover:bg-accent-2 transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="loader"></span>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Submit anonymously'}
          </button>
        </div>
      </div>

      {/* Right — Location picker */}
      <div>
        <div className="bg-bg-2 border border-brd rounded-card p-4 lg:p-6 shadow-xl">
          <div className="font-serif text-[15px] lg:text-[16px] text-txt mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Pin the location
          </div>

          <div ref={mapRef} className="h-[220px] rounded-btn border border-brd-2 overflow-hidden mb-3"></div>

          <div className="mb-3">
            <label className="block text-[11.5px] font-medium text-txt-2 mb-1.5">Area / landmark</label>
            <div className="flex gap-2">
              <select
                value={formData.area}
                onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))}
                className="form-select-dark flex-1 bg-bg-3 border border-brd-2 rounded-btn text-txt text-[13px] px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-bg transition"
              >
                <option value="">Select area...</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="px-3 py-2.5 bg-bg-3 border border-brd-2 rounded-btn text-teal text-[12px] font-medium hover:bg-teal-bg hover:border-teal/30 transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                GPS
              </button>
            </div>
          </div>

          <div className="text-[11.5px] text-txt-3 leading-relaxed">
            Click on the map to pin the location. Coordinates are rounded to a 500m grid before saving — your precise location is never stored.
          </div>
        </div>
      </div>
    </form>
  );
}

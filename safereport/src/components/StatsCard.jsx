const colorMap = {
  accent: { bar: 'bg-accent', text: 'text-accent' },
  red: { bar: 'bg-danger', text: 'text-danger' },
  teal: { bar: 'bg-teal', text: 'text-teal' },
  gold: { bar: 'bg-gold', text: 'text-gold' },
};

export default function StatsCard({ label, value, subtitle, subtitleClass = '', color = 'accent' }) {
  const c = colorMap[color] || colorMap.accent;
  return (
    <div className="bg-bg-2 border border-brd rounded-card p-5 relative overflow-hidden fade-up">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${c.bar}`}></div>
      <div className="text-[11px] font-medium text-txt-3 uppercase tracking-wider mb-2">{label}</div>
      <div className="font-serif text-[32px] text-txt leading-none">{value}</div>
      {subtitle && (
        <div className={`text-[11px] mt-1.5 ${subtitleClass || 'text-txt-3'}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";

/**
 * TRIAGE_VERDICTS — sample data shape for each of the three scenarios.
 * Swap `activeScenario` below to preview Work / Spam / Personal.
 * In production, this object is what your classifier response should match.
 */
export const TRIAGE_VERDICTS = {
  work: {
    type: "work",
    category: "Approval Request",
    priority: "P1",
    priorityLabel: "Urgent",
    deadline: "Today, 5:00 PM",
    action: "Review Section 4.2, sign & return before deadline.",
    confidence: 96,
  },
  spam: {
    type: "spam",
    category: "Spam",
    threatLevel: "HIGH",
    threatIndicators: ["Sender Spoofing", "Suspicious Link", "Credential Request"],
    action: "Do not click any links. Move to quarantine.",
    confidence: 98,
  },
  personal: {
    type: "personal",
    category: "Personal",
    priority: "P3",
    priorityLabel: "Low",
    action: "No immediate response needed. Reply when free.",
    confidence: 91,
  },
};

const TYPE_STYLES = {
  work: {
    glow: "rgba(0,229,255,0.10)",
    ring: "border-[#00E5FF]/25",
    dot: "bg-[#00E5FF]",
    text: "text-[#00E5FF]",
    badgeBg: "bg-[#00E5FF]/10 border-[#00E5FF]/25 text-[#00E5FF]",
    label: "WORK EMAIL",
  },
  spam: {
    glow: "rgba(239,68,68,0.10)",
    ring: "border-red-500/25",
    dot: "bg-red-500",
    text: "text-red-400",
    badgeBg: "bg-red-500/10 border-red-500/25 text-red-400",
    label: "SPAM / PHISHING",
  },
  personal: {
    glow: "rgba(41,121,255,0.10)",
    ring: "border-[#2979FF]/25",
    dot: "bg-[#2979FF]",
    text: "text-[#7FB3FF]",
    badgeBg: "bg-[#2979FF]/10 border-[#2979FF]/25 text-[#7FB3FF]",
    label: "PERSONAL EMAIL",
  },
};

function ConfidenceRing({ score, color }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 900;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(ease * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#1A2744" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="32"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 32}`}
          strokeDashoffset={`${2 * Math.PI * 32 * (1 - displayed / 100)}`}
          style={{ transition: "stroke 0.3s", filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-['Space_Grotesk'] text-base font-bold text-white">{displayed}%</span>
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="font-mono text-[10px] text-[#4A6FA5] tracking-widest uppercase">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function PriorityPill({ level, label, colorClass, badgeBg }) {
  return (
    <span className={`font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${badgeBg}`}>
      {level} · {label.toUpperCase()}
    </span>
  );
}

/**
 * TriageVerdict
 * Glassmorphic verdict card that renders one of three layouts based on
 * verdict.type: "work" | "spam" | "personal".
 *
 * Props:
 *   verdict — object matching one of the shapes in TRIAGE_VERDICTS above
 */
export default function TriageVerdict({ verdict }) {
  if (!verdict) return null;
  const style = TYPE_STYLES[verdict.type] ?? TYPE_STYLES.work;
  const confidenceColor =
    verdict.type === "spam" ? "#EF4444" : verdict.type === "personal" ? "#2979FF" : "#00E5FF";

  return (
    <div
      className={`relative rounded-xl overflow-hidden border ${style.ring}
        bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150
        shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
    >
      {/* Ambient glow wash, glassmorphism signature */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 0%, ${style.glow}, transparent 60%)` }}
      />
      {/* Top hairline sheen */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="relative px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
        <span className={`font-mono text-xs tracking-widest ${style.text}`}>TRIAGE VERDICT</span>
        <span className={`ml-auto font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${style.badgeBg}`}>
          {style.label}
        </span>
      </div>

      {/* Body */}
      <div className="relative p-5">
        <div className="flex items-start gap-5">
          {/* Fields — differ per scenario */}
          <div className="flex-1 min-w-0">

            {/* WORK EMAIL */}
            {verdict.type === "work" && (
              <>
                <FieldRow label="Category">
                  <span className="text-sm font-['Space_Grotesk'] font-semibold text-white">{verdict.category}</span>
                </FieldRow>
                <FieldRow label="Priority">
                  <PriorityPill level={verdict.priority} label={verdict.priorityLabel} badgeBg={style.badgeBg} />
                </FieldRow>
                <FieldRow label="Deadline">
                  <span className="font-mono text-xs text-[#7DA5C5]">{verdict.deadline}</span>
                </FieldRow>
              </>
            )}

            {/* SPAM / PHISHING */}
            {verdict.type === "spam" && (
              <>
                <FieldRow label="Category">
                  <span className="text-sm font-['Space_Grotesk'] font-semibold text-white">{verdict.category}</span>
                </FieldRow>
                <FieldRow label="Threat Level">
                  <span className={`font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${style.badgeBg}`}>
                    {verdict.threatLevel}
                  </span>
                </FieldRow>
                <div className="py-2">
                  <span className="font-mono text-[10px] text-[#4A6FA5] tracking-widest uppercase block mb-2">
                    Threat Indicators
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {verdict.threatIndicators.map((indicator) => (
                      <span
                        key={indicator}
                        className="font-mono text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* PERSONAL EMAIL */}
            {verdict.type === "personal" && (
              <>
                <FieldRow label="Category">
                  <span className="text-sm font-['Space_Grotesk'] font-semibold text-white">{verdict.category}</span>
                </FieldRow>
                <FieldRow label="Priority">
                  <PriorityPill level={verdict.priority} label={verdict.priorityLabel} badgeBg={style.badgeBg} />
                </FieldRow>
              </>
            )}
          </div>

          {/* Confidence ring */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <ConfidenceRing score={verdict.confidence} color={confidenceColor} />
            <span className="font-mono text-[9px] text-[#3A5A7A] tracking-widest">CONFIDENCE</span>
          </div>
        </div>

        {/* Recommended action — shared across all scenarios */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="font-mono text-[10px] text-[#4A6FA5] tracking-widest uppercase block mb-1.5">
            Recommended Action
          </span>
          <p className={`text-sm leading-relaxed ${verdict.type === "spam" ? "text-red-300" : "text-[#E8F4FD]/90"}`}>
            {verdict.action}
          </p>
        </div>
      </div>
    </div>
  );
}

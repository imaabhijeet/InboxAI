import { useEffect, useState } from "react";

const TERMINAL_LINES = [
  { text: "> Initializing InboxAI triage agent...", delay: 0 },
  { text: "> Loading priority classification model v4.2...", delay: 600 },
  { text: "> Connecting to action recommendation engine...", delay: 1300 },
  { text: "> [✓] 47 emails categorized this hour", delay: 2000, highlight: true },
  { text: "> [✓] 9 deadlines extracted & flagged", delay: 2700, highlight: true },
  { text: "> [✓] Agent ready. Inbox under control.", delay: 3400, accent: true },
];

const STATS = [
  { value: "94%", label: "Triage Accuracy" },
  { value: "<0.4s", label: "Per-Email Speed" },
  { value: "3.1M+", label: "Emails Triaged Daily" },
];

function TerminalLine({ text, delay, highlight, accent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className={`font-mono text-xs sm:text-sm leading-relaxed transition-all duration-500
        ${accent ? "text-[#00E5FF] font-semibold" : highlight ? "text-[#7DD3FC]" : "text-[#4A6FA5]"}`}
    >
      {text}
      {accent && <span className="inline-block w-2 h-3.5 bg-[#00E5FF] ml-1 animate-pulse align-middle" />}
    </div>
  );
}

function ScanningEnvelope() {
  const [scanPos, setScanPos] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 2200;

    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setScanPos(progress * 100);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setScanDone(true);
      }
    };

    const t = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 800);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto">
      {/* Envelope body */}
      <div className="absolute inset-0 rounded-lg border border-[#1A2744] bg-[#0D1B2A] overflow-hidden">
        {/* Email lines */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 gap-2 opacity-40">
          <div className="h-1.5 bg-[#1A3A5C] rounded w-3/4" />
          <div className="h-1.5 bg-[#1A3A5C] rounded w-full" />
          <div className="h-1.5 bg-[#1A3A5C] rounded w-5/6" />
          <div className="h-1.5 bg-[#1A3A5C] rounded w-2/3" />
          <div className="h-1.5 bg-[#1A3A5C] rounded w-full" />
          <div className="h-1.5 bg-[#1A3A5C] rounded w-1/2" />
        </div>

        {/* Scanning beam */}
        {!scanDone && (
          <div
            className="absolute left-0 right-0 h-0.5 pointer-events-none"
            style={{ top: `${scanPos}%` }}
          >
            <div className="w-full h-full bg-[#00E5FF] opacity-90 shadow-[0_0_12px_3px_rgba(0,229,255,0.5)]" />
            <div className="absolute inset-x-0 -top-6 h-12 bg-gradient-to-b from-transparent via-[rgba(0,229,255,0.06)] to-transparent" />
          </div>
        )}

        {/* Triage badge — appears after scan */}
        {scanDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,15,30,0.6)]">
            <div className="border border-[#00E5FF]/60 bg-[#00E5FF]/10 rounded px-3 py-1.5 text-center">
              <div className="text-[#00E5FF] font-mono text-xs font-bold tracking-widest">★ P1 · URGENT ACTION</div>
              <div className="text-[#7DD3FC]/70 font-mono text-[10px] mt-0.5">Deadline in 2h · Reply required</div>
            </div>
          </div>
        )}
      </div>

      {/* Corner glow */}
      <div className="absolute -inset-px rounded-lg border border-[#00E5FF]/10 pointer-events-none" />
    </div>
  );
}

export default function HeroSection({ onGetStarted }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow top-left */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#2979FF] opacity-[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#00E5FF] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#00E5FF] to-[#2979FF] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3.5L7 8L13 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="1" y="3" width="12" height="8" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-lg tracking-tight text-white">
            Inbox<span className="text-[#00E5FF]">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#4A6FA5] font-medium">
          <a href="#analysis" className="hover:text-[#00E5FF] transition-colors">Analyze</a>
          <a href="#" className="hover:text-[#00E5FF] transition-colors">Dashboard</a>
          <a href="#" className="hover:text-[#00E5FF] transition-colors">History</a>
          <a href="#" className="hover:text-[#00E5FF] transition-colors">Docs</a>
        </div>

        <button className="text-xs font-mono tracking-wider border border-[#00E5FF]/40 text-[#00E5FF] px-4 py-2 rounded hover:bg-[#00E5FF]/10 transition-colors">
          REQUEST ACCESS
        </button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="inline-flex items-center gap-2 border border-[#00E5FF]/20 bg-[#00E5FF]/5 rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="font-mono text-[11px] text-[#00E5FF] tracking-widest uppercase">
                Triage Agent Online
              </span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-white mb-6">
              Your inbox is
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#2979FF]">
                  overwhelming.
                </span>
              </span>
              <br />
              <span className="text-[#E8F4FD]/80">We handle it first.</span>
            </h1>

            <p className="text-[#4A7FA5] text-base sm:text-lg leading-relaxed max-w-md mb-10">
              InboxAI reads every email the moment it lands — detecting priority, extracting deadlines,
              categorizing intent, and surfacing the actions that actually need you — in under 400ms.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onGetStarted}
                className="group relative px-7 py-3.5 bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#0A0F1E] font-['Space_Grotesk'] font-bold text-sm tracking-wide rounded overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              >
                <span className="relative z-10">Triage an Email →</span>
              </button>
              <button className="px-7 py-3.5 border border-[#1A2744] hover:border-[#00E5FF]/30 text-[#4A6FA5] hover:text-[#E8F4FD] font-['Space_Grotesk'] text-sm tracking-wide rounded transition-all">
                View Live Dashboard
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-12 pt-10 border-t border-[#1A2744]">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-['Space_Grotesk'] text-xl font-bold text-[#00E5FF]">{s.value}</div>
                  <div className="text-[#3A5A7A] text-xs mt-0.5 font-mono tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal + scan */}
          <div className={`transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="relative">
              {/* Terminal panel */}
              <div className="bg-[#0D1B2A] border border-[#1A2744] rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,229,255,0.04)]">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1A2744] bg-[#080D18]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-3 font-mono text-xs text-[#2A4A6A] tracking-widest">
                    inboxai — triage-agent
                  </span>
                </div>

                {/* Terminal body */}
                <div className="p-6 space-y-2 min-h-[160px]">
                  {TERMINAL_LINES.map((line, i) => (
                    <TerminalLine key={i} {...line} />
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-[#1A2744] mx-4" />

                {/* Email scan preview */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs text-[#2A4A6A] tracking-widest">LIVE TRIAGE</span>
                    <div className="flex-1 h-px bg-[#1A2744]" />
                  </div>
                  <ScanningEnvelope />
                </div>
              </div>

              {/* Floating triage card */}
              <div className="absolute -right-4 -bottom-4 bg-[#0D1B2A] border border-[#1A2744] rounded-lg px-4 py-3 hidden sm:block shadow-xl">
                <div className="font-mono text-[10px] text-[#2A4A6A] tracking-widest mb-1">LAST TRIAGED</div>
                <div className="font-['Space_Grotesk'] text-sm font-semibold text-white">Board Approval Request</div>
                <div className="font-mono text-xs text-[#00E5FF] mt-0.5">Just now · P1 · Due today 5 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0F1E] to-transparent pointer-events-none" />
    </section>
  );
}

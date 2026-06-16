import { useState, useRef, useEffect } from "react";
import TriageVerdict from "./TriageVerdict";

// ---- Rule-based classification keywords ----
const SPAM_KEYWORDS = [
  "verify account",
  "click the link",
  "password reset",
  "bank account",
  "gift card",
  "gift cards",
  "urgent action required",
  "account suspended",
  "login immediately",
];

const WORK_KEYWORDS = [
  "meeting",
  "project",
  "deadline",
  "report",
  "approval",
  "presentation",
  "client",
];

// Lightweight deadline phrase extraction (e.g. "by 5 PM today", "by Friday", "due tomorrow")
const DEADLINE_PATTERN = /\b((by|due|before)\s+(today|tomorrow|tonight|eod|end of day|[a-z]+day|\d{1,2}(:\d{2})?\s?(am|pm)|[a-z]+ \d{1,2}(st|nd|rd|th)?))/i;

/**
 * analyzeEmail — simple rule-based triage classifier.
 * Scans raw email text for keyword matches and returns a verdict object
 * in the same shape TriageVerdict expects (see TriageVerdict.jsx).
 */
function analyzeEmail(rawText) {
  const text = rawText.toLowerCase();

  const matchedSpamKeywords = SPAM_KEYWORDS.filter((kw) => text.includes(kw));
  const matchedWorkKeywords = WORK_KEYWORDS.filter((kw) => text.includes(kw));

  // 1. Spam / Phishing — checked first, takes priority over work signals
  if (matchedSpamKeywords.length > 0) {
    const confidence = Math.min(99, 95 + matchedSpamKeywords.length); // 95–99%
    return {
      type: "spam",
      category: "Spam / Phishing",
      threatLevel: "CRITICAL",
      threatIndicators: matchedSpamKeywords.map((kw) =>
        kw.replace(/\b\w/g, (c) => c.toUpperCase())
      ),
      action: "Mark as spam and avoid clicking links.",
      confidence,
    };
  }

  // 2. Work Email
  if (matchedWorkKeywords.length > 0) {
    const deadlineMatch = text.match(DEADLINE_PATTERN);
    const deadline = deadlineMatch ? deadlineMatch[0].replace(/\b\w/g, (c) => c.toUpperCase()) : "Not specified";
    const confidence = Math.min(96, 80 + matchedWorkKeywords.length * 3);
    return {
      type: "work",
      category: "Work",
      priority: "P1",
      priorityLabel: "High",
      deadline,
      action: "Prioritize and respond.",
      confidence,
      matchedKeywords: matchedWorkKeywords,
    };
  }

  // 3. Personal Email — fallback when no rules match
  return {
    type: "personal",
    category: "Personal",
    priority: "P3",
    priorityLabel: "Low",
    action: "Respond when convenient.",
    confidence: 85,
  };
}

/**
 * buildSignals — derives the "TRIAGE SIGNALS" list shown in the right panel
 * directly from the analysis verdict, so it always matches the verdict card.
 */
function buildSignals(verdict) {
  if (verdict.type === "spam") {
    return [
      { label: "Category: Spam / Phishing", risk: "CRIT", color: "red", icon: "⚠" },
      { label: `Threat Level: ${verdict.threatLevel}`, risk: "CRIT", color: "red", icon: "⚠" },
      ...verdict.threatIndicators.slice(0, 4).map((kw) => ({
        label: `Detected: "${kw}"`,
        risk: "FLAG",
        color: "red",
        icon: "▲",
      })),
    ];
  }

  if (verdict.type === "work") {
    return [
      { label: "Category: Work", risk: "WORK", color: "cyan", icon: "→" },
      { label: `Priority: ${verdict.priorityLabel}`, risk: verdict.priority, color: "cyan", icon: "★" },
      { label: `Deadline: ${verdict.deadline}`, risk: "DUE", color: "yellow", icon: "◷" },
      ...(verdict.matchedKeywords || []).slice(0, 3).map((kw) => ({
        label: `Keyword: "${kw}"`,
        risk: "MATCH",
        color: "cyan",
        icon: "✓",
      })),
    ];
  }

  // personal
  return [
    { label: "Category: Personal", risk: "P3", color: "yellow", icon: "→" },
    { label: "Priority: Low", risk: "LOW", color: "yellow", icon: "○" },
    { label: "No work or threat keywords found", risk: "INFO", color: "cyan", icon: "i" },
  ];
}

const SCAN_STEPS = [
  "Parsing email headers & metadata...",
  "Identifying sender context & VIP status...",
  "Detecting priority signals...",
  "Classifying email category & intent...",
  "Extracting deadlines & time references...",
  "Generating action recommendations...",
  "Building triage summary...",
];

const SAMPLE_EMAIL = `From: sarah.chen@partnerfirm.com
To: alex.morgan@company.com
Subject: Re: Q3 Partnership Agreement — Signature Needed by EOD

Hi Alex,

Following up on our call last Thursday. The legal team has finalized 
the Q3 partnership agreement and it's ready for your signature.

Per the terms we discussed, we need this signed and returned by 
5:00 PM today to meet the filing deadline with the state office.

Please review Section 4.2 regarding the revenue share amendment 
we agreed to, and confirm you're aligned before signing.

If you have any questions, I'm available on a quick call until 3 PM.

Best,
Sarah Chen
VP of Strategic Partnerships
PartnerFirm Inc.`;


function ScanProgress({ steps, currentStep, done }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep && !done;
        const isDone = i < currentStep || done;

        return (
          <div key={step} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
              ${isDone ? "bg-[#00E5FF]/20 border border-[#00E5FF]" : isActive ? "border border-[#00E5FF] animate-pulse" : "border border-[#1A2744]"}`}>
              {isDone && <span className="text-[#00E5FF] text-[8px]">✓</span>}
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] block" />}
            </div>
            <span className={`font-mono text-xs transition-colors duration-300
              ${isDone ? "text-[#00E5FF]/70" : isActive ? "text-[#00E5FF]" : "text-[#2A4A6A]"}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EmailAnalysisSection({ id, triggered }) {
  const [emailText, setEmailText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | scanning | results
  const [currentStep, setCurrentStep] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setCharCount(emailText.length);
  }, [emailText]);

  const runScan = () => {
    if (!emailText.trim()) return;
    setPhase("scanning");
    setCurrentStep(0);

    SCAN_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setCurrentStep(i + 1);
        if (i === SCAN_STEPS.length - 1) {
          setTimeout(() => {
            setVerdict(analyzeEmail(emailText));
            setPhase("results");
          }, 400);
        }
      }, (i + 1) * 420);
    });
  };

  const reset = () => {
    setPhase("idle");
    setCurrentStep(0);
    setEmailText("");
    setVerdict(null);
  };

  const loadSample = () => {
    setEmailText(SAMPLE_EMAIL);
    textareaRef.current?.focus();
  };

  return (
    <section id={id} className="relative py-24 px-6 sm:px-12">
      {/* Section label */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent" />
          <div>
            <div className="font-mono text-[11px] text-[#00E5FF] tracking-widest uppercase mb-1">
              AI Triage Engine
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white">
              Paste any email. Get your next action in seconds.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Email input panel (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-[#0D1B2A] border border-[#1A2744] rounded-xl overflow-hidden h-full flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A2744] bg-[#080D18]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span className="font-mono text-xs text-[#4A6FA5] tracking-widest">EMAIL INPUT</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#2A4A6A]">{charCount} chars</span>
                  <button
                    onClick={loadSample}
                    className="font-mono text-[10px] text-[#2979FF] hover:text-[#00E5FF] transition-colors tracking-wider"
                  >
                    LOAD SAMPLE
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="flex-1 p-1">
                <textarea
                  ref={textareaRef}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  disabled={phase !== "idle"}
                  placeholder={`Paste email content here...\n\nSubject, sender, body — paste everything.\nInboxAI will extract priority, deadlines & actions.`}
                  className="w-full h-full min-h-[360px] bg-transparent text-[#7DA5C5] font-mono text-xs sm:text-sm leading-relaxed
                    placeholder-[#1F3550] resize-none outline-none p-5
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Panel footer */}
              <div className="px-5 py-4 border-t border-[#1A2744] bg-[#080D18] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#2A4A6A] font-mono text-[10px]">
                  <span className="w-1 h-1 rounded-full bg-[#1A3A5C]" />
                  Supports: forwarded email, EML, plain text
                </div>
                <div className="flex gap-2">
                  {phase !== "idle" && (
                    <button
                      onClick={reset}
                      className="px-4 py-2 text-xs font-mono text-[#4A6FA5] hover:text-white border border-[#1A2744] hover:border-[#4A6FA5] rounded transition-all tracking-wider"
                    >
                      RESET
                    </button>
                  )}
                  <button
                    onClick={runScan}
                    disabled={!emailText.trim() || phase !== "idle"}
                    className="px-6 py-2 bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#0A0F1E] font-['Space_Grotesk'] font-bold text-sm rounded
                      hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {phase === "scanning" ? "Triaging..." : "Run Triage →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Scan status / results panel (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Scan progress */}
            <div className="bg-[#0D1B2A] border border-[#1A2744] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1A2744] bg-[#080D18]">
                <span className="font-mono text-xs text-[#4A6FA5] tracking-widest">TRIAGE PIPELINE</span>
              </div>
              <div className="p-5">
                {phase === "idle" ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-10 h-10 rounded-full border border-[#1A2744] flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="#2A4A6A" strokeWidth="1.5" />
                        <path d="m21 21-3.5-3.5" stroke="#2A4A6A" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="font-mono text-xs text-[#2A4A6A] leading-relaxed">
                      Paste email content<br />and run triage to begin.
                    </p>
                  </div>
                ) : (
                  <ScanProgress
                    steps={SCAN_STEPS}
                    currentStep={currentStep}
                    done={phase === "results"}
                  />
                )}
              </div>
            </div>

            {/* Results: Triage Verdict (computed from actual pasted email text) */}
            {phase === "results" && verdict && (
              <TriageVerdict verdict={verdict} />
            )}

            {/* Results: Triage signals — derived from the same verdict */}
            {phase === "results" && verdict && (
              <div className="bg-[#0D1B2A] border border-[#1A2744] rounded-xl overflow-hidden flex-1">
                <div className="px-5 py-3.5 border-b border-[#1A2744] bg-[#080D18]">
                  <span className="font-mono text-xs text-[#4A6FA5] tracking-widest">TRIAGE SIGNALS</span>
                </div>
                <div className="p-4 space-y-2">
                  {buildSignals(verdict).map((t, i) => (
                    <div
                      key={t.label}
                      className="flex items-center justify-between px-3 py-2 rounded border border-[#1A2744] hover:border-[#1A3A5C] transition-colors"
                      style={{
                        animationDelay: `${i * 80}ms`,
                        animation: "fadeSlideIn 0.4s ease both",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs ${t.color === "red" ? "text-red-400" : t.color === "cyan" ? "text-[#00E5FF]" : "text-yellow-400"}`}>
                          {t.icon}
                        </span>
                        <span className="font-mono text-xs text-[#7DA5C5]">{t.label}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded
                        ${t.color === "red"
                          ? "text-red-400 bg-red-500/10 border border-red-500/20"
                          : t.color === "cyan"
                          ? "text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20"
                          : "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"
                        }`}>
                        {t.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results: Full-width action bar */}
        {phase === "results" && verdict && (
          <div className="mt-6 bg-[#0D1B2A] border border-[#1A2744] rounded-xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-['Space_Grotesk'] text-sm font-bold text-white mb-0.5">
                Triage complete — {verdict.type === "spam" ? "threat" : "verdict"} classified
              </div>
              <div className="font-mono text-xs text-[#4A6FA5]">
                Recommended action: <span className={`font-semibold ${verdict.type === "spam" ? "text-red-400" : "text-[#00E5FF]"}`}>{verdict.action}</span>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="px-5 py-2.5 border border-[#1A2744] hover:border-[#00E5FF]/30 text-[#4A6FA5] hover:text-white font-mono text-xs tracking-wider rounded transition-all">
                EXPORT SUMMARY
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#0A0F1E] font-['Space_Grotesk'] font-bold text-sm rounded hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all">
                View Full Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

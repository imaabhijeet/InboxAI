import { useState } from "react";
import HeroSection from "./components/HeroSection";
import EmailAnalysisSection from "./components/EmailAnalysisSection";

export default function App() {
  const [analysisStarted, setAnalysisStarted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#E8F4FD] font-inter overflow-x-hidden">
      <HeroSection onGetStarted={() => {
        setAnalysisStarted(true);
        setTimeout(() => {
          document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }} />
      <EmailAnalysisSection id="analysis" triggered={analysisStarted} />
    </div>
  );
}

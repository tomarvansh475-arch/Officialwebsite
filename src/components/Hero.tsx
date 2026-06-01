import React from "react";
import { Trees, Heart, Sparkles, ShieldCheck } from "lucide-react";
import { dbInstance } from "../lib/db";

export default function Hero() {
  const content = dbInstance.getSiteContent();

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-24 overflow-hidden bg-gradient-to-b from-[#efe7d6]/80 via-[#f5f1e8] to-[#efe7d6]/85"
    >
      {/* Dynamic Background Video if available */}
      {content.heroVideoUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-15 overflow-hidden">
          {content.heroVideoUrl.includes("youtube.com") || content.heroVideoUrl.includes("youtu.be") ? (
            <iframe
              src={`${content.heroVideoUrl.replace("watch?v=", "embed/")}?autoplay=1&mute=1&loop=1&playlist=${content.heroVideoUrl.split("v=")[1] || ""}&controls=0`}
              className="w-full h-full object-cover scale-[1.3]"
              title="Hero Background Video"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <video
              src={content.heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Decorative Flying Birds Layer */}
      <div className="absolute top-28 right-1/4 pointer-events-none select-none opacity-40 animate-pulse">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20 Q15 10 20 20 Q25 10 30 20" stroke="#0f4d24" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M50 35 Q53 27 56 35 Q59 27 62 35" stroke="#1f6b35" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M85 15 Q90 5 95 15 Q100 5 105 15" stroke="#0f4d24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-12 sm:py-20 z-10 flex flex-col items-center">
        
        {/* Main Heading in Devanagari */}
        <h1 className="font-hindi text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-tight select-none">
          {content.heroTitle || "पश्चिमांचल विकास परिषद"} <span className="text-ngo-forest">(भारत)</span>
        </h1>

        <div className="flex items-center gap-1.5 mt-2 text-stone-700 font-hindi font-extrabold text-sm sm:text-base tracking-widest select-none">
          <span>🌿</span> {content.heroSubtitle || "प्रकृति से संस्कृति की ओर"} <span>🌿</span>
        </div>

        {/* Centerpiece: President Portrait Container */}
        <div className="mt-8 relative group" id="president-focal-circle">
          {/* Double ring glowing animated frame */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-ngo-forest via-[#efe7d6] to-amber-700 opacity-80 blur-md group-hover:opacity-100 group-hover:scale-102 transition duration-500 animate-spin-slow animate-pulse" />
          <div className="absolute -inset-1 border-2 border-stone-200 border-dashed rounded-full pointer-events-none z-10 scale-[1.03]" />
          
          {/* Main Circular Portrait */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-stone-100 rounded-full overflow-hidden shadow-2xl border-4 border-[#efe7d6]">
            <img
              src={content.heroPresidentImg || "/src/assets/images/nitin_swami_1780203516611.png"}
              alt={`${content.heroPresidentName || "Nitin Swami"} - President`}
              className="w-full h-full object-cover scale-[1.02] group-hover:scale-105 transition-all duration-500 ease-out"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>

          {/* Verification Badge */}
          <div className="absolute -bottom-2 left-1/2 bg-ngo-dark text-[#efe7d6] py-1 px-4 rounded-full shadow-lg border border-[#efe7d6]/40 flex items-center gap-1.5 z-20 whitespace-nowrap" style={{ transform: "translateX(-50%)" }}>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-hindi text-sm font-black tracking-wide">{content.heroPresidentName || "नितिन स्वामी"}</span>
          </div>
        </div>

        {/* President Attribution text */}
        <div className="mt-4 flex flex-col items-center">
          <span className="font-hindi text-stone-900 font-extrabold text-lg">{content.heroPresidentName || "नितिन स्वामी"}</span>
          <span className="text-xs sm:text-sm font-sans font-extrabold text-stone-605 uppercase tracking-widest mt-0.5">
            {content.heroPresidentSubtitle || "President, Paschimanchal Vikas Parishad (Bharat)"}
          </span>
        </div>

        {/* Slogan Banner Block */}
        <div className="mt-6 max-w-3xl bg-[#f5f1e8]/95 border-2 border-ngo-forest/20 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
          {/* Inner decorative dashed border */}
          <div className="absolute inset-1.5 border border-dashed border-stone-400/20 rounded-2xl pointer-events-none" />
          
          <div className="text-4xl text-ngo-forest/25 font-serif select-none leading-none absolute top-2 left-6">
            “
          </div>

          <p className="font-hindi text-base sm:text-lg md:text-xl text-[#142918] leading-relaxed font-bold italic px-4 relative z-10">
            {content.heroSlogan || "हम विकास के विरोध में नहीं हैं, विनाश के विरोध में खड़े हैं।"}
          </p>

          <div className="text-4xl text-ngo-forest/25 font-serif select-none leading-none absolute bottom-1 right-6">
            ”
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-xl px-4">
          
          <a
            href="#join"
            className="flex-1 inline-flex items-center justify-center gap-3 bg-[#133e21] hover:bg-ngo-forest text-[#efe7d6] px-6 py-4 rounded-xl font-hindi text-lg font-bold shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border border-[#efe7d6]/20 focus:outline-none focus:ring-4 focus:ring-ngo-forest/30 animate-pulse"
          >
            <ShieldCheck className="w-5.5 h-5.5 text-emerald-300" />
            {content.heroBtnText || "Join The Movement"}
          </a>

          <a
            href="#donate"
            className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-800 to-amber-700 text-[#f5f1e8] px-6 py-4 rounded-xl font-hindi text-lg font-bold shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border border-amber-900/10 focus:outline-none focus:ring-4 focus:ring-amber-700/30"
          >
            <Heart className="w-5.5 h-5.5 text-red-300 fill-red-300/10" />
            Donate Now
          </a>

        </div>

      </div>

      {/* Decorative Wave/River Graphic bottom borders */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[30px] fill-[#efe7d6]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,1041.52,94c77.29,12.58,154.67,13.27,211.7,3H0V0C233.19,10,307.75,58.89,307.75,58.89Z" opacity=".5"></path>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86C233.19,67.8,0,0,0,0V120H1200V12.19C1200,12.19,1064.67,113.66,985.66,92.83Z"></path>
        </svg>
      </div>

    </section>
  );
}


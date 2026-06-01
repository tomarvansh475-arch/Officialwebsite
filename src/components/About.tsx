import React, { useState, useEffect } from "react";
import { CheckCircle2, Award, Gift, Calendar, Navigation, ShieldAlert } from "lucide-react";
import { dbInstance } from "../lib/db.ts";

export default function About() {
  const [content, setContent] = useState(dbInstance.getSiteContent());

  useEffect(() => {
    const handleUpdate = () => {
      setContent(dbInstance.getSiteContent());
    };
    window.addEventListener("pvp_site_content_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("pvp_site_content_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#efe7d6]/40 text-stone-900 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Left Column: Image collage exactly as requested */}
          <div className="lg:col-span-6 relative w-full h-[520px] max-w-md md:max-w-lg mx-auto lg:mx-0" id="about-image-collage">
            
            {/* Main background organic shape blob */}
            <div className="absolute top-10 left-10 w-72 h-72 sm:w-80 sm:h-80 bg-ngo-forest/10 rounded-full blur-3xl -z-10" />

            {/* Main large image (Water conservation activity / volunteers) */}
            <div className="absolute top-4 left-4 w-[75%] h-[65%] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#efe7d6] hover:scale-101 hover:z-20 transition-transform duration-300">
              <img
                src={content.aboutImg1 || "/src/assets/images/stage_banner_kandhla.png"}
                alt="Volunteers and public gathering of Paschimanchal Vikas Parishad"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Secondary overlapping image (Traditional rivers / canals) */}
            <div className="absolute bottom-4 right-4 w-[65%] h-[55%] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#efe7d6] hover:scale-101 hover:z-20 transition-transform duration-300">
              <img
                src={content.aboutImg2 || "/src/assets/images/river_march_stones.png"}
                alt="Environmental campaigns in West UP rivers"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlapping small detail image - visible on tablet and desktop */}
            <div className="absolute top-[40%] -left-4 w-[40%] h-[35%] rounded-xl overflow-hidden shadow-xl border-4 border-[#efe7d6] hidden sm:block hover:scale-105 hover:z-20 transition-transform duration-300">
              <img
                src={content.aboutImg3 || "/src/assets/images/volunteers_salute.png"}
                alt="Volunteers dedicated environmental pledge"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Floating badge for founding date */}
            <div className="absolute bottom-1/4 left-1/3 bg-[#0d3b1b] text-[#efe7d6] p-4 rounded-2xl shadow-xl border border-ngo-forest/40 flex items-center gap-3 animate-pulse select-none z-30">
              <Calendar className="w-8 h-8 text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-hindi text-sm font-semibold opacity-80 uppercase tracking-widest leading-none">स्थापना</span>
                <span className="font-hindi text-base sm:text-lg font-black mt-1 text-[#efe7d6]">{content.aboutDate || "01 अक्टूबर 2026"}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Organization introduction and narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center" id="about-details-content">
            
            {/* Section Header */}
            <div className="text-left mb-6">
              <div className="font-hindi text-[#1f6b35] font-extrabold text-base tracking-wider flex items-center gap-1.5 select-none">
                {content.aboutBadge || "🌱 युगानुकूल सामाजिक संकल्प 🌱"}
              </div>
              <h2 className="font-hindi text-3xl sm:text-4.5xl font-black text-stone-900 mt-2.5 leading-tight">
                {content.aboutTitle || "परिचय एवं वैचारिक आधारभूमि"}
              </h2>
            </div>

            {/* History Details */}
            <div className="font-hindi text-[#1c2e21] text-base leading-relaxed space-y-4 font-semibold">
              <p>
                <strong className="text-ngo-forest text-lg">{content.siteLogoText || "पश्चिमांचल विकास परिषद"} (भारत)</strong> की स्थापना <strong className="text-[#0d3b1b]">{content.aboutDate || "01 अक्टूबर 2026"}</strong> को {content.foundationLocation ? <span>स्थान <strong className="text-[#0d3b1b]">{content.foundationLocation}</strong></span> : "पश्चिमी उत्तर प्रदेश"} में की गई।
              </p>
              <p className="text-stone-700 font-medium font-hindi">
                {content.aboutText1}
              </p>
              <p className="text-stone-705 font-medium font-hindi">
                {content.aboutText2}
              </p>
              <p className="text-stone-710 font-medium font-hindi">
                {content.aboutText3}
              </p>
              {content.aboutWarningText && (
                <p className="text-stone-800 font-bold bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                  {content.aboutWarningText}
                </p>
              )}
              <p className="text-stone-750 font-medium font-hindi">
                {content.aboutText4}
              </p>
            </div>

            {/* Premium highlighted quote */}
            <div className="my-6 border-l-4 border-l-ngo-forest bg-[#f5f1e8] p-4.5 rounded-r-xl shadow-inner">
              <p className="font-hindi text-[#0d3b1b] text-base sm:text-lg italic leading-relaxed font-black">
                {content.aboutQuote}
              </p>
              <div className="text-right font-hindi text-xs font-bold text-stone-600 mt-2">
                {content.aboutQuoteAuthor}
              </div>
            </div>

            {/* Final Statement Block */}
            <div className="font-hindi text-stone-700 text-sm leading-normal font-semibold space-y-2 bg-[#efe7d6]/20 p-4 rounded-xl border border-stone-300/60 shadow-sm">
              <p>
                {content.aboutFooterText}
              </p>
              <div className="flex items-center gap-2 text-amber-900 mt-2 font-black text-sm sm:text-base border-t border-stone-300 pt-2">
                <Award className="w-5 h-5 flex-shrink-0 animate-bounce" />
                <span>“पश्चिमांचल कोई नक्शे का हिस्सा नहीं, पीढ़ियों की विरासत है।”</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


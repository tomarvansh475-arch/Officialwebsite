import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Heart, Award, Leaf } from "lucide-react";
import { dbInstance } from "../lib/db";

export default function OrganizationIdentity() {
  const [content, setContent] = useState(dbInstance.getSiteContent());

  useEffect(() => {
    const handleUpdate = () => {
      setContent(dbInstance.getSiteContent());
    };
    window.addEventListener("pvp_site_content_updated", handleUpdate);
    return () => {
      window.removeEventListener("pvp_site_content_updated", handleUpdate);
    };
  }, []);

  const title = content.orgSectionTitle || "संगठन की आधिकारिक पहचान";
  const desc = content.orgSectionDesc || "पश्चिमांचल विकास परिषद की प्रामाणिक पहचान एवं लोक-कल्याणकारी सामाजिक दर्शन";
  const logo = content.headerLogo || content.orgLogo;
  const name = content.orgName || "पश्चिमांचल विकास परिषद";
  const tagline = content.orgTagline || "🌿 प्रकृति से संस्कृति की ओर 🌿";
  const mission = content.orgMission || "हमारा संकल्प पश्चिमांचल की अमूल्य जल संपदा का पुनरुद्धार करना, मृदा स्वास्थ्य की नव-चेतना जगाना, पर्यावरण संरक्षण, प्राचीन कौरवी भाषा-संस्कृति को अक्षुण्ण बनाना तथा युवाओं को रचनात्मक राष्ट्र-सेवा से जोड़ना है।";
  const bgImg = content.orgBgImage;
  const logoSize = content.orgLogoSize || "medium";

  // Compute size class for the logo
  let sizeClass = "w-32 h-32 md:w-40 md:h-40";
  if (logoSize === "small") {
    sizeClass = "w-24 h-24 md:w-28 md:h-28";
  } else if (logoSize === "large") {
    sizeClass = "w-40 h-40 md:w-52 md:h-52";
  }

  // Fallback vector seal SVG logo when no image is uploaded
  const FallbackLogo = () => (
    <div className={`${sizeClass} relative flex items-center justify-center rounded-full bg-gradient-to-tr from-[#0a3318] to-[#1e5a2e] text-[#efe7d6] shadow-2xl border-4 border-[#d1bf9d] p-1.5`}>
      {/* Outer circular gold frame */}
      <div className="absolute inset-0.5 rounded-full border border-[#efe7d6]/30 pointer-events-none" />
      <div className="absolute inset-2 rounded-full border border-[#efe7d6]/10 pointer-events-none border-dashed animate-spin-slow" />
      
      <div className="flex flex-col items-center justify-center text-center p-2">
        <Leaf className="w-10 h-10 md:w-12 md:h-12 text-[#dcd1b4] animate-pulse" />
        <span className="font-hindi text-[9px] md:text-[10px] font-black tracking-widest leading-none mt-1.5 text-amber-300">
          पी०वी०पी० भारत
        </span>
        <span className="font-hindi text-[7px] md:text-[8px] font-bold text-stone-200 mt-1 uppercase tracking-tight">
          PVP NGO
        </span>
      </div>
      
      {/* Decorative leaf ribbon around emblem */}
      <div className="absolute -bottom-1 bg-[#b4985c] text-stone-950 font-hindi font-black text-[9px] md:text-[10px] px-3 py-0.5 rounded-full shadow border border-[#efe7d6] tracking-wide whitespace-nowrap">
        आधिकारिक प्रतीक
      </div>
    </div>
  );

  return (
    <section
      id="org-identity"
      className="py-16 sm:py-20 relative overflow-hidden bg-[#efe7d6]/10 border-t border-b border-stone-200/50"
    >
      {/* Section Background Decoration when no background image is set */}
      {!bgImg && (
        <>
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#0f4d24]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-amber-800/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading with Contrast Protection */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-850 px-4 py-1.5 rounded-full text-xs font-black tracking-wide border border-emerald-100 shadow-sm font-hindi uppercase mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>संगठन प्रमाण (Official Identity)</span>
          </div>
          <h2 className="font-hindi text-2xl sm:text-3.5xl font-black text-stone-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="font-hindi text-stone-500 font-bold text-xs sm:text-sm mt-3 leading-relaxed">
            {desc}
          </p>
          <div className="w-16 h-1 bg-[#155a2c] mx-auto mt-4 rounded-full" />
        </div>

        {/* Dynamic Display Board - Card layout with premium shadow */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-200/80 min-h-[380px] flex items-center justify-center p-6 sm:p-10 lg:p-12"
          style={{
            backgroundImage: bgImg ? `url(${bgImg})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          id="identity-card-container"
        >
          {/* Overlay to ensure maximum text visibility and readability */}
          {bgImg ? (
            // Dark elegant overlay on bright background images to make white text pop
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/90 to-stone-900/60 z-0" />
          ) : (
            // Elegant bright slate marble parchment texture for non-image default
            <div className="absolute inset-0 bg-[#fbf9f4] z-0">
              <div className="absolute inset-2 border border-dashed border-[#0f4d24]/15 rounded-2xl pointer-events-none" />
              {/* Background watermark */}
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#05250f_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          )}

          {/* Core Content Container */}
          <div className={`relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${bgImg ? "text-stone-100" : "text-stone-850"}`}>
            
            {/* Left side: Animated Seal / Logo display with custom zoom interaction */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative group transition-all duration-300 hover:scale-105">
                {/* Glossy radiant halo backing */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                
                {logo ? (
                  // Custom uploaded logo
                  <div className={`${sizeClass} relative rounded-full overflow-hidden flex items-center justify-center bg-transparent border-4 border-amber-500/50 p-1 shadow-lg`}>
                    <img
                      src={logo}
                      alt="Paschimanchal Vikas Parishad Official Logo"
                      style={{ borderRadius: "50%", objectFit: "contain" }}
                      className="w-full h-full object-contain rounded-full bg-transparent"
                      onError={(e) => {
                        // Handle image fallback gracefully if bad url is loaded
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <FallbackLogo />
                )}
              </div>

              {/* Dynamic tag indicating identity status */}
              <div className="mt-5 space-y-1">
                <p className={`font-hindi text-lg font-black tracking-wide ${bgImg ? "text-white text-shadow-sm" : "text-stone-900"}`}>
                  {name}
                </p>
                <div className={`inline-flex items-center gap-1 text-[11px] font-sans font-extrabold uppercase px-2.5 py-0.5 rounded-full ${bgImg ? "bg-stone-800/80 text-amber-400 border border-stone-700" : "bg-emerald-50 text-emerald-800 border border-emerald-100"}`}>
                  <span>REGISTERED LOGO</span>
                  <Award className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Right side: Manifesto and Mission details */}
            <div className="md:col-span-8 flex flex-col justify-center h-full sm:pl-4">
              
              {/* Tagline section */}
              <div className="mb-4">
                <span className={`font-hindi text-base sm:text-xl font-black block tracking-wide ${bgImg ? "text-[#ffd984]" : "text-[#1b5025] animate-pulse"}`}>
                  {tagline}
                </span>
                <div className={`h-0.5 w-1/4 mt-2 ${bgImg ? "bg-[#ffd984]/40" : "bg-[#1b5025]/20"}`} />
              </div>

              {/* Mission Statement (2-3 lines) with superb readability and line-height */}
              <p className={`font-hindi text-sm sm:text-lg leading-relaxed font-semibold italic ${bgImg ? "text-stone-100 font-medium" : "text-stone-800"}`}>
                "{mission}"
              </p>

              {/* Clean Footer inside Identity Card to anchor the design professionally */}
              <div className={`mt-6 pt-4 border-t ${bgImg ? "border-stone-800 text-stone-400" : "border-stone-200 text-stone-500"} flex flex-wrap items-center gap-4 text-xs`}>
                <div className="flex items-center gap-1.5 font-hindi font-black">
                  <span className="text-amber-500">✔</span>
                  <span>संगठन पंजीकरण संख्या: १९६/२०२६</span>
                </div>
                <div className="flex items-center gap-1.5 font-hindi font-black">
                  <span className="text-amber-500">✔</span>
                  <span>मूल्य: "प्रकृतिः रक्षति रक्षिता"</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

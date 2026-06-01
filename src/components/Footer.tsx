import React, { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Instagram, ArrowUp, Send, Heart } from "lucide-react";
import NgoLogo from "./NgoLogo";
import { dbInstance } from "../lib/db.ts";

export default function Footer() {
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

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-8 border-t-4 border-ngo-dark overflow-hidden relative" id="main-footer">
      
      {/* Decorative leaf motifs inside footer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-ngo-forest/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-ngo-forest/10 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Organization brand info */}
          <div className="md:col-span-4 flex flex-col items-start space-y-4">
            
            <div className="flex items-center gap-3">
              <NgoLogo className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="font-hindi text-lg sm:text-xl font-bold tracking-wide text-white leading-none">
                  {content.siteLogoText || "पश्चिमांचल विकास परिषद"}
                </span>
                <span className="text-emerald-400 font-sans font-bold text-xs mt-1 uppercase tracking-wider">
                  NGO Organization • India
                </span>
              </div>
            </div>

            <p className="font-hindi text-stone-400 font-medium text-xs sm:text-sm leading-relaxed pt-2">
              {content.siteFooterText || "हमारा संगठन गंगा-यमुना दोआब की जल संपदा, वन संरक्षण तथा कौरवी बोली की सांस्कृतिक पहचान को अक्षुण्ण रखने के लिए प्रतिबद्ध एक राष्ट्रवादी सामाजिक जनांदोलन है।"}
            </p>

            {/* Newsletter Subscription input */}
            <div className="flex flex-col w-full pt-2">
              <label htmlFor="footer-newsletter" className="font-hindi text-xs font-bold text-stone-250 mb-1.5 uppercase">
                पत्रिका सदस्यता (Newsletter Sub)
              </label>
              <form onSubmit={(e) => { e.preventDefault(); alert("पत्रिका सदस्यता सफल!"); }} className="relative flex w-full max-w-sm">
                <input
                  type="email"
                  id="footer-newsletter"
                  required
                  placeholder="अपना ईमेल दर्ज करें"
                  className="w-full bg-[#efe7d6]/10 text-white placeholder-stone-500 py-2.5 pl-4 pr-12 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm border border-stone-800"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 bg-[#1b5025] hover:bg-ngo-forest text-[#efe7d6] px-3.5 rounded-lg flex items-center justify-center transition-colors shadow cursor-pointer text-xs"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 flex flex-col items-start space-y-3">
            <h4 className="font-hindi text-sm sm:text-base font-extrabold text-white tracking-widest border-b border-stone-800 pb-2 w-full uppercase">
              त्वरित संबंध (Quick links)
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full pt-1 font-hindi text-xs sm:text-sm font-medium">
              <a href="#home" className="text-stone-400 hover:text-emerald-400 transition-colors">होम (Home)</a>
              <a href="#about" className="text-stone-400 hover:text-emerald-400 transition-colors">परिचय (About)</a>
              <a href="#pillars" className="text-stone-400 hover:text-emerald-400 transition-colors">स्तंभ (Pillars)</a>
              <a href="#campaigns" className="text-stone-400 hover:text-emerald-400 transition-colors">अभियान (Campaigns)</a>
              <a href="#news" className="text-stone-400 hover:text-emerald-400 transition-colors">समाचार (News)</a>
              <a href="#join" className="text-stone-400 hover:text-emerald-400 transition-colors">जुड़ें (Join)</a>
              <a href="#donate" className="text-stone-400 hover:text-emerald-400 transition-colors">सहयोग (Donate)</a>
              <a href="#contact" className="text-stone-400 hover:text-emerald-400 transition-colors">संपर्क (Contact)</a>
            </div>
          </div>

          {/* Column 3: Regional Scope / Campaigns */}
          <div className="md:col-span-3 flex flex-col items-start space-y-3">
            <h4 className="font-hindi text-sm sm:text-base font-extrabold text-white tracking-widest border-b border-stone-800 pb-2 w-full uppercase">
              कार्य क्षेत्र (Regional Blocks)
            </h4>
            <ul className="font-hindi text-stone-400 text-xs sm:text-sm space-y-2 pt-1 font-semibold leading-relaxed">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">◈</span>
                <span>मेरठ (Meerut Central Division)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">◈</span>
                <span>बागपत-शामली जल पंचायत</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">◈</span>
                <span>सहारनपुर वनपट्टिका प्रभाग</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">◈</span>
                <span>मुजफ्फरनगर जैविक कृषि केंद्र</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational guidelines & Social */}
          <div className="md:col-span-2 flex flex-col items-start space-y-4">
            <h4 className="font-hindi text-sm sm:text-base font-extrabold text-white tracking-widest border-b border-stone-800 pb-2 w-full uppercase">
              जुड़िए (Follow Us)
            </h4>
            
            {/* Social Icons row */}
            <div className="flex items-center gap-3 pt-1">
              <a href={content.socialFacebook || "#"} className="w-8.5 h-8.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-400 hover:border-emerald-500 flex items-center justify-center transition-all shadow" aria-label="Facebook Link">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={content.socialTwitter || "#"} className="w-8.5 h-8.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-400 hover:border-emerald-500 flex items-center justify-center transition-all shadow" aria-label="Twitter Link">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={content.socialLinkedin || "#"} className="w-8.5 h-8.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-400 hover:border-emerald-500 flex items-center justify-center transition-all shadow" aria-label="Linkedin Link">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={content.socialInstagram || "#"} className="w-8.5 h-8.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-400 hover:border-emerald-500 flex items-center justify-center transition-all shadow" aria-label="Instagram Link">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* Scroll Top Button */}
            <button
              onClick={handleScrollTop}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#efe7d6]/10 text-[#efe7d6] hover:bg-[#efe7d6]/20 transition-all font-hindi text-xs font-bold border border-stone-800 cursor-pointer"
              title="Go to Top"
            >
              शीर्ष पर जाएं <ArrowUp className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>


        {/* Separator */}
        <div className="w-full h-px bg-stone-850 my-10" />

        {/* Bottom copyright declaration strictly matching professional standard */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-stone-500 text-[11px] sm:text-xs text-center sm:text-left gap-4 font-sans font-semibold">
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            <span>© {new Date().getFullYear()} Paschimanchal Vikas Parishad (PVP). All Rights Reserved.</span>
            <span className="hidden sm:inline text-stone-700">|</span>
            <span className="font-hindi text-emerald-500">वसुधैव कुटुम्बकम्</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-600 fill-red-650" />
            <span>for natural India. Registration No. Ref/PVP2026/UPNCR</span>
          </div>

        </div>

      </div>
    </footer>
  );
}

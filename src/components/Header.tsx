import React, { useState, useEffect } from "react";
import NgoLogo from "./NgoLogo";
import { dbInstance } from "../lib/db";

interface HeaderProps {
  activeSection: string;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function Header({ activeSection, onOpenAuth, isLoggedIn, isAdmin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [content, setContent] = useState(dbInstance.getSiteContent());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setContent(dbInstance.getSiteContent());
    };
    window.addEventListener("pvp_site_content_updated", handleUpdate);
    return () => {
      window.removeEventListener("pvp_site_content_updated", handleUpdate);
    };
  }, []);

  const navItems = [
    { id: "home", labelHindi: "होम", labelEn: "Home" },
    { id: "about", labelHindi: "हमारे बारे में", labelEn: "About Us" },
    { id: "pillars", labelHindi: "हमारे स्तंभ", labelEn: "Our Pillars" },
    { id: "campaigns", labelHindi: "अभियान", labelEn: "Campaigns" },
    { id: "news", labelHindi: "समाचार", labelEn: "News" },
    { id: "join", labelHindi: "जुड़ें", labelEn: "Join Us" },
    { id: "donate", labelHindi: "सहयोग करें", labelEn: "Donate" },
    { id: "contact", labelHindi: "संपर्क करें", labelEn: "Contact" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#efe7d6] shadow-md py-1 border-b border-ngo-forest/20"
          : "bg-[#f5f1e8]/95 backdrop-blur-sm py-2 border-b border-zinc-250"
      }`}
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo & Brand Details */}
          <a
            href="#home"
            className={`flex group focus:outline-none focus:ring-2 focus:ring-ngo-forest rounded-lg p-1 items-center ${
              content.headerLogoPosition === "right"
                ? "flex-row-reverse text-right gap-3"
                : content.headerLogoPosition === "top"
                ? "flex-col text-center gap-1 sm:gap-2"
                : "flex-row text-left gap-3"
            }`}
          >
            {content.headerLogo ? (
              <div 
                style={{ height: `${content.headerLogoSize || 64}px`, width: `${content.headerLogoSize || 64}px` }} 
                className="shrink-0 rounded-full border-0 bg-transparent overflow-hidden flex items-center justify-center p-0.5"
              >
                <img
                  src={content.headerLogo}
                  alt="Header Logo"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "contain" }}
                  className="object-contain rounded-full bg-transparent transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div style={{ height: `${content.headerLogoSize || 64}px`, width: `${content.headerLogoSize || 64}px` }} className="shrink-0">
                <NgoLogo className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-hindi text-lg sm:text-2xl font-bold text-ngo-dark tracking-wide leading-none">
                {content.headerOrgNameHi || content.siteLogoText || "पश्चिमांचल विकास परिषद"}{" "}
                <span className="text-sm font-semibold text-ngo-forest">
                  {content.headerOrgNameEn || "(भारत)"}
                </span>
              </span>
              <span className={`text-xs sm:text-sm text-ngo-forest flex items-center gap-1 font-hindi opacity-90 mt-1 ${
                content.headerLogoPosition === "right"
                  ? "justify-end"
                  : content.headerLogoPosition === "top"
                  ? "justify-center"
                  : "justify-start"
              }`}>
                <span>{content.siteLogoEmoji || "🪴"}</span>{" "}
                <span title={content.headerTagline || "प्रकृति से संस्कृति की ओर"}>
                  {content.headerSubtitle || content.headerTagline || content.heroSubtitle || "प्रकृति से संस्कृति की ओर"}
                </span>{" "}
                <span>{content.siteLogoEmoji || "🪴"}</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`relative px-3 py-2 text-sm font-hindi font-semibold rounded-lg transition-all duration-200 outline-none
                    ${
                      isActive
                        ? "bg-ngo-dark text-[#f5f1e8] shadow-inner"
                        : "text-stone-800 hover:text-ngo-forest hover:bg-ngo-beige"
                    }
                    focus:ring-2 focus:ring-ngo-forest
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span>{item.labelHindi}</span>
                    <span className="text-[10px] font-sans opacity-70 leading-none tracking-tight font-normal uppercase">
                      {item.labelEn}
                    </span>
                  </div>
                </a>
              );
            })}

            {/* Desktop Auth Portal Trigger Button */}
            <button
              onClick={onOpenAuth}
              className={`ml-2 px-3 py-1 bg-stone-50 rounded-xl border border-dashed text-xs font-hindi font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                isLoggedIn 
                  ? isAdmin 
                    ? "bg-amber-50/90 border-amber-400 text-amber-950 hover:bg-amber-100"
                    : "bg-emerald-50/90 border-emerald-400 text-emerald-950 hover:bg-emerald-100"
                  : "bg-ngo-dark hover:bg-ngo-forest text-[#efe7d6] border-transparent"
              }`}
            >
              <div className="flex flex-col items-center">
                <span>{isLoggedIn ? isAdmin ? "प्रशासक" : "पोर्टल (Profile)" : "लॉगिन पावती"}</span>
                <span className="text-[8px] font-sans opacity-75 uppercase leading-none tracking-tighter">
                  {isLoggedIn ? "Account" : "Sign In"}
                </span>
              </div>
            </button>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-800 hover:text-ngo-forest hover:bg-ngo-beige focus:outline-none focus:ring-2 focus:ring-ngo-forest"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg
                className={`h-6 w-6 transition-transform ${isMenuOpen ? "rotate-90 hidden" : "block"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close Icon */}
              <svg
                className={`h-6 w-6 transition-transform ${isMenuOpen ? "block" : "hidden"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-screen opacity-100 border-t border-stone-200" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-4 space-y-1 bg-[#efe7d6] shadow-inner font-hindi text-base">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-md text-base font-semibold border-l-4 transition-all duration-200
                  ${
                    isActive
                      ? "bg-ngo-dark/10 border-ngo-dark text-ngo-dark"
                      : "border-transparent text-stone-800 hover:bg-ngo-beige hover:text-ngo-forest"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.labelHindi}</span>
                  <span className="text-xs font-sans font-normal opacity-70 uppercase">
                    {item.labelEn}
                  </span>
                </div>
              </a>
            );
          })}

          {/* Mobile Auth Portal Trigger Button */}
          <div className="px-3 pt-3 border-t border-stone-200">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenAuth();
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-center font-hindi font-black border transition-all text-sm flex items-center justify-center gap-2 cursor-pointer ${
                isLoggedIn
                  ? isAdmin
                    ? "bg-amber-500/10 border-amber-300 text-amber-850 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-300 text-emerald-850 hover:bg-emerald-500/20"
                  : "bg-[#0f4d24] hover:bg-[#1f6b35] text-[#efe7d6] border-transparent"
              }`}
            >
              <span>{isLoggedIn ? isAdmin ? "🛠️ प्रशासक पैनल (Admin Console)" : "👤 सदस्य प्रोफ़ाइल (Profile Dashboard)" : "🔑 सदस्य लॉगिन (Member Sign In)"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

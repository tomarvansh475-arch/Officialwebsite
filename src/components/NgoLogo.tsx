import React, { useState, useEffect } from "react";
import { dbInstance } from "../lib/db";

export default function NgoLogo({ className = "w-16 h-16" }: { className?: string }) {
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

  const logoUrl = content.headerLogo || content.orgLogo;

  if (logoUrl) {
    return (
      <div className={`relative ${className} shrink-0 select-none flex items-center justify-center p-0.5 border-2 border-emerald-600/30 rounded-full bg-white shadow-md overflow-hidden`} id="ngo-logo-wrapper">
        <img
          src={logoUrl}
          className="w-full h-full object-contain rounded-full bg-transparent"
          alt="Paschimanchal Vikas Parishad logo"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className} select-none flex items-center justify-center`} id="ngo-logo-wrapper">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        aria-label="Paschimanchal Vikas Parishad logo"
      >
        <defs>
          {/* Radial gradient for natural background glow */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5f1e8" />
            <stop offset="70%" stopColor="#efe7d6" />
            <stop offset="100%" stopColor="#dfd5be" />
          </radialGradient>
          
          {/* Path for curving text */}
          <path
            id="textPathTop"
            d="M 12 50 A 38 38 0 1 1 88 50"
            fill="none"
          />
          <path
            id="textPathBottom"
            d="M 88 50 A 38 38 0 0 1 12 50"
            fill="none"
          />
        </defs>

        {/* Outer Green Ring */}
        <circle cx="50" cy="50" r="47" fill="url(#bgGrad)" stroke="#1f6b35" strokeWidth="2.5" />
        
        {/* Inner Green Border Ring */}
        <circle cx="50" cy="50" r="36" fill="none" stroke="#0f4d24" strokeWidth="1" strokeDasharray="3 1.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#1f6b35" strokeWidth="1.5" />

        {/* River (Winding landscape at the bottom) */}
        <path
          d="M 22 62 Q 35 50 50 60 T 78 62 L 75 75 Q 50 78 25 75 Z"
          fill="#3b82f6"
          opacity="0.8"
        />
        <path
          d="M 23 65 Q 35 55 50 63 T 77 65 C 75 74 65 76 50 75 C 35 74 25 73 23 65 Z"
          fill="#1d4ed8"
        />

        {/* Land (Hillside contours) */}
        <path
          d="M 16 68 C 25 60 40 68 50 68 C 65 68 75 60 84 68 L 82 82 L 18 82 Z"
          fill="#854d0e" // Soil brown
          opacity="0.4"
        />
        <path
          d="M 16 72 C 30 65 45 74 55 72 C 70 70 75 66 84 72 L 80 84 L 20 84 Z"
          fill="#166534" // Deep grass green
        />

        {/* Tree Trunk & Canopy */}
        {/* Trunk */}
        <path
          d="M 48 72 L 52 72 L 51 52 L 49 52 Z"
          fill="#451a03"
        />
        {/* Branch splits */}
        <path
          d="M 49 55 L 43 48 M 51 54 L 57 47 M 50 52 L 50 45"
          stroke="#451a03"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Foliage (Beautiful overlapping green clouds) */}
        <circle cx="50" cy="40" r="11" fill="#15803d" />
        <circle cx="41" cy="45" r="9" fill="#16a34a" />
        <circle cx="59" cy="44" r="9" fill="#16a34a" fillOpacity="0.9" />
        <circle cx="50" cy="41" r="7" fill="#4ade80" fillOpacity="0.75" />
        
        {/* Small Sun */}
        <circle cx="28" cy="42" r="5" fill="#f59e0b" />
        <path d="M 28 34 L 28 36 M 28 48 L 28 50 M 20 42 L 22 42 M 34 42 L 36 42" stroke="#f59e0b" strokeWidth="1" />

        {/* Curving Text on Paths */}
        <text className="font-hindi text-[7.2px] font-extrabold fill-[#0f4d24]">
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            पश्चिमांचल विकास परिषद
          </textPath>
        </text>

        <text className="font-hindi text-[7.2px] font-extrabold fill-[#1f6b35]">
          <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle" side="left">
            (भारत)
          </textPath>
        </text>
      </svg>
    </div>
  );
}

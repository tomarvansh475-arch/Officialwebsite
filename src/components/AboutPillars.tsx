import React from "react";
import * as Lucide from "lucide-react";
import { dbInstance } from "../lib/db";

// Helper function to dynamically resolve icons from Lucide-react objects safely
const renderPillarIcon = (name: string, className = "w-8 h-8 text-ngo-dark") => {
  const IconComponent = (Lucide as any)[name];
  if (!IconComponent) return <Lucide.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function AboutPillars() {
  const pillars = dbInstance.getPillars();

  return (
    <section
      id="pillars"
      className="py-16 bg-[#efe7d6]/30 relative overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg">
            संस्थान के सिद्धांत
          </div>
          <h2 className="font-hindi text-3xl sm:text-4xl font-black text-stone-900 mt-3 leading-tight">
            हमारे 07 मुख्य आधारभूत स्तंभ
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base font-medium">
            पश्चिमांचल विकास परिषद इन सात संकल्पों के माध्यम से क्षेत्र में प्रकृति संवर्धन और सांस्कृतिक चेतना जागृत करने का कार्य कर रही है।
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-[#f5f1e8] rounded-2xl p-6 shadow-md border border-stone-200 hover:border-ngo-forest/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block group relative overflow-hidden"
              id={`pillar-card-${pillar.id}`}
            >
              {/* Corner Watermark Number */}
              <div className="absolute top-4 right-6 text-6xl font-black text-stone-500/5 select-none font-sans group-hover:text-ngo-forest/10 transition-colors duration-300">
                {pillar.number}
              </div>

              {/* Icon Background */}
              <div className="inline-flex p-3 bg-ngo-beige/70 rounded-xl mb-4 group-hover:bg-ngo-forest/10 transition-colors duration-300">
                {renderPillarIcon(pillar.iconName, "w-7 h-7 text-ngo-forest")}
              </div>

              {/* Title Block */}
              <div className="flex flex-col mb-3">
                <span className="text-xs font-sans font-bold text-stone-500 uppercase tracking-widest leading-none mb-1">
                  Pillar {pillar.number}
                </span>
                <span className="font-hindi text-xl font-bold text-stone-900 group-hover:text-[#1f6b35] transition-colors">
                  {pillar.title}
                </span>
                <span className="text-xs text-stone-600 font-medium italic mt-1">
                  {pillar.titleEn}
                </span>
              </div>

              {/* Description body */}
              <p className="font-hindi text-stone-700 text-sm sm:text-base leading-relaxed mt-2">
                {pillar.description}
              </p>

              {/* Underline interactive indicator */}
              <div className="h-1 w-0 bg-ngo-forest group-hover:w-full transition-all duration-500 rounded mt-4" />

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


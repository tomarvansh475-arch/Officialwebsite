import React from "react";
import { Sprout, Users, Trees, Droplet, HeartHandshake } from "lucide-react";

export default function Statistics() {
  const stats = [
    {
      id: "stat1",
      icon: Sprout,
      count: "07",
      labelHindi: "मुख्य स्तंभ",
      labelEn: "Main Pillars",
      color: "text-emerald-800"
    },
    {
      id: "stat2",
      icon: Users,
      count: "हजारों",
      labelHindi: "आंदोलनवाहक स्वयंसेवक",
      labelEn: "Thousands of Volunteers",
      color: "text-green-800"
    },
    {
      id: "stat3",
      icon: Trees,
      count: "लाखों",
      labelHindi: "पेड़ लगाने का संकल्प",
      labelEn: "Lakhs of Trees Target",
      color: "text-emerald-950"
    },
    {
      id: "stat4",
      icon: Droplet,
      count: "जल, जंगल, ज़मीन",
      labelHindi: "हमारी पहचान व अभियान",
      labelEn: "Water Forest Land Heritage",
      color: "text-blue-800"
    },
    {
      id: "stat5",
      icon: HeartHandshake,
      count: "प्रकृति से",
      labelHindi: "संस्कृति की ओर हमारा आंदोलन",
      labelEn: "Nature to Culture Vision",
      color: "text-[#1f6b35]"
    }
  ];

  return (
    <section
      id="pillars-intro"
      className="bg-[#efe7d6]/80 py-8 border-y border-ngo-forest/15 shadow-inner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y-2 md:divide-y-0 md:divide-x-2 divide-ngo-forest/10">
          
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className={`flex flex-col items-center text-center p-4 transition-transform duration-300 hover:scale-105 ${
                  idx > 1 ? "pt-6 md:pt-4" : ""
                }`}
                id={`stat-column-${stat.id}`}
              >
                
                {/* Icon Circle wrapper */}
                <div className="relative mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-ngo-cream/90 shadow-md ring-2 ring-ngo-forest/20">
                  <IconComponent className={`w-7 h-7 ${stat.color}`} />
                  <div className="absolute -inset-1 rounded-full border border-dashed border-ngo-forest/30 animated-spin-slow opacity-0 hover:opacity-100 transition-opacity" />
                </div>

                {/* Main metric / Count text */}
                <div className="font-hindi text-xl sm:text-2xl font-black text-stone-900 leading-none">
                  {stat.count}
                </div>

                {/* Main Label */}
                <span className="font-hindi text-sm sm:text-base font-bold text-ngo-dark mt-2 leading-tight">
                  {stat.labelHindi}
                </span>

                {/* Subtitle in English for translation assistance */}
                <span className="text-[10px] font-sans font-medium text-stone-500 uppercase tracking-wide mt-1">
                  {stat.labelEn}
                </span>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GraduationCap, Award, Compass, Heart } from "lucide-react";
import { dbInstance } from "../lib/db";

export default function GuideSection() {
  const [guides, setGuides] = useState(dbInstance.getGuides());

  useEffect(() => {
    const handleUpdate = () => {
      setGuides(dbInstance.getGuides());
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("pvp_site_content_updated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("pvp_site_content_updated", handleUpdate);
    };
  }, []);

  const sortedGuides = [...guides].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (sortedGuides.length === 0) {
    return null; // Don't render anything if empty, keeping layout tight
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 18,
      },
    },
  };

  return (
    <section
      id="guides"
      className="py-20 sm:py-24 bg-[#efe7d6]/20 text-stone-900 scroll-mt-20 border-t border-stone-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#155a2c]/10 text-[#155a2c] text-xs font-bold font-hindi rounded-full border border-[#155a2c]/20 select-none">
            <Compass className="w-3.5 h-3.5" />
            <span>मार्गदर्शन और मार्गदर्शन चेतना</span>
          </div>
          
          <h2 className="font-hindi text-3xl sm:text-4.5xl font-black text-stone-900 leading-tight tracking-tight">
            संरक्षक एवं मार्गदर्शक मंडल
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-[#155a2c] mx-auto rounded-full" />
          
          <p className="font-hindi text-[#4a4030] text-sm sm:text-base leading-relaxed">
            पश्चिमांचल विकास परिषद (भारत) को समाज सुधार, जल संरक्षण एवं सांस्कृतिक नवजागरण के पथ पर अग्रसर करने वाले मार्गदर्शक महापुरुष। उनके आशीर्वाद व संबल से आंदोलन गतिशील है।
          </p>
        </div>

        {/* Guides Container Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center"
        >
          {sortedGuides.map((guide, idx) => (
            <motion.div
              key={guide.id || idx}
              variants={itemVariants}
              className="bg-white rounded-2xl border border-stone-200/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Corner decorative design */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#efe7d6]/20 rounded-bl-full pointer-events-none -z-0 transition-all group-hover:scale-120 duration-500" />
              
              <div className="space-y-5 z-10">
                {/* Photo Header */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-[#155a2c] rounded-2xl rotate-3 scale-102 group-hover:rotate-6 transition-transform duration-300 -z-10 opacity-10" />
                    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden border border-stone-200 shadow bg-white flex items-center justify-center p-0.5">
                      {guide.imageUrl ? (
                        <img
                          src={guide.imageUrl}
                          alt={guide.name}
                          className="w-full h-full object-cover rounded-xl transition-all duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-stone-100 to-stone-50 text-stone-400 flex items-center justify-center text-xl font-bold font-hindi rounded-xl">
                          🌱
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-hindi text-base sm:text-lg font-black text-stone-900 group-hover:text-[#155a2c] transition-colors leading-tight">
                      {guide.name}
                    </h3>
                    <p className="font-hindi text-xs font-bold text-amber-700 uppercase tracking-tight">
                      {guide.designation}
                    </p>
                  </div>
                </div>

                {/* Description Text */}
                <p className="font-hindi text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-4 min-h-[72px]">
                  {guide.description}
                </p>
              </div>

              {/* Bottom Quote Ribbon */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-stone-400 z-10">
                <span className="text-[10px] font-sans font-extrabold tracking-wider text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  MENTOR PANEL
                </span>
                <Heart className="w-3.5 h-3.5 text-amber-500/80 fill-amber-500/10 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}

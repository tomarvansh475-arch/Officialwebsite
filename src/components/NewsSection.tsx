import React, { useState, useEffect } from "react";
import { Calendar, Eye, ArrowRight, X, Clock, Share2 } from "lucide-react";
import { dbInstance } from "../lib/db";
import { NewsItem } from "../types";

export default function NewsSection() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  const loadData = () => {
    setNewsList(dbInstance.getNews());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectNews = (item: NewsItem) => {
    dbInstance.incrementNewsViews(item.id);
    setSelectedNews(item);
    loadData();
  };

  // Simple share notification trigger
  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, text: "Check out this news from PVP NGO India" }).catch(() => {});
    } else {
      alert("समाचार लिंक कॉपी किया गया! (News Link Copied)");
    }
  };

  return (
    <section
      id="news"
      className="py-16 sm:py-24 bg-[#efe7d6]/10 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg select-none">
            📰 समाचार एवं मीडिया 📰
          </div>
          <h2 className="font-hindi text-3xl sm:text-4xl font-black text-stone-900 mt-2.5">
            गतिविधियाँ एवं प्रेस विज्ञप्ति
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base font-medium">
            धरातल पर चल रहे श्रमदान कार्यक्रमों, गोष्ठियों और समाज सुधार अभियानों की ताज़ा रिपोर्ट।
          </p>
        </div>

        {/* News Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map((item) => (
            <article
              key={item.id}
              onClick={() => handleSelectNews(item)}
              className="bg-[#f5f1e8] rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 border border-stone-200 cursor-pointer flex flex-col justify-between group"
              id={`news-card-${item.id}`}
            >
              
              {/* Featured Image Frame */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Float Category Tag */}
                <div className="absolute top-4 left-4 bg-[#0f4d24]/95 text-[#efe7d6] text-xs font-hindi font-bold py-1 px-3 rounded-full border border-ngo-forest/20">
                  {item.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta (Date / Read count) */}
                  <div className="flex items-center gap-4 text-xs font-sans text-stone-500 font-bold mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ngo-forest" />
                      {new Date(item.date).toLocaleDateString("hi-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {item.views} Views
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-hindi text-lg sm:text-xl font-bold text-stone-900 leading-snug hover:text-ngo-forest transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Summary Description */}
                  <p className="font-hindi text-stone-600 font-medium text-sm sm:text-base mt-2.5 line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-200">
                  
                  {/* Read More link */}
                  <span className="inline-flex items-center gap-1 text-[#1f6b35] font-hindi font-extrabold text-sm sm:text-base hover:text-ngo-dark transition-colors">
                    विवरण पढ़ें <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>

                  {/* Share button */}
                  <button
                    onClick={(e) => handleShare(item.title, e)}
                    className="p-2 bg-stone-200/60 hover:bg-stone-300/60 rounded-full text-stone-700 transition-colors"
                    aria-label="Share news article"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </article>
          ))}
        </div>

      </div>

      {/* News Full Article Reader Modal (Overlay Modal) */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedNews(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#f5f1e8] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-stone-300 text-stone-900 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable container for reading */}
            <div className="overflow-y-auto flex-1">
              {/* Cover Image */}
              <div className="relative h-64 sm:h-80 w-full bg-stone-900">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f5f1e8] via-transparent to-black/30" />
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 bg-white/95 hover:bg-white text-stone-950 w-9 h-9 rounded-full flex items-center justify-center p-1 font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-ngo-forest"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Main reading content */}
              <div className="p-6 sm:p-10">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-stone-500 font-bold mb-4">
                  <span className="bg-ngo-forest text-[#efe7d6] py-1 px-3 rounded-full text-[10px] uppercase font-bold tracking-widest">
                    {selectedNews.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedNews.date).toLocaleDateString("hi-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Read time: ~2 mins
                  </span>
                </div>

                {/* Main Heading */}
                <h3 className="font-hindi text-xl sm:text-2.5xl font-black text-stone-900 leading-tight">
                  {selectedNews.title}
                </h3>

                <div className="h-px bg-stone-300 my-6" />

                {/* Subtitle / summary summary paragraph */}
                <div className="p-4 bg-ngo-beige/50 border-l-4 border-l-[#1f6b35] rounded-r-xl italic font-hindi text-[#152e18] font-bold text-base sm:text-lg mb-6 shadow-inner leading-relaxed">
                  {selectedNews.summary}
                </div>

                {/* Article Body */}
                <div className="font-hindi text-[#1a2d1d] text-base sm:text-lg space-y-4 leading-relaxed font-medium">
                  {/* Since content in data contains descriptive news text, let's output paragraphs */}
                  <p>{selectedNews.content}</p>
                  <p>
                    कार्यक्रम के समापन पर परिषद के मार्गदर्शकों द्वारा ग्रामीणों को जलशपथ और वृक्षारोपण की प्रतिज्ञा दिलाई गई। ग्राम प्रधानों ने भी परिषद के इस पुनीत कार्य की भरपूर सराहना करते हुए आगामी महीनों में गाँव की शामलात विकास निधि से परिषद को पूर्ण सहयोग देने व युवाओं की पर्यावरण सेना गठित करने का पूर्ण आश्वासन दिया है।
                  </p>
                  <p>
                    परिषद का लक्ष्य आगामी शीत ऋतु से पूर्व पश्चिमांचल के सभी गंगा-यमुना दोआब वाले मुख्य तटवर्ती गाँवों में इसी तरह के 100 जनभागीदारी अभियान पूरे करने का है, ताकि हमारे पारंपरिक जौहड़ और ऐतिहासिक नदी जल दोबारा स्वच्छ बन सकें।
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky footer action buttons */}
            <div className="bg-[#efe7d6] p-4 border-t border-stone-200 flex justify-between items-center">
              <span className="text-xs font-sans font-bold text-stone-500">
                © Paschimanchal Vikas Parishad (PVP) Media Cell
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2 bg-ngo-dark hover:bg-ngo-dark-hover text-white rounded-xl font-hindi text-sm font-bold shadow transition-colors"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

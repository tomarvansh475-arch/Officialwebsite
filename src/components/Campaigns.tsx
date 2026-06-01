import React, { useState, useEffect } from "react";
import { Trees, Eye, CheckCircle, Flame, Calendar, Award } from "lucide-react";
import { dbInstance, UserProfile } from "../lib/db";
import { Campaign } from "../types";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasPledged, setHasPledged] = useState<{ [key: string]: boolean }>({});
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Sync datasets
  const syncDatasets = () => {
    const list = dbInstance.getCampaigns();
    setCampaigns(list);

    // Sync logged in user details
    const stored = localStorage.getItem("pvp_current_user");
    if (stored) {
      const parsedUser: UserProfile = JSON.parse(stored);
      setCurrentUser(parsedUser);
      
      // Update has pledaged state from user's record
      const items: { [key: string]: boolean } = {};
      parsedUser.joinedCampaignIds.forEach((cId) => {
        items[cId] = true;
      });
      setHasPledged(items);
    }
  };

  useEffect(() => {
    syncDatasets();
    
    window.addEventListener("storage", syncDatasets);
    window.addEventListener("pvp_site_content_updated", syncDatasets);
    const interval = setInterval(syncDatasets, 3000);
    
    return () => {
      window.removeEventListener("storage", syncDatasets);
      window.removeEventListener("pvp_site_content_updated", syncDatasets);
      clearInterval(interval);
    };
  }, []);

  const handlePledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPledged[id]) return;

    // Check if user is logged in
    const stored = localStorage.getItem("pvp_current_user");
    if (!stored) {
      // Allow general user pledge tracking
      dbInstance.pledgeToCampaign(id);
      setHasPledged((prev) => ({ ...prev, [id]: true }));
      setCampaigns(dbInstance.getCampaigns());
      alert("समर्थन देने के लिए आपका धन्यवाद! (Thank you for your pledge!)");
      return;
    }

    try {
      const user: UserProfile = JSON.parse(stored);
      dbInstance.userJoinCampaign(user.uid, id);
      
      // Retrieve updated user to save in localStorage
      const users = dbInstance.getUsers();
      const updatedUser = users.find(u => u.uid === user.uid);
      if (updatedUser) {
        localStorage.setItem("pvp_current_user", JSON.stringify(updatedUser));
      }

      setHasPledged((prev) => ({ ...prev, [id]: true }));
      setCampaigns(dbInstance.getCampaigns());
      
      // Sync state
      syncDatasets();
      alert("आपका पावती संकल्प सुरक्षित कर लिया गया है! इसे आपके प्रोफ़ाइल पर देखा जा सकता है।");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section
      id="campaigns"
      className="py-16 bg-[#efe7d6]/10 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg select-none">
            ☘️ हमारे अभियान ☘️
          </div>
          <h2 className="font-hindi text-3xl sm:text-4xl font-black text-stone-900 mt-3 leading-tight">
            पर्यावरण व संस्कृति के महाअभियान
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base font-medium">
            धरा, नदियाँ और संस्कृति की रक्षा के लिए हमारे मुख्य अभियान, जिनमें आप भी अपनी भागीदारी दर्ज कर सकते हैं।
          </p>
        </div>

        {/* Campaign Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaigns.map((campaign) => {
            const hasSigned = hasPledged[campaign.id];
            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="relative cursor-pointer group rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] shadow-md border hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 border-stone-200"
                id={`campaign-card-${campaign.id}`}
              >
                {/* Background Image per card */}
                <img
                  src={campaign.imageUrl}
                  alt={campaign.titleEnglish}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Vignette Overlay for Title Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/35 group-hover:from-black/100 transition-colors duration-300" />

                {/* Card Content Wrapper */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-[#efe7d6] z-10">
                  
                  {/* Top: Categories or badget tags */}
                  <div className="flex justify-between items-start">
                    <span className="bg-ngo-dark/80 text-[11px] font-semibold font-sans uppercase tracking-wider px-2 py-1 rounded border border-ngo-forest/20">
                      Active
                    </span>
                    <span className="bg-stone-900/40 backdrop-blur-sm text-[11px] font-medium font-sans px-2.5 py-1 rounded-full text-stone-300 flex items-center gap-1 font-bold">
                      👤 {campaign.pledgedCount.toLocaleString()} Pledges
                    </span>
                  </div>

                  {/* Bottom details block */}
                  <div className="flex flex-col gap-2 z-10">
                    <span 
                      className="font-hindi text-xl font-extrabold leading-tight text-white group-hover:text-emerald-300 transition-colors"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9), 0px 0px 8px rgba(0,0,0,0.9)" }}
                    >
                      {campaign.titleHindi}
                    </span>
                    
                    {campaign.subtitleHindi && (
                      <span 
                        className="font-hindi text-xs sm:text-sm text-stone-200 font-bold"
                        style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9), 0px 0px 5px rgba(0,0,0,0.8)" }}
                      >
                        {campaign.subtitleHindi}
                      </span>
                    )}

                    <span 
                      className="text-[11px] font-mono tracking-tight text-stone-300 font-semibold"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.9)" }}
                    >
                      {campaign.titleEnglish}
                    </span>

                    {/* Bottom CTA button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(campaign);
                      }}
                      className="mt-4 w-full bg-[#1b5025] hover:bg-ngo-forest text-[#efe7d6] text-sm font-hindi font-bold py-2 px-4 rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      अभियान देखें
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Wide Dark Green Tagline Banner */}
        <div className="mt-12 bg-[#0f4d24] text-[#efe7d6] rounded-2xl py-6 px-4 sm:px-8 shadow-lg border border-ngo-forest/35 relative overflow-hidden" id="campaign-mission-banner">
          
          {/* Ambient organic background detail */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-ngo-forest/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-ngo-forest/20 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <span className="text-xl sm:text-2xl select-none animate-bounce">🌿</span>
            <p className="font-hindi text-lg sm:text-2xl font-black text-center max-w-4xl tracking-wide drop-shadow">
              पश्चिमांचल केवल एक क्षेत्र नहीं, बल्कि आने वाली पीढ़ियों की विरासत है।
            </p>
            <span className="text-xl sm:text-2xl select-none animate-bounce">🌿</span>
          </div>
        </div>

      </div>

      {/* Campaign Details Dialog Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 bg-stone-955/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCampaign(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#f5f1e8] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-stone-200 text-stone-900 duration-300 transform scale-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-60 w-full">
              <img
                src={selectedCampaign.imageUrl}
                alt={selectedCampaign.titleEnglish}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f5f1e8] via-transparent to-black/50" />
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-stone-900 w-8 h-8 rounded-full flex items-center justify-center p-1 font-bold shadow focus:outline-none focus:ring-2 focus:ring-ngo-forest select-none cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-1 items-start">
                <span className="text-xs font-mono text-ngo-forest uppercase font-bold tracking-widest">
                  CAMPAIGN INITIATIVE
                </span>
                <h3 className="font-hindi text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                  {selectedCampaign.titleHindi}
                </h3>
                <span className="text-sm font-sans font-medium text-stone-500 italic">
                  {selectedCampaign.titleEnglish}
                </span>
              </div>

              <div className="h-px bg-stone-300 my-4" />

              <p className="font-hindi text-base sm:text-lg text-stone-700 leading-relaxed font-semibold">
                {selectedCampaign.description}
              </p>

              {/* Stats & Interactive pledge block */}
              <div className="mt-6 p-4 rounded-xl bg-[#efe7d6]/40 border border-stone-300/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ngo-forest/10 flex items-center justify-center text-ngo-forest">
                    <Award className="w-5 h-5 text-ngo-dark" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                      Movement Supporters
                    </div>
                    <div className="text-xl font-bold font-hindi text-stone-900">
                      {selectedCampaign.pledgedCount.toLocaleString()} पर्यावरण प्रेमी जुड़े हैं
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handlePledge(selectedCampaign.id, e)}
                  disabled={hasPledged[selectedCampaign.id]}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-hindi font-bold text-base transition-all duration-200 select-none cursor-pointer
                    ${
                      hasPledged[selectedCampaign.id]
                        ? "bg-stone-300 text-stone-500 cursor-default"
                        : "bg-ngo-dark hover:bg-ngo-forest text-[#efe7d6] active:scale-95 shadow-md hover:shadow-lg"
                    }
                  `}
                >
                  {hasPledged[selectedCampaign.id] ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      समर्थन दर्ज है
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
                      अपना समर्थन दें
                    </>
                  )}
                </button>
              </div>

              {/* CTA button placeholder */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  बंद करें
                </button>
                <a
                  href="#join"
                  onClick={() => setSelectedCampaign(null)}
                  className="px-5 py-2.5 bg-ngo-forest hover:bg-ngo-forest-hover text-white rounded-lg text-sm font-semibold transition-colors shadow flex items-center gap-1.5"
                >
                  स्वयंसेवक बनें →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

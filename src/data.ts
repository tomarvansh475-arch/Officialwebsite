import { Pillar, Campaign, Achievement, NewsItem, TeamMember, GuideMember, GalleryImage, DonationOption } from "./types";
import nitinSwamiPhoto from "./assets/images/nitin_swami_1780203516611.png";

export const PILLARS_DATA: Pillar[] = [
  {
    id: "p1",
    number: "01",
    title: "शिक्षा",
    titleEn: "Education",
    description: "गुणवत्तापूर्ण व संस्कारयुक्त शिक्षा को बढ़ावा देना, ग्रामीण क्षेत्रों में आधुनिक ज्ञान व कौशल का विकास एवं वंचितों तक शिक्षा की स्वावलंबी पहुँच सुनिश्चित करना।",
    iconName: "GraduationCap"
  },
  {
    id: "p2",
    number: "02",
    title: "स्वास्थ्य",
    titleEn: "Health",
    description: "घातक बीमारियों (जैसे कैंसर आदि) के खिलाफ जन-जागरूकता, ग्राम स्तर पर स्वास्थ्य शिविर, प्राकृतिक जीवनशैली, आयुर्वेद व योग का व्यापक प्रचार।",
    iconName: "HeartPulse"
  },
  {
    id: "p3",
    number: "03",
    title: "न्याय",
    titleEn: "Justice",
    description: "कमजोर, शोषित एवं वंचित लोगों को कानूनी सहायता और अधिकारों के प्रति जागरूक बनाना। सामाजिक न्याय एवं गाँव के आपसी विवादों का शांतिपूर्ण समाधान।",
    iconName: "Scale"
  },
  {
    id: "p4",
    number: "04",
    title: "संस्कृति",
    titleEn: "Culture",
    description: "कौरवी बोली (खड़ी बोली), लोक साहित्य, रागनी, लोकगीत, पारंपरिक मेलों, उत्सवों और पश्चिमांचल की ऐतिहासिक व गौरवशाली लोक विरासत का संरक्षण।",
    iconName: "BookOpen"
  },
  {
    id: "p5",
    number: "05",
    title: "रोजगार",
    titleEn: "Employment",
    description: "स्थानीय ग्रामीण युवाओं के लिए स्वरोजगार, कुटीर उद्योगों एवं कौशल विकास को बढ़ावा देकर पलायन को रोकना और आत्मनिर्भर गाँवों की स्थापना करना।",
    iconName: "Briefcase"
  },
  {
    id: "p6",
    number: "06",
    title: "पर्यावरण",
    titleEn: "Environment",
    description: "जल संवर्धन, प्रदूषित नदियों (जैसे हिंडन) व पारंपरिक तालाबों का पुनरुद्धार, सघन वृक्षारोपण और प्रकृति के साथ संतुलित समन्वय स्थापित करना।",
    iconName: "Leaf"
  },
  {
    id: "p7",
    number: "07",
    title: "खेल",
    titleEn: "Sports",
    description: "ग्रामीण खेलों को पुनर्जीवित करना, क्षेत्रीय स्तर पर खेल प्रतियोगिताओं का आयोजन व युवाओं को शारीरिक मानसिक रूप से स्वस्थ रखने के लिए खेल ढांचा विकसित करना।",
    iconName: "Trophy"
  }
];

export const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: "ach1",
    count: "07",
    titleHindi: "मुख्य स्तंभ",
    titleEnglish: "Main Pillars",
    icon: "Shield"
  },
  {
    id: "ach2",
    count: "10K+",
    titleHindi: "सक्रिय स्वयंसेवक",
    titleEnglish: "Active Volunteers",
    icon: "Users"
  },
  {
    id: "ach3",
    count: "5 Lakh+",
    titleHindi: "वृक्षारोपण का संकल्प",
    titleEnglish: "Trees Planting Target",
    icon: "Trees"
  },
  {
    id: "ach4",
    count: "150+",
    titleHindi: "तालाब पुनरुद्धार",
    titleEnglish: "Ponds Restored",
    icon: "Droplet"
  },
  {
    id: "ach5",
    count: "100%",
    titleHindi: "लोक संस्कृति के प्रति समर्पण",
    titleEnglish: "Dedicated to Folk Culture",
    icon: "Flame"
  }
];

export const CAMPAIGNS_DATA: Campaign[] = [
  {
    id: "c1",
    titleHindi: "हिन्दन बचाओ पश्चिमांचल बचाओ",
    titleEnglish: "Save Hindon River Movement",
    subtitleHindi: "नदी नहीं, यह हमारी जीवनरेखा है",
    subtitleEnglish: "Save our historic lifeline",
    imageUrl: "/src/assets/images/river_march_stones.png",
    description: "हिंडन नदी व उसकी सहायक नदियों को प्रदूषण मुक्त करने और उनमें स्वच्छ जल का नियमित प्रवाह सुनिश्चित करने के लिए व्यापक जन-जागरण तथा जलशुद्धि अभियान।",
    pledgedCount: 12450
  },
  {
    id: "c2",
    titleHindi: "जल पंचायत अभियान",
    titleEnglish: "Water Panchayat Initiative",
    subtitleHindi: "जल है तो कल है",
    subtitleEnglish: "Water is life's future",
    imageUrl: "/src/assets/images/jal_panchayat_tent.png",
    description: "हर ग्राम पंचायत में जल संसद और जल चौपालों का आयोजन, पारंपरिक जलस्रोतों (जौहड़/तालाब) का सीमांकन व अतिक्रमण हटाकर गहरीकरण कार्य।",
    pledgedCount: 8430
  },
  {
    id: "c3",
    titleHindi: "कौरवी बोली बचाओ",
    titleEnglish: "Preserve Kaurvi Language",
    subtitleHindi: "अपनी संस्कृति, अपनी पहचान",
    subtitleEnglish: "Our dialect, our identity",
    imageUrl: "/src/assets/images/kaurvi_language_badge.png",
    description: "पश्चिमांचल की मूल मातृबोली 'कौरवी' को उचित सम्मान दिलाने, इसके लोक साहित्य का दस्तावेज़ीकरण करने और बच्चों/युवाओं में गर्व की भावना जगाने का विशेष मुहिम।",
    pledgedCount: 5120
  },
  {
    id: "c4",
    titleHindi: "वृक्षारोपण एवं पंचवटी निर्माण",
    titleEnglish: "Afforestation & Sacred Groves",
    subtitleHindi: "एक पेड़, माँ के नाम",
    subtitleEnglish: "Plant for Mother Earth",
    imageUrl: "/src/assets/images/yatra_crowd_night.png",
    description: "गाँवों की शामलात भूमि पर वनपट्टिका, औषधीय पौधों से सुसज्जित पंचवटी का निर्माण, और प्रत्येक परिवार द्वारा कम से कम 5 महत्वपूर्ण पेड़ लगाने का संकल्प।",
    pledgedCount: 18900
  }
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: "n1",
    title: "पश्चिमांचल विकास परिषद द्वारा हिंडन नदी के तट पर महा-सफाई और जनजागरण रैली का सफल आयोजन",
    date: "2026-05-15",
    category: "जल अभियान",
    summary: "नदी के किनारे 500 से अधिक पर्यावरण प्रेमियों, ग्रामीणों ने मिलकर श्रमदान अभियान में भाग लिया।",
    content: "मेरठ और बागपत क्षेत्र में हिंडन नदी के संरक्षण के लिए परिषद के मार्गदर्शकों और युवाओं के सहयोग से विशाल पदयात्रा और श्रमदान आयोजन किया गया। अभियान के दौरान लगभग 2 टन प्लास्टिक कचरे को नदी तट से हटाकर पुनर्चक्रण हेतु भेजा गया।",
    imageUrl: "/src/assets/images/yatra_crowd_night.png",
    views: 1240
  },
  {
    id: "n2",
    title: "गायों की सुरक्षा और जैविक खेती को प्रमोट करने के लिए 10 गाँवों में 'गौकृषि गोष्ठी' संपन्न",
    date: "2026-04-28",
    category: "प्राकृतिक खेती",
    summary: "किसानों को जीवामृत, बीजामृत और प्राकृतिक कीटनाशक तैयार करने की विधि का प्रायोगिक प्रशिक्षण दिया गया।",
    content: "मुजफ्फरनगर के शाहपुर ब्लॉक में 'जैविक स्वावलंबन' विषय पर कार्यशाला आयोजित की गई। कृषि विशेषज्ञों ने मिट्टी की उपजाऊ शक्ति बढ़ाने व विषमुक्त अन्न उपजाने का आह्वान किया।",
    imageUrl: "/src/assets/images/stage_banner_kandhla.png",
    views: 950
  },
  {
    id: "n3",
    title: "सांस्कृतिक महोत्सव: रागनी और लोक विधाओं के माध्यम से गूंजी 'कौरवी बोली' की मिठास",
    date: "2026-03-12",
    category: "सांस्कृतिक विधा",
    summary: "स्थानीय कलाकारों ने पश्चिमांचल के इतिहास और वीरों की गाथाओं को प्रस्तुत कर जनमानस को भावविभोर किया।",
    content: "परिषद द्वारा आयोजित पारंपरिक कौरवी लोक महोत्सव में 30 से अधिक कलाकारों और लोक गायकों ने प्राचीन भजनों, रागनियों की मनमोहक प्रस्तुतियां दीं, जिसका उद्देश्य युवा पीढ़ी को अपनी मूल बोली से जोड़ना है।",
    imageUrl: "/src/assets/images/stage_speech_side.png",
    views: 1530
  }
];

export const TEAM_DATA: TeamMember[] = [];

export const GUIDES_DATA: GuideMember[] = [
  {
    id: "g_mentor1",
    name: "आचार्य देवव्रत शास्त्री",
    designation: "वरिष्ठ सांस्कृतिक संरक्षक एवं वेदवेत्ता",
    description: "कौरवी बोली और प्राचीन वेदों के मर्मज्ञ विद्वान, जो पश्चिमांचल की सांस्कृतिक चेतना और युवा पीढ़ी में नैतिक संस्कारों का बीजारोपण करने के निरंतर प्रयासों के मुख्य मार्गदर्शक हैं।",
    imageUrl: "/src/assets/images/nitin_swami_1780203516611.png",
    displayOrder: 1
  },
  {
    id: "g_mentor2",
    name: "रामवीर तंवर (पॉन्डमैन)",
    designation: "मुख्य जल संरक्षण सलाहकार एवं संरक्षक",
    description: "भारत के विख्यात जल योद्धा, जिन्होंने सैकड़ों तालाबों का पुनरुद्धार कर 'पॉन्डमैन' की ख्याति पाई। पश्चिमांचल की नदियों और तालाबों के पुनरुज्जीवन अभियान के तकनीकी आधारदाता।",
    imageUrl: "/src/assets/images/river_march_stones.png",
    displayOrder: 2
  },
  {
    id: "g_mentor3",
    name: "डॉ. सतीश कुमार मलिक",
    designation: "वरिष्ठ भूजल वैज्ञानिक एवं अनुसंधान प्रमुख",
    description: "मृदा एवं जल गुणवत्ता अनुसंधान के प्रणेता। हिंडन व कृष्णी नदी के कछार में कैंसर प्रभावित क्षेत्रों में शुद्ध पेयजल आपूर्ति और जैविक कृषि तकनीक के वैज्ञानिक वैज्ञानिक सलाहकार।",
    imageUrl: "/src/assets/images/stage_speech_side.png",
    displayOrder: 3
  }
];

export const GALLERY_DATA: GalleryImage[] = [
  {
    id: "g1",
    url: "/src/assets/images/river_march_stones.png",
    title: "हिंडन नदी संरक्षण श्रमदान अभियान",
    category: "Hindon Bachao Movement"
  },
  {
    id: "g2",
    url: "/src/assets/images/yatra_crowd_night.png",
    title: "युवा स्वयंसेवकों द्वारा वृक्षारोपण",
    category: "Environmental Campaigns"
  },
  {
    id: "g3",
    url: "/src/assets/images/nitin_swami_1780203516611.png",
    title: "ग्लोकल यूनिवर्सिटी में जनजागरूकता गोष्ठी",
    category: "University Events"
  },
  {
    id: "g4",
    url: "/src/assets/images/stage_banner_kandhla.png",
    title: "कांधला में संगठन का भव्य स्थापना समारोह",
    category: "Public Meetings"
  },
  {
    id: "g5",
    url: "/src/assets/images/ppe_suit_interview.png",
    title: "नदी तट पर पीपीई किट पहन कर मीडिया साक्षात्कार",
    category: "Hindon Bachao Movement"
  },
  {
    id: "g6",
    url: "/src/assets/images/jal_panchayat_tent.png",
    title: "असारा गाँव में पहली जल पंचायत",
    category: "Jal Panchayat"
  },
  {
    id: "g7",
    url: "/src/assets/images/stage_speech_side.png",
    title: "मंच से अध्यक्षीय संबोधन",
    category: "Public Meetings"
  },
  {
    id: "g8",
    url: "/src/assets/images/volunteers_salute.png",
    title: "संगठित पर्यावरण सैनिकों का संकल्प",
    category: "Ground Activities"
  },
  {
    id: "g9",
    url: "/src/assets/images/newspaper_glocal.png",
    title: "ग्लोकल यूनिवर्सिटी कार्यक्रम समाचार पत्र कटिंग",
    category: "Media Coverage"
  },
  {
    id: "g10",
    url: "/src/assets/images/newspaper_jal_panchayat.png",
    title: "पश्चिमी यूपी की पहली जल पंचायत - समाचार पत्र",
    category: "Media Coverage"
  },
  {
    id: "g11",
    url: "/src/assets/images/newspaper_hindon_yatra.png",
    title: "हिंडन बचाओ-पश्चिमांचल बचाओ यात्रा आरंभ",
    category: "Media Coverage"
  },
  {
    id: "g12",
    url: "/src/assets/images/newspaper_toi_walk.png",
    title: "A 225km walk to revive 'dead' Hindon - TOI",
    category: "Media Coverage"
  }
];

export const DONATION_OPTIONS: DonationOption[] = [
  { amount: 501, label: "💧 जल पात्र निधि", impact: "1 जल पंचायत चौपाल और तालाब निरीक्षण सामग्री का खर्च" },
  { amount: 1100, label: "🌱 तरुवर संरक्षण", impact: "10 फलदार और छायादार आयुर्वेदिक पौधों की सुरक्षा घेरा सहित रोपाई" },
  { amount: 2100, label: "🐂 गौ सेवा सहायक", impact: "बेसहारा गौवंश के चारे व प्राथमिक उपचार के लिए 1 सप्ताह की सहायता" },
  { amount: 5100, label: "🎓 संस्कृति वाहक", impact: "1 गाँव में बच्चों के लिए 'कौरवी लोक कला पाठशाला' का 1 माह संचालन" },
  { amount: 11000, label: "🏞️ तालाब संजीवन", impact: "श्रमदान शिविर के लिए औज़ार, अल्पाहार तथा गहरीकरण कार्य में सहयोग" }
];

export const PARTNERS_LOGOS = [
  { name: "राष्ट्रीय जल मिशन", logoText: "💧" },
  { name: "गंगा विचार मंच", logoText: "🌊" },
  { name: "खादी एवं ग्रामोद्योग", logoText: "🌾" },
  { name: "पतंजलि योगपीठ", logoText: "🕉️" },
  { name: "पश्चिमांचल कृषक संगठन", logoText: "🚜" },
  { name: "वेद विद्या प्रतिष्ठान", logoText: "📖" },
  { name: "पर्यावरण वाहिनी", logoText: "☘️" },
  { name: "भूजल प्रहरी संघ", logoText: "🏞️" }
];

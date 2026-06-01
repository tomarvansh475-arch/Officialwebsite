export interface Pillar {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  description: string;
  iconName: string; // Used to pick icons from Lucide
}

export interface Campaign {
  id: string;
  titleHindi: string;
  titleEnglish: string;
  subtitleHindi?: string;
  subtitleEnglish?: string;
  imageUrl: string;
  description: string;
  pledgedCount: number;
}

export interface Achievement {
  id: string;
  count: string;
  titleHindi: string;
  titleEnglish: string;
  icon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  views: number;
}

export interface TeamMember {
  id: string;
  name: string;
  nameHindi: string;
  role: string;
  roleHindi: string;
  imageUrl: string;
  bio?: string;
  socials: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface GuideMember {
  id: string;
  name: string;
  designation: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
}

export interface DonationOption {
  amount: number;
  label: string;
  impact: string;
}

export interface SiteContent {
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroPresidentImg: string;
  heroPresidentName: string;
  heroPresidentSubtitle: string;
  heroSlogan: string;
  heroBtnText: string;
  heroVideoUrl: string;

  // About Us
  aboutBadge: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  aboutWarningText: string;
  aboutText4: string;
  aboutQuote: string;
  aboutQuoteAuthor: string;
  aboutFooterText: string;
  aboutImg1: string;
  aboutImg2: string;
  aboutImg3: string;
  aboutDate: string;

  // President Message
  presMessageTitle: string;
  presMessageName: string;
  presMessageRole: string;
  presMessageImg: string;
  presMessageText1: string;
  presMessageText2: string;
  presMessageText3: string;
  presMessageText4: string;

  // Contact Info
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactMapUrl: string;

  // Website Settings
  siteLogoText: string;
  siteLogoEmoji: string;
  siteFavicon: string;
  siteTitle: string;
  siteFooterText: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;

  // Custom Website & Donation settings
  foundationLocation?: string;
  donationQrCode?: string;
  donationUpiId?: string;
  donationBankName?: string;
  donationAccountHolder?: string;
  donationAccountNumber?: string;
  donationIfscCode?: string;

  // Organization Identity Section (Replaces President Message)
  orgSectionTitle?: string;
  orgSectionDesc?: string;
  orgLogo?: string;
  orgName?: string;
  orgTagline?: string;
  orgMission?: string;
  orgBgImage?: string;
  orgLogoSize?: string;

  // Header Branding Control
  headerLogo?: string;
  headerLogoSize?: number;
  headerLogoPosition?: "left" | "right" | "top";
  headerOrgNameHi?: string;
  headerOrgNameEn?: string;
  headerTagline?: string;
  headerSubtitle?: string;
  headerLogoRestore?: string;
  partnerLogosJson?: string;
  pillarsJson?: string;
}

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Statistics from "./components/Statistics";
import OrganizationIdentity from "./components/OrganizationIdentity";
import GuideSection from "./components/GuideSection";
import AboutPillars from "./components/AboutPillars";
import Campaigns from "./components/Campaigns";
import NewsSection from "./components/NewsSection";
import Gallery from "./components/Gallery";
import JoinForm from "./components/JoinForm";
import DonationSection from "./components/DonationSection";
import Partners from "./components/Partners";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AuthSystem from "./components/AuthSystem";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuthStatus = () => {
    const cachedUser = localStorage.getItem("pvp_current_user");
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        setIsLoggedIn(true);
        setIsAdmin(user.role === "admin" && user.email?.toLowerCase() === "paschimanchalvikasparisad@gmail.com");
      } catch (e) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-state-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-state-change", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "pillars", "campaigns", "news", "join", "donate", "contact"];
      const scrollPosition = window.scrollY + 200; // offset for sticky header

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#efe7d6] text-stone-900 selection:bg-ngo-forest/20 selection:text-ngo-dark antialiased">
      {/* Structural Skip Link for Accessibility */}
      <a href="#home" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-ngo-dark text-[#efe7d6] px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Primary Sticky Header */}
      <Header
        activeSection={activeSection}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
      />

      {/* Main Page Sections content flow */}
      <main className="relative pt-18 sm:pt-20">
        {/* Home/Hero Section */}
        <Hero />

        {/* Introduction Section */}
        <About />

        {/* Key Metrics / Achievements */}
        <Statistics />

        {/* Organization official profile and philosophy */}
        <OrganizationIdentity />

        {/* Leadership & Advisors Panel / Margdarshak Mandal */}
        <GuideSection />

        {/* Seven Core Pillars */}
        <AboutPillars />

        {/* Public Action & Activism Campaigns */}
        <Campaigns />

        {/* News, Updates & Media Section */}
        <NewsSection />

        {/* Interactive photo & action gallery with filters */}
        <Gallery />

        {/* Online Registration & Volunteer Pledge Form */}
        <JoinForm />

        {/* Financial Contribution & Receipt System */}
        <DonationSection />

        {/* Supported Partners / Observers scrolling bar */}
        <Partners />

        {/* Contact form & maps location anchor */}
        <ContactSection />
      </main>

      {/* Global Brand Footer */}
      <Footer />

      {/* Portal Auth Modal System */}
      <AuthSystem
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginStatusChange={() => {
          checkAuthStatus();
        }}
      />
    </div>
  );
}

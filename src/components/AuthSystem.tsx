import React, { useState, useEffect } from "react";
import { 
  User, Lock, Mail, Phone, Key, Check, LogOut, Settings, 
  Trash2, Plus, Search, CheckCircle, Download, Upload, AlertCircle, 
  Edit2, ArrowLeft, RefreshCw, Eye, EyeOff, ShieldCheck, 
  MapPin, Heart, Share2, Award, Calendar, Folder, BookOpen, Image, Briefcase,
  IdCard, Printer
} from "lucide-react";
import { dbInstance, UserProfile, Volunteer, DonationRecord } from "../lib/db";
import { generatePvpMembershipPDF } from "../lib/pdfGenerator";
import { Pillar, GuideMember } from "../types";
import { PILLARS_DATA } from "../data";

// Interfaces
interface AuthSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginStatusChange: () => void;
}

export default function AuthSystem({ isOpen, onClose, onLoginStatusChange }: AuthSystemProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pvp_current_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("pvp_current_user");
    setCurrentUser(null);
    onLoginStatusChange();
    onClose();
    alert("लॉगआउट सफल हुआ! (Logout Successful)");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f5f1e8] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        
        {/* Absolute Close Header Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-stone-600 hover:text-stone-900 bg-stone-200/50 hover:bg-stone-200 p-2 rounded-full cursor-pointer transition-colors"
          title="बंद करें"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {currentUser ? (
            currentUser.role === "admin" && currentUser.email.toLowerCase() === "paschimanchalvikasparisad@gmail.com" ? (
              <AdminDashboard user={currentUser} onLogout={handleLogout} onClose={onClose} />
            ) : (
              <UserProfileView user={currentUser} onLogout={handleLogout} onClose={onClose} onUpdate={() => {
                const updated = localStorage.getItem("pvp_current_user");
                if (updated) setCurrentUser(JSON.parse(updated));
                onLoginStatusChange();
              }} />
            )
          ) : (
            <AuthModal onLoginSuccess={(u) => {
              localStorage.setItem("pvp_current_user", JSON.stringify(u));
              setCurrentUser(u);
              onLoginStatusChange();
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// AUTHENTICATION MODAL (LOGIN / SIGNUP / OTP / RESET)
// ----------------------------------------------------
function AuthModal({ onLoginSuccess }: { onLoginSuccess: (user: UserProfile) => void }) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "otp" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Secret Reset states
  const [resetCode, setResetCode] = useState("");
  const [enteredResetCode, setEnteredResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Clear messages on tab changes
  useEffect(() => {
    setErrorMessage("");
    setSuccessMsg("");
  }, [activeTab]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMessage("कृपया सभी फ़ील्ड भरें! (Please fill all fields)");
      return;
    }

    try {
      setSuccessMsg("सत्यापन चल रहा है... (Verifying via Supabase Auth...)");
      const user = await dbInstance.login(email.trim(), password);
      setSuccessMsg("सफल लॉगिन! पावती लोडिंग...");
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`लॉगिन में त्रुटि: ${err.message || "विवरण गलत हैं"}`);
      setSuccessMsg("");
    }
  };

  const handleGoogleLoginMock = async () => {
    setErrorMessage("");
    setSuccessMsg("गूगल साइन-इन शुरू हो रहा है... (Logging via Supabase Auth...)");
    const emailMock = "vanshkumarv375@gmail.com";
    const pwdMock = "google_oauth_fallback_pwd";

    try {
      let user;
      try {
        user = await dbInstance.login(emailMock, pwdMock);
      } catch {
        user = await dbInstance.signUp("Vansh Kumar", emailMock, "9012345678", pwdMock);
      }
      setSuccessMsg("Google लॉगिन सफल! (Google SignIn Successful)");
      setTimeout(() => {
        onLoginSuccess(user!);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(`Google Auth Error: ${err.message}`);
      setSuccessMsg("");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    if (!fullName || !email || !phone || !password) {
      setErrorMessage("कृपया सभी अनिवार्य फ़ील्ड भरें!");
      return;
    }

    try {
      setSuccessMsg("पंजीकरण जारी है... (Registering in Supabase...)");
      const newUser = await dbInstance.signUp(fullName.trim(), email.trim(), phone.trim(), password);
      setSuccessMsg("पंजीकरण सफल! खाता लॉगिन किया जा रहा है...");
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(`पंजीकरण त्रुटि: ${err.message || "कृपया दोबारा जांचें"}`);
      setSuccessMsg("");
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!phone || phone.length !== 10) {
      setErrorMessage("कृपया 10 अंकों का मान्य मोबाइल नंबर डालें!");
      return;
    }

    // Generate simulated 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setSuccessMsg(`Simulated OTP sent to ${phone}. Enter '${code}' to verify!`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    if (enteredOtp !== generatedOtp) {
      setErrorMessage("गलत ओटीपी! कृपया सही कोड दर्ज करें।");
      return;
    }

    const emailMock = `otp_${phone}@pvp.org`;
    const pwdMock = `otp_fallback_pwd_${phone}`;
    const nameMock = `सदस्य-सैनिक (User ${phone.slice(-4)})`;

    try {
      setSuccessMsg("ओटीपी सत्‍यापित किया जा रहा है... (Verifying via Supabase Auth...)");
      let user;
      try {
        user = await dbInstance.login(emailMock, pwdMock);
      } catch {
        user = await dbInstance.signUp(nameMock, emailMock, phone, pwdMock);
      }
      setSuccessMsg("ओटीपी सत्‍यापन सफल! (OTP Verified successfully)");
      setTimeout(() => {
        onLoginSuccess(user!);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`OTP Login Error: ${err.message}`);
      setSuccessMsg("");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    if (!email) {
      setErrorMessage("कृपया पंजीकृत ईमेल दर्ज करें!");
      return;
    }

    try {
      setSuccessMsg("रीसेट ईमेल भेजा जा रहा है... (Sending password reset...)");
      await dbInstance.resetPasswordForEmail(email.trim());
      setSuccessMsg(`पासवर्ड रीसेट लिंक सफलतापूर्वक भेज दिया गया है। कृपया अपना ईमेल स्पैम भी चेक करें।`);
    } catch (err: any) {
      setErrorMessage(`ईमेल प्रेषण त्रुटि: ${err.message}`);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setErrorMessage("नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए!");
      return;
    }

    try {
      setSuccessMsg("पासवर्ड बदला जा रहा है... (Applying new password...)");
      await dbInstance.updatePassword(newPassword);
      setSuccessMsg("पासवर्ड सफलतापूर्वक बदल दिया गया! कृपया अब लॉगिन करें।");
      setTimeout(() => {
        setActiveTab("login");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`पासवर्ड रीसेट त्रुटि: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[400px]">
      
      {/* Visual Column */}
      <div className="md:col-span-5 h-full hidden md:flex flex-col justify-between p-6 bg-ngo-dark text-[#efe7d6] rounded-2xl border border-ngo-forest/40">
        <div>
          <span className="text-xl">🌱</span>
          <h2 className="font-hindi text-2xl font-black mt-3">पश्चिमांचल स्वावलंबन पोर्टल</h2>
          <div className="w-12 h-1 bg-amber-400 my-4" />
          <p className="font-hindi text-sm text-stone-200 leading-relaxed font-semibold">
            अपनी मातृभूमि पश्चिमांचल की सेवा के लिए एक साझा मंच। सैनिक लॉगिन करके अपने द्वारा किए गए योगदान, जुड़े अभियानों व कर-छूट रसीदों को एक ही स्थान से डाउनलोड कर सकते हैं।
          </p>
        </div>
        
        <div className="border-t border-[#efe7d6]/20 pt-4 mt-6">
          <p className="font-hindi text-xs text-amber-300">
            "प्रकृतिः रक्षति रक्षिता" • Nature Protects Those Who Protect It.
          </p>
        </div>
      </div>

      {/* Forms Column */}
      <div className="md:col-span-7">
        
        {/* Toggle navigation labels */}
        {activeTab !== "reset" && activeTab !== "forgot" && (
          <div className="flex border-b border-stone-300 mb-6 gap-2">
            <button
              onClick={() => setActiveTab("login")}
              className={`pb-2.5 px-4 font-hindi text-lg font-extrabold cursor-pointer transition-all border-b-2 ${
                activeTab === "login" || activeTab === "otp"
                  ? "border-[#0f4d24] text-[#0f4d24]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              लॉगिन (Sign In)
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`pb-2.5 px-4 font-hindi text-lg font-extrabold cursor-pointer transition-all border-b-2 ${
                activeTab === "signup"
                  ? "border-[#0f4d24] text-[#0f4d24]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              नया खाता खोलें (Sign Up)
            </button>
          </div>
        )}

        {/* Global Messages info */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 text-sm font-hindi rounded-xl border border-red-300 flex items-center gap-2 font-semibold animate-pulse">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 text-sm font-hindi rounded-xl border border-emerald-300 flex items-center gap-2 font-semibold">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {activeTab === "login" && (
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div className="flex flex-col">
              <label className="font-hindi text-sm font-bold text-stone-800 mb-1">पंजीकृत ईमेल आईडी (Registered Email) *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ngo-forest"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <label className="font-hindi text-sm font-bold text-stone-800">पासवर्ड (Password) *</label>
                <button
                  type="button"
                  onClick={() => setActiveTab("forgot")}
                  className="text-xs text-ngo-forest font-bold hover:underline cursor-pointer"
                >
                  पासवर्ड भूल गए?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ngo-forest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] py-3 rounded-xl font-hindi text-base font-extrabold shadow hover:shadow-md transition-all cursor-pointer active:scale-[0.99] mt-2 block"
            >
              लॉगिन करें (Sign In Account)
            </button>

            {/* Alternates */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f5f1e8] px-2 text-stone-500 font-bold font-hindi">अन्य विकल्प (Options)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("otp")}
                className="py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-850 hover:text-amber-900 border border-amber-500/30 rounded-xl text-xs font-hindi font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                मोबाईल नंबर ओटीपी लॉगिन (OTP)
              </button>
              <button
                type="button"
                onClick={handleGoogleLoginMock}
                className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.415 0-6.182-2.767-6.182-6.182 0-3.414 2.767-6.182 6.182-6.182 1.6 0 3.03.614 4.12 1.614l2.9-2.9C18.665 2.18 15.65 1 12.24 1C6.015 1 1 6.015 1 12.24s5.015 11.24 11.24 11.24c5.895 0 10.82-4.22 10.82-11.24 0-.768-.068-1.514-.194-2.24H12.24z"
                  />
                </svg>
                Google से लॉगिन करें
              </button>
            </div>
          </form>
        )}

        {/* 2. MOBILE NUMBER OTP LOGIN (DISABLED / UNCONFIGURED) */}
        {activeTab === "otp" && (
          <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Phone className="w-8 h-8 text-orange-600 shrink-0 animate-bounce" />
              <h4 className="font-hindi text-base sm:text-lg font-black text-amber-950">
                मोबाइल ओटीपी लॉगिन (Mobile OTP Login)
              </h4>
              <p className="font-hindi text-xs sm:text-sm font-bold text-orange-700 mt-2 leading-relaxed">
                मोबाइल ओटीपी सेवा अभी कॉन्फ़िगर नहीं की गई है।
              </p>
              <p className="font-sans text-[11px] font-semibold text-stone-600 leading-normal">
                Mobile OTP service not configured.
              </p>
              <p className="font-hindi text-xs text-stone-700 bg-white/70 p-3 rounded-xl border border-stone-200 mt-1 leading-relaxed">
                कृपया सुरक्षित एवं निर्बाध पहुंच के लिए <span className="font-bold">ईमेल और पासवर्ड (Email & Password Login)</span> विकल्प का उपयोग करें।
              </p>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="w-full py-2.5 bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] font-hindi font-bold rounded-xl text-sm shadow transition-all cursor-pointer"
              >
                ईमेल लॉगिन पर वापस जाएं (Back to Email Login)
              </button>
            </div>
          </div>
        )}

        {/* 3. SIGNUP MODE */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="flex flex-col">
              <label className="font-hindi text-xs font-bold text-stone-800 mb-0.5">पूरा नाम (Full Name) *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  required
                  placeholder="अपना नाम दर्ज करें"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-hindi text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-hindi text-xs font-bold text-stone-800 mb-0.5">ईमेल (Email ID) *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-hindi text-xs font-bold text-stone-800 mb-0.5">मोबाइल नंबर (10 Digit Phone) *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="tel"
                  required
                  placeholder="जैसे: 9876543210"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-hindi text-xs font-bold text-stone-800 mb-0.5">पासवर्ड बनाएं (Create Password) *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  required
                  placeholder="कम से कम 5 अक्षर"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] py-2.5 rounded-xl font-hindi text-base font-extrabold shadow hover:shadow-md transition-all cursor-pointer mt-3"
            >
              खाता बनाएं (Register Profile)
            </button>
          </form>
        )}

        {/* 4. FORGOT PASSWORD */}
        {activeTab === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <h3 className="font-hindi text-lg font-black text-stone-900 border-b pb-2">पारंपरिक सुरक्षा: पासवर्ड भूल गए?</h3>
            <p className="font-hindi text-xs text-stone-600 leading-normal mb-3">
              कृपया पंजीकृत ईमेल पता टाइप करें। हम आपको डेटाबेस से सुरक्षित वेरिफिकेशन कोड सिमुलेट करेंगे।
            </p>
            
            <div className="flex flex-col">
              <label className="font-hindi text-sm font-bold text-stone-800 mb-1">ईमेल एड्रेस (Registered Email) *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="flex-1 py-2.5 border border-stone-400 font-hindi font-bold hover:bg-stone-200 text-stone-700 rounded-xl text-center text-sm cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="submit"
                className="flex-[2] bg-ngo-dark hover:bg-ngo-forest text-white py-2.5 font-hindi font-extrabold rounded-xl text-sm transition-all text-center cursor-pointer shadow"
              >
                वेरिफिकेशन कोड प्राप्त करें
              </button>
            </div>
          </form>
        )}

        {/* 5. RESET PASSWORD ACTION */}
        {activeTab === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <h3 className="font-hindi text-lg font-black text-[#0f4d24]">नया पासवर्ड रीसेट करें</h3>
            
            <div className="flex flex-col">
              <label className="font-hindi text-sm font-bold text-stone-800 mb-1">प्रदान किया गया 6-अंकीय कोड दर्ज करें *</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                <input
                  type="text"
                  required
                  placeholder="वेरिफिकेशन कोड"
                  value={enteredResetCode}
                  onChange={(e) => setEnteredResetCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-hindi text-sm font-bold text-stone-800 mb-1">नया पासवर्ड बनाएं (New Password) *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                <input
                  type="password"
                  required
                  placeholder="न्यूनतम 5 वर्ण"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#efe7d6]/40 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 font-hindi font-extrabold rounded-xl shadow transition-all cursor-pointer"
            >
              रीसेट एवं अपडेट पासवर्ड
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

// ----------------------------------------------------
// USER PROFILE DASHBOARD VIEW
// ----------------------------------------------------
function UserProfileView({ user, onLogout, onUpdate, onClose }: { user: UserProfile; onLogout: () => void; onUpdate: () => void; onClose?: () => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  const [password, setPassword] = useState(user.password || "");
  const [isEditing, setIsEditing] = useState(false);
  
  const [personalDonations, setPersonalDonations] = useState<DonationRecord[]>([]);
  const [savedUserCampaigns, setSavedUserCampaigns] = useState<any[]>([]);
  const [membership, setMembership] = useState<Volunteer | null>(null);

  useEffect(() => {
    // Filter donations belonging to this user
    const allDons = dbInstance.getDonations();
    const mine = allDons.filter(d => d.donorEmail.toLowerCase() === user.email.toLowerCase() || d.userId === user.uid);
    setPersonalDonations(mine);

    // Get joined campaigns
    const allCamps = dbInstance.getCampaigns();
    const joined = allCamps.filter(c => user.joinedCampaignIds.includes(c.id));
    setSavedUserCampaigns(joined);
  }, [user]);

  useEffect(() => {
    const fetchMembership = () => {
      const allMembers = dbInstance.getVolunteers();
      const myMember = allMembers.find(v => 
        (user.volunteerId && v.id === user.volunteerId) ||
        (v.email && v.email.toLowerCase() === user.email.toLowerCase()) || 
        (v.phone && v.phone === user.phone)
      );
      setMembership(myMember || null);
    };

    fetchMembership();
    window.addEventListener("storage", fetchMembership);
    window.addEventListener("pvp_site_content_updated", fetchMembership);
    return () => {
      window.removeEventListener("storage", fetchMembership);
      window.removeEventListener("pvp_site_content_updated", fetchMembership);
    };
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbInstance.updateUserProfile(user.uid, {
      fullName,
      phone,
      bio,
      password
    });
    if (updated) {
      localStorage.setItem("pvp_current_user", JSON.stringify(updated));
      setIsEditing(false);
      onUpdate();
      alert("प्रोफ़ाइल डेटा सफलतापूर्वक अपडेट किया गया! (Profile updated)");
    }
  };

  const downloadSingleReceipt = (receipt: DonationRecord) => {
    if (receipt.status !== "सफल (Paid)") {
      alert("यह रसीद अभी स्वीकृत/वेरिफाइड नहीं हुई है! कृपया पहले एडमिन सत्यापन की प्रतीक्षा करें। (Payment Verification Pending)");
      return;
    }
    const htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>आयकर छूट दान रसीद - पश्चिमांचल विकास परिषद</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #f5f1e8; color: #1c1917; margin: 0; padding: 40px; }
    .certificate { border: 8px double #1b5025; padding: 40px; max-width: 700px; margin: 20px auto; background-color: #ffffff; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-radius: 8px; }
    .header { text-align: center; border-bottom: 2px dashed #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 36px; margin-bottom: 8px; }
    .title-main { font-size: 26px; font-weight: 900; color: #0f4d24; margin: 0; }
    .title-sub { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #78716c; margin: 5px 0 15px 0; }
    .cert-badge { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 6px 16px; border-radius: 9999px; font-size: 13px; display: inline-block; font-weight: 700; }
    .body-content { line-height: 1.8; font-size: 15px; margin-bottom: 40px; }
    .grid-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
    .grid-table td { padding: 12px 10px; border-bottom: 1px solid #f5f5f4; }
    .grid-table td.label { color: #78716c; font-weight: 600; }
    .grid-table td.value { font-weight: 700; text-align: right; }
    .amount-box { background-color: #fdfcf7; border: 1px solid #efe7d6; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .amount-value { font-size: 26px; font-weight: 950; color: #0f4d24; }
    .footer-signs { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-text { font-size: 12px; color: #78716c; font-style: italic; }
    .sign-block { text-align: right; }
    .signature { font-size: 20px; font-weight: 700; color: #0f4d24; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🌱</div>
      <h1 class="title-main">पश्चिमांचल विकास परिषद (भारत)</h1>
      <div class="title-sub">Paschimanchal Vikas Parishad (PVP)</div>
      <div class="cert-badge">80G आयकर दान प्रमाण-पत्र (DONATION RECEIPT)</div>
    </div>
    <div class="body-content">
      <p>सहर्ष प्रमाणित किया जाता है कि पर्यावरण संरक्षण, तालाब संवर्धन एवं सांस्कृतिक संवर्धन जन-अभियान हेतु निम्नलिखित दान राशि सफलतापूर्वक प्राप्त हुई है:</p>
      <table class="grid-table">
        <tr><td class="label">रसीद संख्या (Receipt Ref):</td><td class="value">${receipt.receiptId}</td></tr>
        <tr><td class="label">दाता का नाम (Donor Name):</td><td class="value">${receipt.donorName}</td></tr>
        <tr><td class="label">ईमेल पता (Email):</td><td class="value">${receipt.donorEmail}</td></tr>
        <tr><td class="label">पैन कार्ड (PAN Number):</td><td class="value">${receipt.pan}</td></tr>
        <tr><td class="label">दान की तिथि (Date):</td><td class="value">${receipt.date}</td></tr>
      </table>
      <div class="amount-box">
        <span class="label">कुल स्वीकृत दान राशि (Total Donated Amount):</span>
        <div class="amount-value">₹${receipt.amount.toLocaleString()}</div>
      </div>
    </div>
    <div class="footer-signs">
      <div class="footer-text">"प्रकृतिः रक्षति रक्षिता"</div>
      <div class="sign-block">
        <div class="signature">Nitin Swami</div>
        <div style="font-size: 14px; font-weight: 850;">(नितिन स्वामी)</div>
        <div style="font-size: 11px; color: #78716c;">राष्ट्रीय अध्यक्ष • पी.वी.प. (भारत)</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PVP_Receipt_${receipt.receiptId.replace(/\//g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMembershipDoc = async () => {
    if (!membership) return;
    await generatePvpMembershipPDF(membership);
  };

  const _old_downloadMembershipDoc = () => {
    if (!membership) return;
    const isApproved = membership.status === "सक्रिय (Approved)";
    const statusText = isApproved ? "सक्रिय (Approved)" : "लंबित (Pending Review)";
    const statusColor = isApproved ? "#0f4d24" : "#b45309";
    const statusBg = isApproved ? "#ecfdf5" : "#fef3c7";
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>PVP Membership Card & Certificate - ${membership.fullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;750;900&family=Playfair+Display:ital,wght@1,700&display=swap');
    body { font-family: 'Inter', system-ui, sans-serif; background-color: #f5f1e8; color: #1c1917; margin: 0; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
    
    @media print {
      body { background-color: #ffffff; padding: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    
    .no-print-btn { background: #0f4d24; color: #efe7d6; border: none; padding: 12px 24px; font-weight: 800; border-radius: 12px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: all 0.2s; }
    .no-print-btn:hover { background: #155e2d; }
    
    /* 1. Identity Card Box */
    .id-card {
      width: 460px;
      height: 270px;
      background: linear-gradient(135deg, #fdfcf7 0%, #efe7d6 100%);
      border: 6px double #0f4d24;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 15px;
      box-sizing: border-box;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1.5);
      font-size: 150px;
      opacity: 0.04;
      z-index: 0;
      pointer-events: none;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(15, 77, 36, 0.2);
      padding-bottom: 8px;
      z-index: 10;
    }
    .header-logo {
      width: 40px;
      height: 40px;
      background-color: #0f4d24;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #faf7f0;
      font-size: 20px;
      font-weight: bold;
      border: 2px solid #b45309;
    }
    .header-title-container {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .header-title-hi {
      font-size: 13px;
      font-weight: 900;
      color: #0f4d24;
      margin: 0;
    }
    .header-subtitle-en {
      font-size: 8px;
      color: #7c2d12;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 2px 0 0 0;
    }
    .card-body {
      display: flex;
      gap: 15px;
      align-items: flex-start;
      margin: 10px 0;
      z-index: 10;
    }
    .passport-box {
      width: 80px;
      height: 105px;
      border-radius: 8px;
      border: 1px solid rgba(15,77,36,0.3);
      background-color: #faf7f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .passport-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fields-box {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      text-align: left;
      gap: 6px;
    }
    .field-row {
      display: flex;
      flex-direction: column;
    }
    .field-row-full {
      display: flex;
      flex-direction: column;
      grid-column: span 2;
    }
    .field-label {
      font-size: 8px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: bold;
      line-height: 1;
    }
    .field-value {
      font-size: 11px;
      font-weight: 800;
      color: #1f2937;
      line-height: 1.2;
    }
    .field-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 8px;
    }
    .card-footer {
      border-top: 1px solid rgba(15, 77, 36, 0.15);
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 10;
    }
    .footer-role {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .role-title {
      font-size: 8px;
      font-weight: 800;
      color: #1f2937;
    }
    .role-desc {
      font-size: 7px;
      color: #9ca3af;
    }
    .president-sign-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sign-svg {
      opacity: 0.85;
      margin-bottom: 2px;
    }
    .sign-name {
      font-size: 6.5px;
      font-weight: 900;
      color: #1f2937;
      white-space: nowrap;
    }
    
    /* 2. Certificate Box */
    .certificate {
      background-color: #faf7f0;
      border-radius: 24px;
      padding: 30px;
      border: 12px double #0d361a;
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
      width: 650px;
      box-sizing: border-box;
      text-align: center;
    }
    .cert-deco-1 { position: absolute; inset: 6px; border: 2px solid rgba(180, 83, 9, 0.15); border-radius: 18px; pointer-events: none; }
    .cert-deco-2 { position: absolute; inset: 10px; border: 1px dashed rgba(15, 77, 36, 0.2); border-radius: 14px; pointer-events: none; }
    .cert-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.03; font-size: 250px; z-index: 0; pointer-events: none; }
    .cert-top-tag { font-size: 9px; letter-spacing: 2px; color: #4b5563; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
    .cert-org-h1 { font-size: 24px; font-weight: 900; color: #0d361a; margin: 0; }
    .cert-slogan { font-size: 9px; font-weight: 800; color: #b45309; background-color: #efe7d6; padding: 2px 12px; border-radius: 9999px; border: 1px solid #d1c4aa; display: inline-block; margin-top: 6px; }
    .divider { width: 80px; height: 1px; background-color: #d1c4aa; margin: 15px auto; }
    .cert-title { font-size: 20px; font-weight: 900; color: #7c2d12; margin: 0; }
    .cert-p { font-size: 12px; color: #4b5563; margin: 18px 0 6px 0; }
    .cert-name { font-size: 22px; font-weight: 900; color: #111827; border-bottom: 2px dashed rgba(17, 24, 39, 0.3); padding: 0 20px 4px 20px; display: inline-block; margin: 5px 0; }
    .cert-details { font-size: 11px; color: #4b5563; font-style: italic; margin-top: 6px; }
    .cert-body-detail { font-size: 12px; color: #1f2937; line-height: 1.6; max-width: 500px; margin: 15px auto; font-weight: 600; }
    .cert-pledge { font-size: 11px; color: #0d361a; background-color: rgba(13, 54, 26, 0.05); padding: 4px 15px; border-radius: 8px; border: 1px solid rgba(13, 54, 26, 0.1); width: max-content; margin: 8px auto; }
    .cert-grid-footer { display: grid; grid-template-cols: 1.2fr 1fr 1.2fr; width: 100%; margin-top: 30px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 15px; align-items: flex-end; }
    .cert-footer-side-left { text-align: left; font-size: 9px; color: #374151; display: flex; flex-direction: column; gap: 4px; }
    .cert-footer-side-right { text-align: right; font-size: 9px; color: #374151; display: flex; flex-direction: column; align-items: flex-end; }
    .cert-seal-middle { display: flex; justify-content: center; }
    .cert-seal { width: 44px; height: 44px; border-radius: 50%; border: 3px dashed rgba(180, 83, 9, 0.25); display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: rgba(180, 83, 9, 0.08); color: #b45309; font-size: 6px; font-weight: 950; transform: rotate(10deg); }
    .cert-badge-status { position: absolute; top: 15px; right: 15px; background-color: ${statusBg}; color: ${statusColor}; border: 1.5px solid ${statusColor}; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
  </style>
</head>
<body>
  
  <button class="no-print-btn no-print" onclick="window.print()">🖨️ मुद्रित करें / सहेजें (Print or Save PDF)</button>

  <!-- 1. DYNAMIC MEMBERSHIP ID CARD -->
  <div class="id-card">
    <div class="watermark">🌱</div>
    <div class="card-header">
      <div class="header-logo">🌱</div>
      <div class="header-title-container">
        <h1 class="header-title-hi">पश्चिमांचल विकास परिषद (भारत)</h1>
        <span class="header-subtitle-en">प्रकृति से संस्कृति की ओर • स्वयंसेवक सैन्य</span>
      </div>
    </div>
    
    <div class="card-body">
      <div class="passport-box">
        ${membership.photoUrl ? `<img src="${membership.photoUrl}" alt="Passport photo" />` : `<span style="font-size:32px">👤</span>`}
      </div>
      <div class="fields-box">
        <div class="field-row">
          <span class="field-label">नाम (Active Guardian)</span>
          <span class="field-value" style="color: #0f4d24; font-size: 12px;">${membership.fullName}</span>
        </div>
        
        <div class="field-grid">
          <div class="field-row">
            <span class="field-label">पिता का नाम (Father)</span>
            <span class="field-value">${membership.fathersName || "N/A"}</span>
          </div>
          <div class="field-row">
            <span class="field-label">संबद्ध जिला (District)</span>
            <span class="field-value" style="color:#0f4d24">${membership.district || "N/A"}</span>
          </div>
        </div>
        
        <div class="field-grid">
          <div class="field-row">
            <span class="field-label">सदस्यता संख्या (ID No)</span>
            <span class="field-value" style="font-family: monospace; color:#7c2d12; font-size: 10.5px;">${membership.id}</span>
          </div>
          <div class="field-row">
            <span class="field-label">पंजीकरण तिथि (Date)</span>
            <span class="field-value" style="font-family: monospace;">${membership.createdAt ? new Date(membership.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="footer-role">
        <span class="role-title">पद: राष्ट्र-रक्षक पर्यावरण प्रहरी श्रेणी-१</span>
        <span class="role-desc">PVP Registered Volunteer Member Active</span>
      </div>
      <div class="president-sign-box">
        <svg width="36" height="10" viewBox="0 0 100 30" class="sign-svg">
          <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <span class="sign-name">(नितिन स्वामी - अध्यक्ष)</span>
      </div>
    </div>
  </div>

  <div class="page-break no-print" style="height: 40px;"></div>

  <!-- 2. DYNAMIC MEMBERSHIP CERTIFICATE -->
  <div class="certificate">
    <div class="cert-deco-1"></div>
    <div class="cert-deco-2"></div>
    <div class="cert-watermark">🌱</div>
    <div class="cert-badge-status">${statusText}</div>
    
    <span class="cert-top-tag">OFFICIAL INDUCTION CERTIFICATE</span>
    <h1 class="cert-org-h1">पश्चिमांचल विकास परिषद (भारत)</h1>
    <div class="cert-slogan">"वसुधैव कुटुम्बकम् • प्रकृतिः रक्षति रक्षिता"</div>
    
    <div class="divider"></div>
    
    <h2 class="cert-title">🌻 राष्ट्र जागृति सेवा सम्मान-पत्र 🌻</h2>
    
    <p class="cert-p">ससम्मान प्रमाणित किया जाता है कि राष्ट्रप्रेमी</p>
    <div class="cert-name">${membership.fullName}</div>
    
    <div class="cert-details">
      पुत्र/पुत्री : <strong>${membership.fathersName || "N/A"}</strong>, निवासी : <strong>${membership.city || "N/A"}</strong> (${membership.district})
    </div>
    
    <div class="cert-body-detail">
      ने स्वेच्छा से परिषद की सामाजिक एवं पर्यावरणीय चेतना प्रभाग में
      <div class="cert-pledge">सक्रिय राष्ट्र रक्षक सदस्य</div>
      के रूप में सम्मिलित होकर प्रकृति व मानवता की रक्षा हेतु सहकारित्व का संकल्प लिया है। परिषद् आपके यशस्वी और पर्यावरण-अनुकूल भावी जीवन की मंगल कामना करती है।
    </div>
    
    <div class="cert-grid-footer">
      <div class="cert-footer-side-left">
        <span style="font-weight: bold; color: #0d361a;">ID: ${membership.id}</span>
        <span style="font-weight: bold; color: #b45309;">CERT: ${membership.certificateNo || "PVP-CRT-2026-6111"}</span>
        <span>दिनांक: ${membership.createdAt ? new Date(membership.createdAt).toLocaleDateString("hi-IN") : "N/A"}</span>
      </div>
      
      <div class="cert-seal-middle">
        <div class="cert-seal">
          <span>🌱 SEAL</span>
          <span style="font-size: 10px; margin: 1px 0;">🌱</span>
          <span>OFFICIAL</span>
        </div>
      </div>
      
      <div class="cert-footer-side-right">
        <svg width="40" height="12" viewBox="0 0 100 30" style="margin-bottom: 2px;">
          <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <span style="font-weight: 950; color: #111827;">(नितिन स्वामी)</span>
        <span style="font-size: 7px; color: #6b7280; text-transform: uppercase;">President, PVP Core</span>
      </div>
    </div>
  </div>

</body>
</html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header segment overlay */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ngo-dark text-[#efe7d6] p-6 rounded-2xl border border-ngo-forest/40 w-full overflow-hidden max-w-full">
        <div className="flex-1 min-w-0 max-w-full">
          <span className="bg-amber-400 text-ngo-dark font-hindi font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider select-none block w-max max-w-full whitespace-normal break-words sm:inline-block">सक्रिय सदस्य सैनिक (Volunteer User)</span>
          <h2 className="font-hindi text-xl sm:text-2.5xl font-black mt-2 break-words max-w-full">{user.fullName}</h2>
          <p className="font-sans text-xs text-stone-200 mt-1 break-all whitespace-normal">{user.email} • Mobile: {user.phone}</p>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-hindi font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          लॉगआउट (Logout)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Edit Details inside profile view */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-md">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
            <h3 className="font-hindi text-base font-black text-[#0f4d24]">सदस्य प्रोफ़ाइल (Information)</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-stone-500 hover:text-ngo-forest p-1 rounded hover:bg-stone-100 cursor-pointer"
              title="जानकारी बदलें"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4 font-hindi">
              <div>
                <span className="text-stone-500 font-bold text-xs block">योगदानकर्ता का बायो</span>
                <p className="text-stone-800 text-sm font-semibold mt-1 leading-relaxed bg-[#fdfcf7] p-3 rounded-lg border border-stone-150">{user.bio || "कोई बायो उपलब्ध नहीं है।"}</p>
              </div>
              <div>
                <span className="text-stone-500 font-bold text-xs block">सदस्यता तिथि (Created Date)</span>
                <p className="text-stone-800 font-sans text-xs font-bold mt-0.5">{new Date(user.createdAt).toLocaleDateString("hi-IN")}</p>
              </div>
              {user.volunteeredPillars.length > 0 && (
                <div>
                  <span className="text-stone-500 font-bold text-xs block">सहबद्ध पर्यावरण सेना प्रभाग</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.volunteeredPillars.map((p, idx) => (
                      <span key={idx} className="bg-ngo-cream text-ngo-forest text-xs font-bold px-2 py-0.5 rounded border border-ngo-forest/20">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col">
                <label className="font-hindi text-xs font-bold text-stone-800 mb-1">पूरा नाम</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efe7d6]/40 border border-stone-300 rounded-xl font-hindi text-xs focus:outline-none focus:border-ngo-forest"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-hindi text-xs font-bold text-stone-800 mb-1">मोबाइल नंबर</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efe7d6]/40 border border-stone-300 rounded-xl font-sans text-xs focus:outline-none focus:border-ngo-forest"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-hindi text-xs font-bold text-stone-800 mb-1">बायो (संक्षेप में)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efe7d6]/40 border border-stone-300 rounded-xl font-hindi text-xs focus:outline-none focus:border-ngo-forest resize-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-hindi text-xs font-bold text-stone-800 mb-1">पासवर्ड</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efe7d6]/40 border border-stone-300 rounded-xl font-sans text-xs focus:outline-none focus:border-ngo-forest"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-1.5 border border-stone-300 font-hindi rounded-lg text-xs hover:bg-stone-100 cursor-pointer text-stone-600 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-ngo-dark text-[#efe7d6] font-hindi rounded-lg text-xs hover:bg-ngo-forest cursor-pointer font-bold"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right side checklist: joined campaigns, previous 80G donations with receipt prints */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PVP MEMBERSHIP STATUS BAR & ID CARD ACCORDION */}
          {!membership ? (
            <div className="bg-gradient-to-br from-[#faf7f0] to-[#efe7d6] p-6 rounded-2xl border border-stone-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 text-left">
                <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">अपूर्ण सदस्यता (Registration Missing)</span>
                <h4 className="font-hindi text-base sm:text-lg font-black text-[#0f4d24] mt-1">आप अभी तक संगठन के आधिकारिक सदस्य के रूप में पंजीकृत नहीं हैं!</h4>
                <p className="font-hindi text-xs text-stone-600 leading-normal">
                  पर्यावरण प्रहरी सेना सैनिक बनने, अपना डिजिटल सदस्यता कार्ड, और प्रशस्ति प्रमाण-पत्र प्राप्त करने के लिए कृपया हमारे सदस्यता फ़ॉर्म को पूर्ण करें।
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("join");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                  onClose && onClose();
                }}
                className="shrink-0 font-hindi text-xs font-black bg-[#0f4d24] hover:bg-[#155e2d] text-[#efe7d6] px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-xl text-center cursor-pointer"
              >
                🌿 सदस्यता फ़ॉर्म भरें (Join Now)
              </button>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 mb-4 text-left">
                <div>
                  <h3 className="font-hindi text-sm sm:text-base font-black text-[#0f4d24] flex items-center gap-1.5">
                    <IdCard className="w-5 h-5 text-emerald-600" />
                    परिषद आधिकारिक डिजिटल सदस्यता कार्ड (PVP Membership ID-Card)
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">Membership ID: {membership.id} • Registered</p>
                </div>
                
                <span className={`self-start sm:self-auto text-[10px] sm:text-xs px-3 py-1 rounded-full font-hindi font-bold border ${
                  membership.status === "सक्रिय (Approved)" 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                    : membership.status === "अस्वीकृत (Rejected)"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-300 text-amber-800"
                }`}>
                  स्थिति: {membership.status || "लंबित (Pending Review)"}
                </span>
              </div>

              {(membership.status === "लंबित (Pending)" || membership.status === "लंबित (Pending Review)" || !membership.status.includes("सक्रिय")) && (
                <div className="text-left bg-amber-55/40 border border-amber-200 p-4 rounded-xl mb-4">
                  <h4 className="font-hindi text-xs font-extrabold text-amber-850 flex items-center gap-1">
                    ⏰ आपका सदस्य आवेदन प्रशासनिक पुनरावलोकन में लंबित है
                  </h4>
                  <p className="font-hindi text-[11px] text-stone-600 mt-1 leading-normal">
                    राष्ट्रीय अध्यक्ष नितिन स्वामी व पश्चिमांचल विकास परिषद केंद्रीय समिति आपके द्वारा प्रदान किए गए विवरणों की पुष्टि कर रही है। जैसे ही आपका आवेदन स्वीकृत होगा, आपका पूर्णतः सत्यापित सदस्य पहचान पत्र व सेवा प्रमाण-पत्र यहाँ डाउनलोड अथवा प्रिंट हेतु सक्रिय कर दिया जाएगा।
                  </p>
                </div>
              )}

              {/* MEMBERSHIP CARD AND CERTIFICATE PRESENTATIONS */}
              <div className="flex flex-col items-center gap-6 mt-4">
                
                {/* 1. Identity card display box */}
                <div 
                  className={`w-full max-w-[460px] h-[270px] bg-gradient-to-br from-[#fcfbf7] to-[#efe7d6] border-4 border-[#0f4d24] rounded-2xl relative overflow-hidden text-stone-900 shadow-md border-double flex flex-col justify-between p-3.5 select-none ${
                    membership.status !== "सक्रिय (Approved)" ? "opacity-60 grayscale" : ""
                  }`}
                  style={{ borderStyle: "double", borderWidth: "6px" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0 scale-125 select-none text-7xl">
                    🌱
                  </div>
                  
                  {/* Card status watermark overlays if not approved */}
                  {membership.status !== "सक्रिय (Approved)" && (
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center z-20 pointer-events-none">
                      <span className="font-hindi text-sm font-black bg-amber-600 text-[#efe7d6] border border-amber-500 py-1.5 px-4 rounded-xl shadow-lg -rotate-12 transform">
                        लंबित (Under Review)
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-[#0f4d24]/30 pb-2 z-10 text-left">
                    <div className="w-10 h-10 shrink-0 bg-[#0f4d24] rounded-lg flex items-center justify-center text-white font-bold select-none text-lg border-2 border-amber-500">
                      🌱
                    </div>
                    <div className="flex flex-col">
                      <span className="font-hindi text-xs sm:text-sm font-black text-[#0f4d24] tracking-wide leading-none">
                        पश्चिमांचल विकास परिषद (भारत)
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-hindi text-amber-800 font-extrabold tracking-wider leading-none mt-1">
                        प्रकृति से संस्कृति की ओर • स्वयंसेवक सैन्य
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex gap-4 items-start flex-1 my-2 z-10 text-left">
                    <div className="w-[85px] h-[110px] bg-white rounded-xl border border-[#0f4d24]/45 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-inner bg-stone-50">
                      {membership.photoUrl ? (
                        <img
                          src={membership.photoUrl}
                          alt="avatar"
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 font-hindi text-left">
                      <div>
                        <span className="text-[10px] text-stone-500 block leading-none">नाम (Member Name)</span>
                        <span className="text-xs sm:text-sm font-black text-stone-900 tracking-wide font-hindi leading-snug">{membership.fullName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[8px] text-stone-500 block leading-none">पिता का नाम (Father)</span>
                          <span className="text-[10px] font-extrabold text-stone-800 leading-none">{membership.fathersName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-500 block leading-none">जिला (District)</span>
                          <span className="text-[10px] font-extrabold text-stone-800 leading-none">{membership.district || "N/A"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[8px] text-stone-500 block leading-none">सदस्यता संख्या (ID No)</span>
                          <span className="text-[10px] font-mono font-extrabold text-[#7c2d12] leading-none">{membership.id}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-stone-500 block leading-none">दिनांक (Date)</span>
                          <span className="text-[10px] font-mono text-stone-750 leading-none">
                            {membership.createdAt ? new Date(membership.createdAt).toLocaleDateString("en-IN") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[#0f4d24]/20 pt-1 flex justify-between items-end z-10 text-left">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-bold text-stone-800 leading-none font-hindi">श्रेणी: राष्ट्र-रक्षक पर्यावरण प्रहरी १</span>
                      <span className="text-[6px] text-stone-400 font-sans tracking-wide">PVP REGISTERED VOLUNTEER DIRECTIVE</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <svg width="34" height="10" viewBox="0 0 100 30" className="opacity-80">
                        <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span className="text-[7px] font-black text-stone-900 font-hindi">(नितिन स्वामी - अध्यक्ष)</span>
                    </div>
                  </div>
                </div>

                {/* Print/Save Buttons Area */}
                <div className="flex gap-4 w-full justify-center">
                  <button
                    onClick={downloadMembershipDoc}
                    className={`font-hindi text-xs font-black flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl transition-all shadow cursor-pointer ${
                      membership.status === "सक्रिय (Approved)"
                        ? "bg-[#0f4d24] text-[#efe7d6] hover:bg-[#155e2d] hover:shadow-md"
                        : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md"
                    }`}
                  >
                    <IdCard className="w-4 h-4" />
                    पहचान पत्र व सेवा सम्मान-पत्र डाउनलोड करें (Print ID & Cert)
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Campaigns checklists */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md">
            <h3 className="font-hindi text-base font-black text-[#0f4d24] pb-2 border-b border-stone-100 mb-3 flex items-center gap-1.5">
              <Folder className="w-5 h-5 text-emerald-600" />
              आपके समर्थित एवं पंजीकृत सामाजिक अभियान
            </h3>
            {savedUserCampaigns.length === 0 ? (
              <p className="font-hindi text-xs text-stone-500 py-3 italic">
                आपने अभी तक कोई भी अभियान प्रतिज्ञा में भाग नहीं लिया है। मुख्य पोर्टल पर "अभियान" सेक्शन पर जाकर प्रतिज्ञा लें!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedUserCampaigns.map((camp) => (
                  <div key={camp.id} className="p-3 bg-[#efe7d6]/20 border border-stone-200 rounded-xl flex items-center justify-between gap-2.5">
                    <div>
                      <h4 className="font-hindi text-xs font-extrabold text-stone-900 leading-normal">{camp.titleHindi}</h4>
                      <p className="text-[10px] font-sans text-stone-500">{camp.titleEnglish}</p>
                    </div>
                    <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold font-hindi px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      समर्थित
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donations checklist */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md">
            <h3 className="font-hindi text-base font-black text-[#0f4d24] pb-2 border-b border-stone-100 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-emerald-600" />
                आपका दान सहयोग इतिहास एवं आयकर छूट 80G प्रमाण-पत्र
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-sans font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                Contributions: {personalDonations.length}
              </span>
            </h3>

            {personalDonations.length === 0 ? (
              <p className="font-hindi text-xs text-stone-500 py-4 italic">
                इस ईमेल आईडी के अंतर्गत परिषद को कोई दान प्राप्त होना दर्ज नहीं है। यदि आप सहयोग करना चाहते हैं, तो कृपया होमपेज के सहयोग निधि अनुभाग पर जाएं।
              </p>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {personalDonations.map((receipt, idx) => {
                  const isPaid = receipt.status === "सफल (Paid)";
                  return (
                    <div key={idx} className="p-3.5 bg-[#fdfcf7] hover:bg-[#faf9f3] border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors animate-fade-in">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="font-sans font-bold text-sm text-[#0f4d24]">₹{receipt.amount.toLocaleString()}</span>
                          <span className={`font-hindi text-[10px] font-bold border px-2 py-0.2 rounded ${
                            isPaid 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                              : "bg-amber-50 text-amber-850 border-amber-205"
                          }`}>
                            {receipt.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-sans text-stone-400">Ref: {receipt.receiptId} • PAN: {receipt.pan}</p>
                        <p className="font-hindi text-[10px] text-stone-500">तिथि: {receipt.date}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (isPaid) {
                            downloadSingleReceipt(receipt);
                          } else {
                            alert("सत्यापन लंबित: परिषद के व्यवस्थापक आपके दान की जांच कर रहे हैं। सत्यापन पूर्ण होते ही रसीद डाउनलोड के लिए सक्रिय हो जाएगी। (Verification Pending)");
                          }
                        }}
                        disabled={!isPaid}
                        className={`px-4 py-1.5 rounded-lg text-xs font-hindi font-bold cursor-pointer transition-colors shadow flex items-center justify-center gap-1 w-full sm:w-auto ${
                          isPaid 
                            ? "bg-[#0f4d24] hover:bg-[#0b3c1b] text-[#efe7d6]" 
                            : "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none border"
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isPaid ? "रसीद डाउनलोड (HTML/Print)" : "सत्यापन लंबित (Awaiting Review)"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// UNIVERSAL COMPRESSED IMAGE UPLOADER COMPONENT
// ----------------------------------------------------
function ImageUploader({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (base64: string) => void; 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      alert("अमान्य फ़ाइल प्रकार! केवल JPG, PNG या WEBP अपलोड करें।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          onChange(compressed);
          setPreview(compressed);
        }
      };
      img.src = re.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-stone-700 block">{label}</span>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center transition-all min-h-[110px] ${
          dragActive ? "border-amber-500 bg-amber-500/5" : "border-stone-300 hover:border-[#0f4d24] hover:bg-stone-50"
        }`}
      >
        {preview ? (
          <div className="relative w-full aspect-video max-h-[140px] bg-stone-100 flex items-center justify-center rounded-lg overflow-hidden group border">
            <img src={preview} alt="Upload Preview" className="h-full object-contain" />
            <button
              type="button"
              onClick={() => {
                onChange("");
                setPreview("");
              }}
              className="absolute top-1.5 right-1.5 bg-red-650 hover:bg-red-705 text-[#efe7d6] p-1.5 rounded-lg text-xs cursor-pointer shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              हटाएं (Remove)
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer py-4 px-2 text-center w-full h-full">
            <Upload className="w-6 h-6 text-stone-500 mb-1" />
            <span className="text-xs font-hindi font-bold text-stone-700">चित्र खींचकर लाएं या बदलें (Drag & Drop)</span>
            <span className="text-[10px] text-stone-500 font-sans mt-0.5">JPG, PNG, WEBP (Auto-Compressed)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SECURE ADMIN DASHBOARD PANEL (FULL CONTROL ERP)
// ----------------------------------------------------
type AdminTab = "donations" | "campaigns" | "gallery" | "news" | "guides" | "volunteers" | "cms_sections";

function AdminDashboard({ user, onLogout, onClose }: { user: UserProfile; onLogout: () => void; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("volunteers");
  
  // Datasets
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [guides, setGuides] = useState<GuideMember[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  
  // Donor Management Filters
  const [donationStatusFilter, setDonationStatusFilter] = useState("");

  // CMS State
  const [cmsSubTab, setCmsSubTab] = useState<"hero" | "about" | "pillars" | "president" | "website" | "links" | "donation" | "header_branding">("hero");
  const [siteContentState, setSiteContentState] = useState(dbInstance.getSiteContent());
  const [pillarsState, setPillarsState] = useState(dbInstance.getPillars());
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);

  // Edit states for lists
  const [editingItem, setEditingItem] = useState<{ id: string; type: string; data: any } | null>(null);
  const [editingItemInput, setEditingItemInput] = useState<any>(null);
  
  // Custom confirmation modal state for deletion
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; type: string; displayTitle: string } | null>(null);

  const handleCmsFieldChange = (key: keyof typeof siteContentState, val: any) => {
    setSiteContentState((prev) => ({ ...prev, [key]: val }));
  };

  // Search keyword filters
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<Volunteer | null>(null);

  // Loading datasets triggers
  const loadAllData = () => {
    setDonations(dbInstance.getDonations());
    setCampaigns(dbInstance.getCampaigns());
    setGallery(dbInstance.getGallery());
    setNews(dbInstance.getNews());
    setGuides(dbInstance.getGuides());
    setVolunteers(dbInstance.getVolunteers());
    setSiteContentState(dbInstance.getSiteContent());
    setPillarsState(dbInstance.getPillars());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Creation Fields
  const [showAddModal, setShowAddModal] = useState(false);

  // Dynamic Add State depending on tab
  // Campaigns additions
  const [campTitleHi, setCampTitleHi] = useState("");
  const [campTitleEn, setCampTitleEn] = useState("");
  const [campSubHi, setCampSubHi] = useState("");
  const [campSubEn, setCampSubEn] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campImg, setCampImg] = useState("");

  // Gallery additions
  const [galUrl, setGalUrl] = useState("");
  const [galTitle, setGalTitle] = useState("");
  const [galCategory, setGalCategory] = useState("Ground Activities");
  const [galPreview, setGalPreview] = useState("");
  const [galGeneratedPath, setGalGeneratedPath] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // News additions
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState("जल अभियान");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImg, setNewsImg] = useState("");

  // Guide additions
  const [guideName, setGuideName] = useState("");
  const [guideDesignation, setGuideDesignation] = useState("");
  const [guideDescription, setGuideDescription] = useState("");
  const [guideImg, setGuideImg] = useState("");
  const [guideDisplayOrder, setGuideDisplayOrder] = useState<number>(1);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("अमान्य फ़ाइल प्रकार! कृपया केवल JPG, PNG या WEBP चित्र अपलोड करें। (Invalid file type! Please upload only JPG, PNG or WEBP images.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setGalUrl(compressed);
          setGalPreview(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Generate safe mock path
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "_");
    const generated = `/src/assets/images/gallery_${Date.now()}_${safeName}`;
    setGalGeneratedPath(generated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "campaigns") {
        if (!campTitleHi || !campTitleEn || !campDesc) return;
        dbInstance.addCampaign({
          titleHindi: campTitleHi,
          titleEnglish: campTitleEn,
          subtitleHindi: campSubHi,
          subtitleEnglish: campSubEn,
          description: campDesc,
          imageUrl: campImg || "/src/assets/images/river_march_stones.png"
        });
        setCampTitleHi(""); setCampTitleEn(""); setCampSubHi(""); setCampSubEn(""); setCampDesc(""); setCampImg("");
      } else if (activeTab === "gallery") {
        if (!galUrl || !galTitle) {
          alert("कृपया एक चित्र अपलोड करें और शीर्षक दर्ज करें! (Please upload an image and enter a title!)");
          return;
        }
        dbInstance.addGalleryImage({
          url: galUrl,
          title: galTitle,
          category: galCategory
        });
        setGalUrl("");
        setGalTitle("");
        setGalPreview("");
        setGalGeneratedPath("");
      } else if (activeTab === "news") {
        if (!newsTitle || !newsContent || !newsSummary) return;
        dbInstance.addNews({
          title: newsTitle,
          date: new Date().toISOString().split('T')[0],
          category: newsCategory,
          summary: newsSummary,
          content: newsContent,
          imageUrl: newsImg || "/src/assets/images/yatra_crowd_night.png"
        });
        setNewsTitle(""); setNewsSummary(""); setNewsContent(""); setNewsImg("");
      } else if (activeTab === "guides") {
        if (!guideName || !guideDesignation || !guideDescription) {
          alert("कृपया सभी आवश्यक फ़ील्ड भरें! (Please fill all required fields!)");
          return;
        }
        dbInstance.addGuide({
          name: guideName,
          designation: guideDesignation,
          description: guideDescription,
          imageUrl: guideImg || "/src/assets/images/nitin_swami_1780203516611.png",
          displayOrder: Number(guideDisplayOrder) || 1
        });
        setGuideName(""); setGuideDesignation(""); setGuideDescription(""); setGuideImg(""); setGuideDisplayOrder(1);
      }
      
      setShowAddModal(false);
      loadAllData();
      alert("मद सफलतापूर्वक जोड़ा गया! (Item Successfully Added)");
    } catch (err) {
      console.error(err);
    }
  };

  const exportDonationsToCSV = () => {
    const headers = ["Receipt ID", "Donor Name", "Donor Email", "Donor Phone", "PAN", "Amount", "Date", "Status"];
    const rows = finalFilteredDonationList.map(d => [
      d.receiptId,
      d.donorName,
      d.donorEmail,
      d.donorPhone || "N/A",
      d.pan,
      d.amount,
      d.date,
      d.status
    ]);
    
    // Create CSV content ensuring escaping
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      const line = r.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(",");
      csvRows.push(line);
    }
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PVP_Donations_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteItem = (id: string) => {
    let itemTitle = "";
    let typeName = "";
    
    if (activeTab === "volunteers") {
      const found = volunteers.find(v => v.id === id);
      itemTitle = found ? found.fullName : id;
      typeName = "सैनिक/स्वयंसेवक (Volunteer)";
    } else if (activeTab === "donations") {
      const found = donations.find(d => d.receiptId === id);
      itemTitle = found ? `${found.donorName} (रसीद संख्या: ${found.receiptId}, राशि: ₹${found.amount.toLocaleString()})` : id;
      typeName = "सहयोग निधि रसीद (Donation Receipt)";
    } else if (activeTab === "campaigns") {
      const found = campaigns.find(c => c.id === id);
      itemTitle = found ? `${found.titleHindi} (${found.titleEnglish})` : id;
      typeName = "जन-अभियान (Campaign)";
    } else if (activeTab === "gallery") {
      const found = gallery.find(g => g.id === id);
      itemTitle = found ? found.title : id;
      typeName = "गैलरी चित्र (Gallery Photo)";
    } else if (activeTab === "news") {
      const found = news.find(n => n.id === id);
      itemTitle = found ? found.title : id;
      typeName = "समाचार/प्रेस नोट (News Article)";
    } else if (activeTab === "guides") {
      const found = guides.find(g => g.id === id);
      itemTitle = found ? found.name : id;
      typeName = "मार्गदर्शक सदस्य (Guide Mentor)";
    }

    setDeleteConfirmItem({
      id,
      type: typeName,
      displayTitle: itemTitle
    });
  };

  const executeDeleteItem = () => {
    if (!deleteConfirmItem) return;
    const { id } = deleteConfirmItem;

    if (activeTab === "volunteers") {
      dbInstance.deleteVolunteer(id);
    } else if (activeTab === "donations") {
      dbInstance.deleteDonation(id);
    } else if (activeTab === "campaigns") {
      dbInstance.deleteCampaign(id);
    } else if (activeTab === "gallery") {
      dbInstance.deleteGalleryImage(id);
    } else if (activeTab === "news") {
      dbInstance.deleteNews(id);
    } else if (activeTab === "guides") {
      dbInstance.deleteGuide(id);
    }

    loadAllData();
    setDeleteConfirmItem(null);
  };

  const handleUpdateVolunteerStatus = (vol: Volunteer, status: "सक्रिय (Approved)" | "लंबित (Pending)" | "अस्वीकृत (Rejected)") => {
    const updated = { ...vol, status };
    dbInstance.updateVolunteer(updated);
    window.dispatchEvent(new Event("storage"));
    alert(`सदस्यता आवेदन '${vol.fullName}' की स्थिति को सफलतापूर्वक '${status}' अपडेट कर दिया गया है!`);
    loadAllData();
  };

  const handleStartEditing = (type: string, data: any) => {
    setEditingItem({ id: data.id, type, data });
    setEditingItemInput({ ...data });
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItemInput) return;

    if (editingItem.type === "campaign") {
      dbInstance.updateCampaign(editingItemInput);
      alert("जन-अभियान सफलतापूर्वक संशोधित किया गया!");
    } else if (editingItem.type === "news") {
      dbInstance.updateNews(editingItemInput);
      alert("समाचार / मीडिया रिपोर्ट सफलतापूर्वक संशोधित किया गया!");
    } else if (editingItem.type === "gallery") {
      dbInstance.updateGalleryImage(editingItemInput);
      alert("गैलरी चित्र व शीर्षक विवरण सफलतापूर्वक संशोधित किया गया!");
    } else if (editingItem.type === "guides") {
      dbInstance.updateGuide(editingItemInput);
      alert("संरक्षक व मार्गदर्शक विवरण सफलतापूर्वक संशोधित किया गया!");
    }

    setEditingItem(null);
    setEditingItemInput(null);
    loadAllData();
  };

  // Filters logic
  const filteredVolunteers = volunteers.filter(v => {
    const sQuery = searchQuery.trim().toLowerCase();
    const dFilter = districtFilter.trim().toLowerCase();

    // Search by Name or Mobile
    const matchesSearch = sQuery
      ? (v.fullName || "").toLowerCase().includes(sQuery) ||
        (v.phone || "").toLowerCase().includes(sQuery)
      : true;

    // Filter by District
    const matchesDistrict = dFilter
      ? (v.district || "").toLowerCase().includes(dFilter)
      : true;

    return matchesSearch && matchesDistrict;
  });

  const filteredDonations = donations.filter(d => 
    (d.donorName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.donorEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.pan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.receiptId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.donorPhone || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const finalFilteredDonationList = donationStatusFilter
    ? filteredDonations.filter(d => d.status === donationStatusFilter)
    : filteredDonations;

  const filteredCampaigns = campaigns.filter(c => 
    c.titleHindi?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.titleEnglish?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNews = news.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuides = guides.filter(g => 
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Admin Panel Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900 text-[#efe7d6] p-6 rounded-3xl border-4 border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-hindi font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            PVP भारत • केंद्रीय नियंत्रण कक्ष (ERP Enterprise Admin)
          </div>
          <h2 className="font-hindi text-2.5xl font-black mt-2">प्रशासक डैशबोर्ड (Secure Admin Console)</h2>
          <p className="font-sans text-xs text-stone-300 mt-1">स्वागत है, Vansh Tomar {user.email}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              dbInstance.initializeDefaultData(true);
              loadAllData();
              alert("डिफ़ॉल्ट डेटा पुनर्स्थापित किया गया!");
            }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-amber-400 rounded-xl text-xs font-hindi font-bold cursor-pointer border border-stone-700 hover:border-amber-500/30 transition-all"
            title="डिफ़ॉल्ट डेटा रीसेट करें"
          >
            डेटा रीसेट (Reset Default Data)
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-hindi font-bold cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            प्रस्थान (Sign Out)
          </button>
        </div>
      </div>

      {/* Main Panel Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar Drawer */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 bg-white p-4 rounded-2.5xl border border-stone-200 shadow-md">
          
          <button
            onClick={() => { setActiveTab("volunteers"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "volunteers" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <User className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
            स्वयंसेवक व्यवस्था ({volunteers.length})
          </button>

          <button
            onClick={() => { setActiveTab("donations"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "donations" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Heart className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
            दान कोषागार ({donations.length})
          </button>

          <button
            onClick={() => { setActiveTab("campaigns"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "campaigns" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Folder className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
            अभियान नियंत्रण ({campaigns.length})
          </button>

          <button
            onClick={() => { setActiveTab("news"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "news" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <BookOpen className="w-4.5 h-4.5 text-purple-600 flex-shrink-0" />
            समाचार व मीडिया ({news.length})
          </button>

          <button
            onClick={() => { setActiveTab("gallery"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "gallery" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Image className="w-4.5 h-4.5 text-emerald-600 display-inline-block flex-shrink-0" />
            गैलरी चित्रशाला ({gallery.length})
          </button>

          <button
            onClick={() => { setActiveTab("guides"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "guides" ? "bg-amber-500/15 text-amber-950 shadow-inner" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Briefcase className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
            मार्गदर्शक मंडल ({guides.length})
          </button>

          <button
            onClick={() => { setActiveTab("cms_sections"); setSearchQuery(""); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-hindi text-sm font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
              activeTab === "cms_sections" ? "bg-amber-500/15 text-amber-950 shadow-inner border border-amber-500/30" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Settings className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
            वेबसाइट सामग्री (CMS Settings)
          </button>

        </div>

        {/* Console working spreadsheet workspace */}
        <div className="lg:col-span-9 bg-white p-5 rounded-3xl border border-stone-200 shadow-md flex flex-col min-h-[500px]">
          
          {/* Working Title Search bar & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-stone-100 pb-4 mb-4">
            <div>
              <h3 className="font-hindi text-lg font-black text-stone-900 uppercase">
                {activeTab === "volunteers" && "पर्यावरण सैनिक पंजी (Registered Volunteers)"}
                {activeTab === "donations" && "सहयोग निधि रसीद बही (Total Donation Ledgers)"}
                {activeTab === "campaigns" && "सक्रिय जन-अभियान (Website Campaigns)"}
                {activeTab === "news" && "प्रेस नोट व मीडिया (News Articles)"}
                {activeTab === "gallery" && "साइट गैलरी एल्बम (Site Photo Gallery)"}
                {activeTab === "guides" && "मार्गदर्शक मंडल प्रबंधन (Guide & Mentor Management)"}
                {activeTab === "cms_sections" && "वेबसाइट दृश्य सामग्री प्रबंधन (Visual CMS Control)"}
              </h3>
              <p className="font-hindi text-xs text-stone-500 mt-1">
                {activeTab === "cms_sections" ? "वेबसाइट के किसी भी भाग के पाठ, चित्रों अथवा सोशल मीडिया लिंक को बिना कोडिंग के बदलें।" : "विद्यमान डाटाबेस में संवर्धन, विलोपन या संशोधन करें।"}
              </p>
            </div>

            {activeTab !== "cms_sections" && (
              <div className="flex gap-2 items-center">
                {/* Search label */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder={activeTab === "volunteers" ? "नाम या मोबाइल से खोजें..." : "खोजें... (Search...)"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-350 focus:border-[#0f4d24] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24]"
                  />
                </div>

                {activeTab === "volunteers" && (
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-350 focus:border-[#0f4d24] rounded-xl text-xs outline-none font-hindi focus:ring-1 focus:ring-[#0f4d24] max-w-[170px]"
                  >
                    <option value="">सभी जिला (All Districts)</option>
                    <option value="मेरठ">मेरठ (Meerut)</option>
                    <option value="बागपत">बागपत (Baghpat)</option>
                    <option value="शामली">शामली (Shamli)</option>
                    <option value="सहारनपुर">सहारनपुर (Saharanpur)</option>
                    <option value="मुजफ्फरनगर">मुजफ्फरनगर (Muzaffarnagar)</option>
                    <option value="गाजियाबाद">गाजियाबाद (Ghaziabad)</option>
                    <option value="हापुड़">हापुड़ (Hapur)</option>
                    <option value="Noida">नोएडा (GB Nagar)</option>
                    <option value="बुलंदशहर">बुलंदशहर (Bulandshahr)</option>
                    <option value="बिजनौर">बिजनौर (Bijnor)</option>
                  </select>
                )}

                {/* Add buttons ONLY for non-volunteer, non-donation dynamic arrays */}
                {activeTab !== "volunteers" && activeTab !== "donations" && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] rounded-xl text-xs font-hindi font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    जोड़ें (Add New)
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-x-auto">
            
            {/* VOLUNTEERS SHEET PANEL */}
            {activeTab === "volunteers" && (
              <table className="w-full text-left text-[11px] font-hindi border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5">सदस्य चित्र व संख्या</th>
                    <th className="p-2.5">सदस्य विवरण</th>
                    <th className="p-2.5">संपर्क सूत्र</th>
                    <th className="p-2.5">स्थान (District)</th>
                    <th className="p-2.5">सहयोग प्रकार</th>
                    <th className="p-2.5">स्थिति (Status)</th>
                    <th className="p-2.5 text-right w-36">आवेदन प्रबंधन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center text-stone-450 italic">कोई पंजीकृत आंदोलनकारी सदस्य नहीं मिला!</td></tr>
                  ) : (
                    filteredVolunteers.map((vol) => (
                      <tr key={vol.id} className="hover:bg-stone-50/70 transition-colors">
                        
                        {/* Photo & Member ID */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-12 bg-stone-100 border rounded overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                              {vol.photoUrl ? (
                                <img
                                  src={vol.photoUrl}
                                  alt={vol.fullName}
                                  className="w-full h-full object-cover rounded"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-xl">👤</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-extrabold text-[#0f4d24] text-[10px] bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">{vol.id}</span>
                              <span className="text-[9px] font-sans text-stone-400 mt-1">{vol.createdAt ? new Date(vol.createdAt).toLocaleDateString("hi-IN") : ""}</span>
                            </div>
                          </div>
                        </td>

                        {/* Name & Occupation */}
                        <td className="p-2.5">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-stone-900 text-xs">{vol.fullName}</span>
                            <span className="text-stone-500 text-[10px] mt-0.5">पिता: {vol.fathersName || "N/A"}</span>
                            <span className="text-stone-400 text-[9px] mt-0.5">व्यवसाय: {vol.occupation || "N/A"} | DOB: {vol.dob || "N/A"}</span>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="p-2.5">
                          <div className="flex flex-col text-left">
                            <span className="font-sans font-bold text-stone-800">{vol.phone}</span>
                            <span className="font-sans text-[10px] text-stone-500 max-w-[120px] truncate" title={vol.email}>{vol.email || "N/A"}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-2.5">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#235832]">{vol.district || "N/A"}</span>
                            <span className="text-stone-500 text-[10px]">ब्लॉक: {vol.block || "N/A"}</span>
                            <span className="text-stone-400 text-[9px]">गाँव/शहर: {vol.city || "N/A"}</span>
                          </div>
                        </td>

                        {/* Contributions */}
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {vol.helpModes && vol.helpModes.length > 0 ? (
                              vol.helpModes.map((mode, idx) => (
                                <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-205 px-1 py-0.2 rounded text-[9px] font-extrabold">{mode}</span>
                              ))
                            ) : (
                              <span className="text-stone-450 italic text-[9px]">स्वयंसेवा</span>
                            )}
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="p-2.5">
                          {vol.status === "सक्रिय (Approved)" ? (
                            <span className="bg-emerald-100 text-emerald-850 border border-emerald-300 font-extrabold px-1.5 py-0.5 rounded text-[10px]">सक्रिय (Approved)</span>
                          ) : vol.status === "अस्वीकृत (Rejected)" ? (
                            <span className="bg-red-50 text-red-700 border border-red-200 font-extrabold px-1.5 py-0.5 rounded text-[10px]">अस्वीकृत (Rejected)</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded text-[10px] animate-pulse">लंबित (Pending)</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5 items-center">
                            {/* Open Details */}
                            <button
                              onClick={() => setSelectedMember(vol)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 p-1.5 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                              title="विवरण खोलें (Open application)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve */}
                            {vol.status !== "सक्रिय (Approved)" && (
                              <button
                                onClick={() => handleUpdateVolunteerStatus(vol, "सक्रिय (Approved)")}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 p-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                                title="स्वीकार करें (Approve)"
                              >
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </button>
                            )}

                            {/* Reject */}
                            {vol.status !== "अस्वीकृत (Rejected)" && (
                              <button
                                onClick={() => handleUpdateVolunteerStatus(vol, "अस्वीकृत (Rejected)")}
                                className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 p-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                title="अस्वीकृत करें (Reject)"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteItem(vol.id)}
                              className="bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 p-1.5 rounded-lg border border-stone-300 hover:border-red-200 transition-colors cursor-pointer"
                              title="हटाएं (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* DONATIONS SHEET PANEL */}
            {activeTab === "donations" && (
              <div className="space-y-4">
                {/* Search & Status Filters, Export Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#fcfaf2]/90 p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-stone-600 font-hindi">स्थिति फ़िल्टर करें (Status Filter):</span>
                    <button
                      onClick={() => setDonationStatusFilter("")}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                        donationStatusFilter === "" ? "bg-[#0f4d24] text-white" : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                      }`}
                    >
                      सभी (All)
                    </button>
                    <button
                      onClick={() => setDonationStatusFilter("सफल (Paid)")}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                        donationStatusFilter === "सफल (Paid)" ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                      }`}
                    >
                      सफल (Paid)
                    </button>
                    <button
                      onClick={() => setDonationStatusFilter("लंबित (Pending Verification)")}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                        donationStatusFilter === "लंबित (Pending Verification)" ? "bg-amber-600 text-white" : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                      }`}
                    >
                      सत्यापन लंबित (Pending)
                    </button>
                  </div>
                  <button
                    onClick={exportDonationsToCSV}
                    className="bg-[#0f4d24] hover:bg-[#0b3c1b] text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer font-hindi"
                  >
                    <Download className="w-3.5 h-3.5" />
                    डाटा निर्यात करें (Export CSV)
                  </button>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-inner">
                  <table className="w-full text-left text-xs font-hindi border-collapse">
                    <thead>
                      <tr className="bg-stone-105 text-stone-700 border-b border-stone-200 font-extrabold text-xs sm:text-sm">
                        <th className="p-3">रसीद संख्या / तिथि</th>
                        <th className="p-3">दाता का नाम व फोन</th>
                        <th className="p-3">ईमेल / पैन</th>
                        <th className="p-3 text-right">राशि (INR)</th>
                        <th className="p-3 text-center">भुगतान स्थिति</th>
                        <th className="p-3 text-center font-sans">त्वरित कार्रवाई</th>
                        <th className="p-3 text-right">हटाएं</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {finalFilteredDonationList.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-stone-500 italic">रसीद बही में कोई रिकॉर्ड नहीं मिला!</td></tr>
                      ) : (
                        finalFilteredDonationList.map((don) => (
                          <tr key={don.receiptId} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-3">
                              <p className="font-sans font-bold text-[#0f4d24] text-xs sm:text-xs">{don.receiptId}</p>
                              <p className="text-[10px] text-stone-400 font-sans mt-0.5">{don.date}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-stone-900 text-xs sm:text-xs">{don.donorName}</p>
                              <p className="font-sans text-[11px] text-stone-500 mt-0.5">{don.donorPhone || "N/A"}</p>
                            </td>
                            <td className="p-3 font-sans">
                              <p className="text-stone-600 text-xs">{don.donorEmail}</p>
                              <p className="text-[10px] font-bold text-amber-900 border border-amber-950/10 inline-block px-1.5 py-0.2 rounded-md bg-amber-500/5 mt-1">{don.pan}</p>
                            </td>
                            <td className="p-3 font-sans font-black text-right text-[#0f4d24] text-xs sm:text-sm">₹{don.amount.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                                don.status === "सफल (Paid)" 
                                  ? "bg-emerald-100 text-emerald-850 border border-emerald-300"
                                  : don.status === "लंबित (Pending Verification)"
                                    ? "bg-amber-100 text-amber-850 border border-amber-300"
                                    : "bg-red-100 text-red-800 border border-red-300"
                              }`}>
                                {don.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {don.status === "लंबित (Pending Verification)" ? (
                                <div className="flex gap-1.5 justify-center">
                                  <button
                                    onClick={async () => {
                                      const ok = await dbInstance.updateDonationStatus(don.receiptId, "सफल (Paid)");
                                      if (ok) {
                                        loadAllData();
                                        alert("भुगतान सफलतापूर्वक स्वीकृत और रसीद जारी कर दी गई है! (Payment Verified and Receipt Issued!)");
                                      }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const ok = await dbInstance.updateDonationStatus(don.receiptId, "अस्वीकृत (Rejected)");
                                      if (ok) {
                                        loadAllData();
                                        alert("भुगतान अस्वीकृत कर दिया गया है! (Payment Rejected!)");
                                      }
                                    }}
                                    className="bg-rose-650 hover:bg-rose-700 text-white text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">No Action Needed</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteItem(don.receiptId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer animate-fade-in"
                                title="हटाएं"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CAMPAIGNS SHEET PANEL */}
            {activeTab === "campaigns" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCampaigns.map((camp) => (
                  <div key={camp.id} className="p-4 border border-stone-200 rounded-2xl bg-[#fdfcf7] flex items-start gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                    <img src={camp.imageUrl} alt={camp.titleHindi} className="w-16 h-16 object-cover rounded-lg border shrink-0" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-hindi text-sm font-black text-stone-900 pr-14">{camp.titleHindi}</h4>
                      <p className="text-[10px] font-sans text-stone-500 pr-14">{camp.titleEnglish}</p>
                      <p className="font-hindi text-[11px] text-stone-600 line-clamp-2 leading-relaxed">{camp.description}</p>
                      <span className="inline-block text-[10px] bg-sky-50 text-sky-800 border px-1.5 py-0.2 rounded font-sans font-extrabold">Pledges: {camp.pledgedCount}</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditing("campaign", camp)}
                        className="text-amber-650 hover:text-amber-800 hover:bg-stone-100 p-1 rounded cursor-pointer"
                        title="संपादित करें (Edit)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(camp.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-stone-100 p-1 rounded cursor-pointer"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NEWS SHEET PANEL */}
            {activeTab === "news" && (
              <div className="space-y-4">
                {filteredNews.map((newsItem) => (
                  <div key={newsItem.id} className="p-4 border border-stone-200 rounded-2xl bg-[#fdfcf7] flex gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                    <img src={newsItem.imageUrl} alt={newsItem.title} className="w-20 h-20 object-cover rounded-lg border shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-hindi bg-purple-50 text-purple-800 border px-2 py-0.2 rounded text-[10px] font-bold">{newsItem.category}</span>
                        <span className="font-sans text-[10px] text-stone-400">{newsItem.date}</span>
                      </div>
                      <h4 className="font-hindi text-sm font-black text-stone-900 leading-snug pr-14">{newsItem.title}</h4>
                      <p className="font-hindi text-xs text-stone-600 line-clamp-2">{newsItem.content}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditing("news", newsItem)}
                        className="text-amber-655 hover:text-amber-800 hover:bg-stone-50 p-1.5 rounded cursor-pointer"
                        title="संपादित करें (Edit)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(newsItem.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-stone-50 p-1.5 rounded cursor-pointer h-ma self-start"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GALLERY SHEET PANEL */}
            {activeTab === "gallery" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="relative group rounded-2xl border overflow-hidden bg-stone-50 shadow-sm hover:shadow-md transition-shadow">
                    <img src={img.url} alt={img.title} className="w-full h-24 object-cover" />
                    <div className="p-2 space-y-1 bg-white">
                      <h5 className="font-hindi text-[10px] font-bold text-stone-900 line-clamp-1 leading-none">{img.title}</h5>
                      <span className="text-[8px] font-sans text-stone-400">{img.category}</span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditing("gallery", img)}
                        className="bg-amber-500 text-stone-950 hover:bg-amber-600 p-1.5 rounded shadow cursor-pointer transition-colors"
                        title="संपादित करें (Edit)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(img.id)}
                        className="bg-red-600 text-white hover:bg-red-700 p-1.5 rounded shadow cursor-pointer transition-colors"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GUIDES SHEET PANEL */}
            {activeTab === "guides" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map((g) => (
                  <div key={g.id} className="p-4 border border-stone-200 rounded-2xl bg-[#fdfcf7] flex gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                    <img src={g.imageUrl || "/src/assets/images/nitin_swami_1780203516611.png"} alt={g.name} className="w-16 h-16 object-cover rounded-xl border shrink-0 bg-stone-50" referrerPolicy="no-referrer" />
                    <div className="flex-1 space-y-1 pr-14">
                      <h4 className="font-hindi text-sm font-black text-stone-900">{g.name}</h4>
                      <p className="font-hindi text-xs font-bold text-[#155a2c]">{g.designation}</p>
                      <p className="font-hindi text-[11px] text-stone-600 line-clamp-2 leading-relaxed">{g.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-sans font-extrabold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">क्रम संख्या (Order): {g.displayOrder}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditing("guides", g)}
                        className="text-amber-655 hover:text-amber-800 hover:bg-stone-50 p-1.5 rounded cursor-pointer"
                        title="संपादित करें (Edit)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(g.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded cursor-pointer"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CMS SECTIONS PANEL */}
            {activeTab === "cms_sections" && (
              <div className="space-y-6 font-hindi" id="cms-dashboard">
                {/* CMS Sub-navigation tabs */}
                <div className="flex flex-wrap border-b border-stone-200 pb-2 gap-2 text-xs sm:text-sm font-bold">
                  {[
                    { id: "hero", label: "नारे व मुख्य भाग (Hero)" },
                    { id: "about", label: "परिचय (About Us)" },
                    { id: "pillars", label: "सप्त स्तंभ (07 Pillars)" },
                    { id: "president", label: "संगठन पहचान व लोगो (Org Identity & Logo)" },
                    { id: "header_branding", label: "हेडर ब्रैंडिंग व लोगो (Header Branding)" },
                    { id: "website", label: "वेबसाइट सेटिंग्स (Identity)" },
                    { id: "donation", label: "सहयोग सेटिंग्स (Donation)" },
                    { id: "links", label: "संपर्क व कड़ियां (Contacts)" },
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => setCmsSubTab(subTab.id as any)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        cmsSubTab === subTab.id
                          ? "bg-[#0f4d24] text-[#efe7d6] border-[#0f4d24]"
                          : "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300"
                      }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tab 1: HERO CONFIG */}
                {cmsSubTab === "hero" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("मुख्य नारे व संदेश सेटिंग्स सहेज दी गईं!");
                      loadAllData();
                    }}
                    className="space-y-4 text-xs sm:text-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">मुख्य शीर्षक (Hero Title)</label>
                        <input
                          type="text"
                          value={siteContentState.heroTitle}
                          onChange={(e) => handleCmsFieldChange("heroTitle", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">उप-शीर्षक (Hero Subtitle)</label>
                        <input
                          type="text"
                          value={siteContentState.heroSubtitle}
                          onChange={(e) => handleCmsFieldChange("heroSubtitle", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">मुख्य नारा (Slogan/Sutra)</label>
                        <input
                          type="text"
                          value={siteContentState.heroSlogan}
                          onChange={(e) => handleCmsFieldChange("heroSlogan", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">बटन का पाठ (Button Text)</label>
                        <input
                          type="text"
                          value={siteContentState.heroBtnText}
                          onChange={(e) => handleCmsFieldChange("heroBtnText", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col flex-grow">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 font-sans">
                          पृष्ठभूमि वीडियो URL (Hero Video URL - Leave blank for image)
                        </label>
                        <input
                          type="text"
                          value={siteContentState.heroVideoUrl}
                          onChange={(e) => handleCmsFieldChange("heroVideoUrl", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">अध्यक्ष पद संक्षिप्त नाम</label>
                        <input
                          type="text"
                          value={siteContentState.heroPresidentName}
                          onChange={(e) => handleCmsFieldChange("heroPresidentName", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    {/* Image uploads for Hero using base64 processed FileReader */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ImageUploader
                        label="अध्यक्षीय संक्षिप्त चित्र (President Small Image)"
                        value={siteContentState.heroPresidentImg}
                        onChange={(base64) => handleCmsFieldChange("heroPresidentImg", base64)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-bold hover:bg-ngo-forest transition-colors flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      नारे व मुख्य सेटिंग सहेजें (Save Hero Settings)
                    </button>
                  </form>
                )}

                {/* Sub-tab 2: ABOUT CONFIG */}
                {cmsSubTab === "about" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("परिचय व चित्रकला सेटिंग्स सहेज दी गईं!");
                      loadAllData();
                    }}
                    className="space-y-4 text-xs sm:text-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">परिचय मुख्य बैज (Badge)</label>
                        <input
                          type="text"
                          value={siteContentState.aboutBadge}
                          onChange={(e) => handleCmsFieldChange("aboutBadge", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">परिचय मुख्य शीर्षक (Title)</label>
                        <input
                          type="text"
                          value={siteContentState.aboutTitle}
                          onChange={(e) => handleCmsFieldChange("aboutTitle", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    {/* About paragraph inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 block">परिचय पैराग्राफ १ (Paragraph 1)</label>
                        <textarea
                          rows={2}
                          value={siteContentState.aboutText1}
                          onChange={(e) => handleCmsFieldChange("aboutText1", e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 block">परिचय पैराग्राफ २ (Paragraph 2)</label>
                        <textarea
                          rows={2}
                          value={siteContentState.aboutText2}
                          onChange={(e) => handleCmsFieldChange("aboutText2", e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 block">परिचय पैराग्राफ ३ (Paragraph 3)</label>
                        <textarea
                          rows={2}
                          value={siteContentState.aboutText3}
                          onChange={(e) => handleCmsFieldChange("aboutText3", e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Quote section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">अंतिम कोट कथन (Quote message)</label>
                        <textarea
                          rows={2}
                          value={siteContentState.aboutQuote}
                          onChange={(e) => handleCmsFieldChange("aboutQuote", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none text-xs"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">कोट प्रेषक (Quote Author)</label>
                        <input
                          type="text"
                          value={siteContentState.aboutQuoteAuthor}
                          onChange={(e) => handleCmsFieldChange("aboutQuoteAuthor", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none mt-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 block">चेतावनी संदेश कैप्शन (Warning Text)</label>
                        <input
                          type="text"
                          value={siteContentState.aboutWarningText}
                          onChange={(e) => handleCmsFieldChange("aboutWarningText", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-hindi text-stone-700 font-extrabold mb-1 block">चेतावनी विवरण (Warning Details)</label>
                        <textarea
                          rows={2}
                          value={siteContentState.aboutText4}
                          onChange={(e) => handleCmsFieldChange("aboutText4", e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* About Us replacement images */}
                    <div className="bg-stone-100 p-4 rounded-2xl border space-y-4">
                      <h4 className="font-bold text-stone-900 font-hindi border-b pb-2 mb-2">परिचय चित्रशाला (About Images)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ImageUploader
                          label="परिचय चित्र १ (Image 1)"
                          value={siteContentState.aboutImg1}
                          onChange={(base64) => handleCmsFieldChange("aboutImg1", base64)}
                        />
                        <ImageUploader
                          label="परिचय चित्र २ (Image 2)"
                          value={siteContentState.aboutImg2}
                          onChange={(base64) => handleCmsFieldChange("aboutImg2", base64)}
                        />
                        <ImageUploader
                          label="परिचय चित्र ३ (Image 3)"
                          value={siteContentState.aboutImg3}
                          onChange={(base64) => handleCmsFieldChange("aboutImg3", base64)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-bold hover:bg-ngo-forest transition-colors flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      परिचय व चित्रकला सेटिंग्स सहेजें (Save About Settings)
                    </button>
                  </form>
                )}

                {/* Sub-tab 3: SEVEN PILLARS CONFIG */}
                {cmsSubTab === "pillars" && (
                  <div className="space-y-4">
                    <div className="border bg-amber-500/5 p-4 rounded-2xl">
                      <p className="text-stone-700 text-xs sm:text-sm font-semibold leading-relaxed">
                        पश्चिमांचल विकास परिषद के सात संकल्प स्तंभों को नियंत्रित व परिवर्तित करें। अपनी इच्छानुसार शीर्षक, अंग्रेजी अनुवाद, या Lucide आइकॉन बदलें।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pillarsState.map((pillar) => (
                        <div key={pillar.id} className="p-4 border rounded-2xl bg-stone-50 space-y-3 shadow-inner relative">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-xs font-sans font-bold text-emerald-700 uppercase">Pillar {pillar.number} (संकल्प स्तम्भ)</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingPillarId === pillar.id) {
                                  setEditingPillarId(null);
                                } else {
                                  setEditingPillarId(pillar.id);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-hindi font-bold cursor-pointer rounded-lg"
                            >
                              {editingPillarId === pillar.id ? "बंद करें (Close)" : "संपादित करें (Edit)"}
                            </button>
                          </div>

                          <div className="flex gap-3 items-center">
                            <span className="px-3 py-2 bg-amber-100 text-amber-950 font-black text-xl rounded-xl">{pillar.number}</span>
                            <div>
                              <h4 className="font-hindi text-base font-extrabold text-stone-900 leading-none">{pillar.title}</h4>
                              <p className="text-xs text-stone-500 italic font-sans mt-1">{pillar.titleEn}</p>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 font-hindi font-semibold line-clamp-2 italic pr-4 pl-1">{pillar.description}</p>

                          {editingPillarId === pillar.id && (
                            <div className="bg-white p-3 rounded-xl border space-y-3 font-hindi text-xs sm:text-sm pt-4 border-dashed border-stone-300">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                  <label className="font-bold text-stone-700 text-[11px] mb-1">शीर्षक (Hindi) *</label>
                                  <input
                                    type="text"
                                    value={pillar.title}
                                    onChange={(e) => {
                                      const updated = pillarsState.map(p => p.id === pillar.id ? { ...p, title: e.target.value } : p);
                                      setPillarsState(updated);
                                    }}
                                    className="px-2 py-1.5 border rounded-lg outline-none text-xs"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="font-bold text-stone-700 text-[11px] mb-1">English Translation</label>
                                  <input
                                    type="text"
                                    value={pillar.titleEn}
                                    onChange={(e) => {
                                      const updated = pillarsState.map(p => p.id === pillar.id ? { ...p, titleEn: e.target.value } : p);
                                      setPillarsState(updated);
                                    }}
                                    className="px-2 py-1.5 border rounded-lg outline-none text-xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                  <label className="font-bold text-stone-700 text-[11px] mb-1">आइकॉन नाम (Lucide Object) *</label>
                                  <select
                                    value={pillar.iconName}
                                    onChange={(e) => {
                                      const updated = pillarsState.map(p => p.id === pillar.id ? { ...p, iconName: e.target.value } : p);
                                      setPillarsState(updated);
                                    }}
                                    className="px-2 py-1.5 bg-stone-50 border rounded-lg text-xs"
                                  >
                                    <option value="Droplet">Droplet (जल)</option>
                                    <option value="Trees">Trees (प्रकृति/जंगल)</option>
                                    <option value="Heart">Heart (स्नेह व सेवा)</option>
                                    <option value="BookOpen">BookOpen (शिक्षा)</option>
                                    <option value="Shield">Shield (सुरक्षा)</option>
                                    <option value="Activity">Activity (आरोग्य)</option>
                                    <option value="Flame">Flame (ऊर्जा)</option>
                                    <option value="Award">Award (प्रसिद्धि)</option>
                                    <option value="HelpCircle">Help Circle</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex flex-col">
                                <label className="font-bold text-stone-700 text-[11px] mb-1">संकल्प स्तंभ का संदेश विवरण (Description) *</label>
                                <textarea
                                  rows={3}
                                  value={pillar.description}
                                  onChange={(e) => {
                                    const updated = pillarsState.map(p => p.id === pillar.id ? { ...p, description: e.target.value } : p);
                                    setPillarsState(updated);
                                  }}
                                  className="px-2 py-1.5 border rounded-lg outline-none resize-none text-xs"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  dbInstance.updatePillar(pillar);
                                  alert(`स्तंभ ${pillar.number} की सेटिंग्स सफलतापूर्वक अपडेट की गईं!`);
                                  setEditingPillarId(null);
                                  loadAllData();
                                }}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-[#efe7d6] text-xs font-bold font-hindi cursor-pointer rounded-lg flex items-center justify-center gap-1 shadow"
                              >
                                💾 सहेजें (Update Pillar)
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: ORGANIZATION IDENTITY & LOGO MANAGEMENT CONFIG */}
                {cmsSubTab === "president" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("संगठन पहचान व लोगो सेटिंग्स सफलतापूर्वक सहेज दी गईं! (Organization Identity & Logo settings saved!)");
                      loadAllData();
                    }}
                    className="space-y-6 text-xs sm:text-sm font-hindi bg-stone-50/50 p-4 sm:p-5 rounded-2xl border border-stone-200/60"
                  >
                    <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-stone-900">संगठन पहचान प्रबंध और आधिकारिक लोगो (Logo & Identity Hub)</h3>
                        <p className="text-stone-500 text-xs mt-1">यहाँ से वेबसाइट के होमपेज पर प्रदर्शित होने वाले आधिकारिक पहचान पत्र और लोगो को प्रबंधित करें।</p>
                      </div>
                      <span className="text-xl select-none">🎖️</span>
                    </div>

                    {/* Section 1: Section Headings */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">1. अनुभाग विवरण (Section Details)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">अनुभाग का मुख्य शीर्षक (Section Title)</label>
                          <input
                            type="text"
                            value={siteContentState.orgSectionTitle || ""}
                            onChange={(e) => handleCmsFieldChange("orgSectionTitle", e.target.value)}
                            placeholder="संगठन की आधिकारिक पहचान"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">अनुभाग का संक्षिप्त वर्णन (Section Description)</label>
                          <input
                            type="text"
                            value={siteContentState.orgSectionDesc || ""}
                            onChange={(e) => handleCmsFieldChange("orgSectionDesc", e.target.value)}
                            placeholder="पश्चिमांचल विकास परिषद की प्रामाणिक पहचान एवं लोक-कल्याणकारी सामाजिक दर्शन"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Core Identity Texts */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">2. संगठन मूल विवरण (Organization Core)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">संगठन का नाम * (Organization Name)</label>
                          <input
                            type="text"
                            value={siteContentState.orgName || ""}
                            onChange={(e) => handleCmsFieldChange("orgName", e.target.value)}
                            placeholder="पश्चिमांचल विकास परिषद"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-bold"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">सिद्धांत/नारा * (Tagline / Slogan)</label>
                          <input
                            type="text"
                            value={siteContentState.orgTagline || ""}
                            onChange={(e) => handleCmsFieldChange("orgTagline", e.target.value)}
                            placeholder="🌿 प्रकृति से संस्कृति की ओर 🌿"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-stone-700 font-extrabold mb-1">संक्षिप्त ध्येय वाक्य * (Mission Statement - 2-3 lines)</label>
                        <textarea
                          rows={3}
                          value={siteContentState.orgMission || ""}
                          onChange={(e) => handleCmsFieldChange("orgMission", e.target.value)}
                          placeholder="हमारा संकल्प पश्चिमांचल की अमूल्य जल संपदा का पुनरुद्धार करना, मृदा स्वास्थ्य की नव-चेतना जगाना..."
                          className="w-full px-3 py-2 border rounded-xl outline-none bg-white font-semibold leading-relaxed"
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3: Dedicated Logo Management Area */}
                    <div className="space-y-4 pt-2 bg-[#efe7d6]/30 p-4 rounded-2xl border border-stone-200">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-[#0f4d24] uppercase tracking-widest border-l-2 border-[#0f4d24] pl-2">
                          3. आधिकारिक लोगो प्रबंधन (Logo Management Hub)
                        </h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">आधिकारिक प्रणाली</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Control column */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex flex-col">
                            <label className="text-stone-700 font-extrabold mb-1.5">आधिकारिक लोगो अपलोड करें / बदलें (Upload / Replace Logo)</label>
                            <ImageUploader
                              label="संगठन लोगो फ़ाइल (Organization Logo Image File)"
                              value={siteContentState.orgLogo || ""}
                              onChange={(base64) => handleCmsFieldChange("orgLogo", base64)}
                            />
                            <p className="text-[10px] text-stone-500 mt-1">PNG, JPG या GIF फॉर्मेट में अपलोड करें। पारदर्शी पृष्ठभूमि (Transparent PNG) सर्वोत्तम दृश्य प्रदान करती है।</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <label className="text-stone-700 font-extrabold mb-1">लोगो का आकार (Adjust Logo Size)</label>
                              <select
                                value={siteContentState.orgLogoSize || "medium"}
                                onChange={(e) => handleCmsFieldChange("orgLogoSize", e.target.value)}
                                className="px-3 py-2 border rounded-xl outline-none bg-white font-hindi font-bold cursor-pointer"
                              >
                                <option value="small">छोटा (Small Size)</option>
                                <option value="medium">मध्यम (Medium Size - Default)</option>
                                <option value="large">बड़ा (Large Size)</option>
                              </select>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const savedContent = dbInstance.getSiteContent();
                                  handleCmsFieldChange("orgLogo", savedContent.orgLogo || "");
                                  alert("पिछला सहेजा गया लोगो पुनर्स्थापित किया गया! (Previous logo restored!)");
                                }}
                                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl font-bold cursor-pointer transition-colors text-center text-xs active:scale-99 flex items-center justify-center gap-1.5"
                                title="पिछला लोगो बहाल करें"
                              >
                                <span>↩</span> पिछला लोगो पुनर्स्थापित करें
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* CMS Live Preview Column */}
                        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-3 min-h-[180px]">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 block border-b pb-1 w-full text-center">
                            लोगो लाइव पूर्वावलोकन (Live Preview before Saving)
                          </span>
                          
                          <div className="relative flex items-center justify-center">
                            {siteContentState.orgLogo ? (
                              <div className={`rounded-full shadow-md border-2 border-amber-500 overflow-hidden bg-white flex items-center justify-center p-1 ${
                                siteContentState.orgLogoSize === "small" ? "w-20 h-20" :
                                siteContentState.orgLogoSize === "large" ? "w-36 h-36" :
                                "w-28 h-28"
                              }`}>
                                <img
                                  src={siteContentState.orgLogo}
                                  alt="Preview PVP NGO Logo"
                                  className="w-full h-full object-contain rounded-full"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              // Beautiful dynamic fallback emblem preview
                              <div className={`rounded-full bg-gradient-to-tr from-[#0a3318] to-[#1e5a2e] text-[#efe7d6] shadow-md border-2 border-[#d1bf9d] flex flex-col items-center justify-center p-1 relative ${
                                siteContentState.orgLogoSize === "small" ? "w-20 h-20" :
                                siteContentState.orgLogoSize === "large" ? "w-36 h-36" :
                                "w-28 h-28"
                              }`}>
                                <span className={siteContentState.orgLogoSize === "small" ? "text-lg" : "text-3xl"}>🌱</span>
                                <span className="font-hindi text-[7px] font-black leading-none mt-1 tracking-wide text-amber-300 block">PVP भारत</span>
                              </div>
                            )}
                            
                            {/* Unsaved indicator badge */}
                            <span className="absolute -top-1 -right-2 bg-amber-500/90 text-white rounded-full text-[8px] font-sans font-bold px-2 py-0.5 animate-bounce shadow">
                              UNSAVED
                            </span>
                          </div>

                          <div className="space-y-0.5 leading-none">
                            <p className="font-bold text-stone-900 text-xs sm:text-sm">{siteContentState.orgName || "पश्चिमांचल विकास परिषद"}</p>
                            <span className="text-[10.5px] text-stone-500 font-medium tracking-tight italic block mt-0.5">{siteContentState.orgTagline || "🌿 प्रकृति से संस्कृति की ओर 🌿"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Background Image Config */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">4. अनुभाग पृष्ठभूमि (Section Background - Optional)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">पृष्ठभूमि चित्र अपलोड करें (Section Background Image)</label>
                          <ImageUploader
                            label="पृष्ठभूमि फोटो (Parchment or river backdrop)"
                            value={siteContentState.orgBgImage || ""}
                            onChange={(base64) => handleCmsFieldChange("orgBgImage", base64)}
                          />
                          <p className="text-[10px] text-stone-500 mt-1">वैकल्पिक: अपलोड करने पर यह संपूर्ण संगठन पहचान अनुभाग के पीछे दिखाई देगा। (Highly readable contrast adjustments will auto-apply!)</p>
                        </div>

                        {siteContentState.orgBgImage && (
                          <div className="flex flex-col justify-end bg-stone-100 p-3 rounded-2xl border border-stone-200">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-stone-400 block mb-1">वर्तमान अपलोड पृष्ठभूमि</span>
                            <div className="h-16 rounded-lg overflow-hidden border border-stone-300 relative">
                              <img src={siteContentState.orgBgImage} className="w-full h-full object-cover" alt="Background preview" />
                              <button
                                type="button"
                                onClick={() => handleCmsFieldChange("orgBgImage", "")}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-750 text-white p-1 text-[9px] px-2 rounded-md font-bold cursor-pointer"
                              >
                                हटाएं (Remove)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Submission */}
                    <div className="flex gap-3 pt-3 border-t border-stone-200 justify-end">
                      <button
                        type="submit"
                        className="px-5 py-3 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-black hover:bg-ngo-forest transition-all flex items-center gap-1.5 shadow-md active:scale-99 hover:shadow-xl cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        संगठन पहचान व लोगो सहेजें (Save Identity Configuration)
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-tab: HEADER BRANDING & LOGO CONTROL */}
                {cmsSubTab === "header_branding" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("हेडर ब्रैंडिंग व लोगो सेटिंग्स सफलतापूर्वक सहेज दी गईं! (Header Branding settings saved!)");
                      loadAllData();
                    }}
                    className="space-y-6 text-xs sm:text-sm font-hindi bg-[#efe7d6]/10 p-4 sm:p-5 rounded-2xl border border-amber-500/20"
                  >
                    <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-stone-900">नेविगेशन हेडर ब्रैंडिंग व लोगो नियंत्रण (Header Logo & Title CMS)</h3>
                        <p className="text-stone-500 text-xs mt-1">यहाँ से वेबसाइट के ऊपर प्रदर्शित होने वाले मुख्य लोगो, संगठन शीर्षक, भाषा समायोजन और स्थिति-आकार को सहेजें।</p>
                      </div>
                      <span className="text-xl select-none">🌐</span>
                    </div>

                    {/* Section 1: Header Titles and Translations */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">1. हेडर मुख्य पाठ और भाषा (Header Branding Text)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">संगठन का हिन्दी नाम (Hindi Name) *</label>
                          <input
                            type="text"
                            required
                            value={siteContentState.headerOrgNameHi || ""}
                            onChange={(e) => handleCmsFieldChange("headerOrgNameHi", e.target.value)}
                            placeholder="जैसे: पश्चिमांचल विकास परिषद"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium focus:ring-1 focus:ring-[#0f4d24]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">अंग्रेजी नाम / प्रत्यय (English Suffix) *</label>
                          <input
                            type="text"
                            required
                            value={siteContentState.headerOrgNameEn || ""}
                            onChange={(e) => handleCmsFieldChange("headerOrgNameEn", e.target.value)}
                            placeholder="जैसे: (भारत) या (NGO)"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium focus:ring-1 focus:ring-[#0f4d24]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">मुख्य ध्येय सूत्र/टैगलाइन (Tagline Description) *</label>
                          <input
                            type="text"
                            required
                            value={siteContentState.headerTagline || ""}
                            onChange={(e) => handleCmsFieldChange("headerTagline", e.target.value)}
                            placeholder="जैसे: प्रकृति से संस्कृति की ओर"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium focus:ring-1 focus:ring-[#0f4d24]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">हेडर उप-शीर्षक संदेश (Header Subtitle Text) *</label>
                          <input
                            type="text"
                            required
                            value={siteContentState.headerSubtitle || ""}
                            onChange={(e) => handleCmsFieldChange("headerSubtitle", e.target.value)}
                            placeholder="जैसे: प्रकृति से संस्कृति की ओर"
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-medium focus:ring-1 focus:ring-[#0f4d24]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Logo Layout, Size & Alignment Controls */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">2. लोगो संरेखण व माप नियंत्रण (Size, Position & Alignment)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1">लोगो की स्थिति / दिशा (Logo Position Layout)</label>
                          <select
                            value={siteContentState.headerLogoPosition || "left"}
                            onChange={(e) => handleCmsFieldChange("headerLogoPosition", e.target.value)}
                            className="px-3 py-2 border rounded-xl outline-none bg-white font-hindi"
                          >
                            <option value="left">बाईं ओर (Logo Left, Text Right / Traditional)</option>
                            <option value="right">दाईं ओर (Logo Right, Text Left)</option>
                            <option value="top">ऊपर मध्य में (Logo Top Centered, Text Below)</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-stone-700 font-extrabold mb-1 flex justify-between">
                            <span>लोगो का आकार / ऊँचाई (Logo Custom Height Slider)</span>
                            <span className="font-mono text-amber-800">{siteContentState.headerLogoSize || 64} px</span>
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="32"
                              max="120"
                              value={siteContentState.headerLogoSize || 64}
                              onChange={(e) => handleCmsFieldChange("headerLogoSize", Number(e.target.value))}
                              className="flex-1 accent-[#0f4d24] h-1.5 bg-stone-250 rounded-lg cursor-pointer"
                            />
                            <input
                              type="number"
                              min="32"
                              max="120"
                              value={siteContentState.headerLogoSize || 64}
                              onChange={(e) => handleCmsFieldChange("headerLogoSize", Number(e.target.value) || 64)}
                              className="w-16 px-1 py-1 border text-center rounded-lg"
                            />
                          </div>
                          <span className="text-[10px] text-stone-500 mt-1">लोगो का आकार 32px से 120px के बीच समायोजित कर सकते हैं।</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Logo Image Upload with Preview & Restorative Memory Cache */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest border-l-2 border-amber-600 pl-2">3. लोगो चित्र अपलोड एवं प्रबंधन (Logo File & Restore System)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        
                        {/* File Upload Box */}
                        <div className="space-y-3">
                          <ImageUploader
                            label="नया लोगो चित्र अपलोड करें (Select/Drag Logo)"
                            value={siteContentState.headerLogo || ""}
                            onChange={(base64) => {
                              // Cache previous logo
                              if (siteContentState.headerLogo) {
                                handleCmsFieldChange("headerLogoRestore", siteContentState.headerLogo);
                              }
                              handleCmsFieldChange("headerLogo", base64);
                            }}
                          />
                          <div className="flex flex-col mt-2">
                            <div className="text-[10px] text-stone-500">अथवा कोई आधिकारिक छवि बाहरी URL पाथ सीधे भरें:</div>
                            <input
                              type="text"
                              placeholder="जैसे: /src/assets/images/... "
                              value={siteContentState.headerLogo || ""}
                              onChange={(e) => handleCmsFieldChange("headerLogo", e.target.value)}
                              className="px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24] mt-1"
                            />
                          </div>
                        </div>

                        {/* Visual Preview Box */}
                        <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-250 flex flex-col items-center justify-between min-h-[160px]">
                          <div className="text-center w-full">
                            <div className="text-xs font-bold text-stone-700 mb-2">लोगो रीयल-टाइम पूर्वावलोकन (Logo Live Preview)</div>
                            <div className="w-24 h-24 border bg-white rounded-xl mx-auto flex items-center justify-center p-2 shadow-inner">
                              {siteContentState.headerLogo ? (
                                <img
                                  src={siteContentState.headerLogo}
                                  alt="Preview logo"
                                  className="max-w-full max-h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-center text-xs text-stone-400">
                                  <span className="text-2xl block">🎨</span>
                                  डिफ़ॉल्ट SVG लोगो (Default)
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 w-full mt-4">
                            {siteContentState.headerLogoRestore && (
                              <button
                                type="button"
                                onClick={() => {
                                  const current = siteContentState.headerLogo;
                                  const previous = siteContentState.headerLogoRestore;
                                  setSiteContentState({
                                    ...siteContentState,
                                    headerLogo: previous,
                                    headerLogoRestore: current
                                  });
                                  alert("पिछला लोगो सफलतापूर्वक पुनर्स्थापित किया गया!");
                                }}
                                className="px-3 py-2 bg-amber-650/10 hover:bg-amber-650/20 text-amber-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-amber-200"
                              >
                                ⏮️ पिछला लोगो पुनर्स्थापित करें (Restore Previous Logo)
                              </button>
                            )}

                            {siteContentState.headerLogo && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("क्या आप सचमुच इस लोगो को हटाकर मूल वैदिक SVG लोगो लागू करना चाहते हैं?")) {
                                    handleCmsFieldChange("headerLogoRestore", siteContentState.headerLogo);
                                    handleCmsFieldChange("headerLogo", "");
                                  }
                                }}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-red-200"
                              >
                                ♻️ मूल डिफ़ॉल्ट लोगो सक्रिय करें (Reset to Default SVG)
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Submit Handler Button */}
                    <div className="flex gap-2.5 pt-4 border-t border-stone-200 justify-end">
                      <button
                        type="submit"
                        className="px-5 py-3 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-black hover:bg-ngo-forest transition-all flex items-center gap-1.5 shadow-md active:scale-99 hover:shadow-xl cursor-pointer text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        हेडर ब्रैंडिंग व लोगो सुरक्षित करें (Save Header Branding)
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-tab 5: SITE IDENTITY SETTINGS */}
                {cmsSubTab === "website" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("वेबसाइट सेटिंग्स सफलतापूर्वक सहेजी गईं! (All website settings saved!)");
                      loadAllData();
                    }}
                    className="space-y-4 text-xs sm:text-sm bg-white p-5 rounded-2xl border border-stone-200 shadow-sm"
                  >
                    <div className="border-b pb-2 mb-2">
                      <h4 className="font-hindi text-base font-bold text-stone-850">🌐 वेबसाइट बुनियादी सेटिंग्स (Website Settings)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">संगठन लोगो नाम (Website Logo Title) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.siteLogoText || ""}
                          onChange={(e) => handleCmsFieldChange("siteLogoText", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">लोगो इमोजी (Logo Emoji Symbol) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.siteLogoEmoji || ""}
                          onChange={(e) => handleCmsFieldChange("siteLogoEmoji", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">Favicon लिंक या पाथ (Favicon Path) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.siteFavicon || ""}
                          onChange={(e) => handleCmsFieldChange("siteFavicon", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">वेबसाइट का शीर्षक (Browser HTML Title) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.siteTitle || ""}
                          onChange={(e) => handleCmsFieldChange("siteTitle", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">स्थापना तिथि (Foundation Date) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.aboutDate || ""}
                          onChange={(e) => handleCmsFieldChange("aboutDate", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none"
                          placeholder="जैसे: 01 अक्टूबर 2026"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">स्थापना स्थान (Foundation Location) *</label>
                        <input
                          type="text"
                          value={siteContentState.foundationLocation || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({ ...prev, foundationLocation: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none"
                          placeholder="जैसे: कांधला, शामली (उ०प्र०)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">मुख्य हेडर नारा (Hero Section Slogan) *</label>
                        <textarea
                          rows={2}
                          required
                          value={siteContentState.heroSubtitle || ""}
                          onChange={(e) => handleCmsFieldChange("heroSubtitle", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">अध्यक्ष का नाम (President Name) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.heroPresidentName || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({
                              ...prev,
                              heroPresidentName: val,
                              presMessageName: val
                            }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-stone-700 font-extrabold mb-1">मुख्य हेडर शीर्षक (Hero Section Title Text) *</label>
                      <input
                        type="text"
                        required
                        value={siteContentState.heroTitle || ""}
                        onChange={(e) => handleCmsFieldChange("heroTitle", e.target.value)}
                        className="px-3 py-2 border rounded-xl outline-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-stone-700 font-extrabold mb-1">संगठन विचारधारा (Hero Section Slogan Text) *</label>
                      <textarea
                        rows={3}
                        required
                        value={siteContentState.heroSlogan || ""}
                        onChange={(e) => handleCmsFieldChange("heroSlogan", e.target.value)}
                        className="px-3 py-2 border rounded-xl outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-stone-700 font-extrabold mb-1">पाद लेख विवरण (Footer Summary Text) *</label>
                      <textarea
                        rows={2}
                        required
                        value={siteContentState.siteFooterText || ""}
                        onChange={(e) => handleCmsFieldChange("siteFooterText", e.target.value)}
                        className="px-3 py-2 border rounded-xl outline-none resize-none"
                      />
                    </div>

                    {/* Collaborative Partner Logos CMS Editor */}
                    {(() => {
                      let partners: { name: string; logoText: string; imageUrl?: string }[] = [];
                      try {
                        partners = JSON.parse(siteContentState.partnerLogosJson || "[]");
                      } catch {}
                      if (!partners || partners.length === 0) {
                        partners = [
                          { name: "राष्ट्रीय जल मिशन", logoText: "💧" },
                          { name: "गंगा विचार मंच", logoText: "🌊" },
                          { name: "खादी एवं ग्रामोद्योग", logoText: "🌾" },
                          { name: "पतंजलि योगपीठ", logoText: "🕉️" },
                          { name: "पश्चिमांचल कृषक संगठन", logoText: "🚜" },
                          { name: "वेद विद्या प्रतिष्ठान", logoText: "📖" },
                          { name: "पर्यावरण वाहिनी", logoText: "☘️" },
                          { name: "भूजल प्रहरी संघ", logoText: "🏞️" }
                        ];
                      }
                      
                      return (
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mt-6 space-y-4 font-hindi">
                          <div className="border-b pb-2">
                            <h4 className="font-hindi text-sm font-black text-stone-800 flex items-center gap-1.5">
                              🤝 मुख्य सहयोगी संस्थाएं प्रचालक (Supporting Partner Logos Settings)
                            </h4>
                            <p className="text-[10px] text-stone-500 font-normal leading-normal">यहाँ आप मुख्य सहयोगी संस्थाओं के नाम, प्रतीक इमोजी या अपलोड लोगो चित्र का प्रबंधन कर सकते हैं। ये नीचे सहयोग स्क्रॉल पट्टी (Partner Marquee Carousel) में प्रतिबिंबित होते हैं।</p>
                          </div>

                          {/* Partners List Table */}
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {partners.map((partner, pIdx) => (
                              <div key={pIdx} className="flex items-center justify-between bg-white border border-stone-200 p-2 rounded-xl shadow-sm text-xs">
                                <div className="flex items-center gap-2.5">
                                  {partner.imageUrl ? (
                                    <img src={partner.imageUrl} className="w-8 h-8 object-contain rounded-full border border-stone-200 bg-white" alt={partner.name} />
                                  ) : (
                                    <span className="text-xl">{partner.logoText || "🌱"}</span>
                                  )}
                                  <div>
                                    <div className="font-extrabold text-stone-800">{partner.name}</div>
                                    <div className="text-[10px] text-stone-500 font-normal leading-none mt-0.5">{partner.imageUrl ? "कस्टम लोगो चित्र" : `इमोजी: ${partner.logoText}`}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = partners.filter((_, i) => i !== pIdx);
                                    handleCmsFieldChange("partnerLogosJson", JSON.stringify(updated));
                                  }}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-[10.5px] font-bold border border-red-200 cursor-pointer transition-all active:scale-98"
                                >
                                  हटाएं
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Partner Form */}
                          <div className="bg-amber-50/40 border border-amber-200/70 p-3 rounded-xl space-y-3">
                            <span className="text-[10.5px] uppercase font-extrabold text-[#785b2e] block">नया सहयोगी जोड़ें (Add New Partner Organization)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="flex flex-col">
                                <label className="text-[11px] font-extrabold mb-1">संस्था का नाम (Partner Name)</label>
                                <input
                                  type="text"
                                  id="new-partner-name"
                                  placeholder="जैसे: राष्ट्रीय युवा संघ"
                                  className="px-3 py-2 bg-white border rounded-lg outline-none text-xs"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-[11px] font-extrabold mb-1">लोगो इमोजी (Fallback Emoji Symbol)</label>
                                <input
                                  type="text"
                                  id="new-partner-emoji"
                                  placeholder="जैसे: 🌳"
                                  className="px-3 py-2 bg-white border rounded-lg outline-none text-xs"
                                />
                              </div>
                            </div>

                            {/* Logo Image Upload */}
                            <div className="flex flex-col bg-white border border-stone-200 p-2 rounded-lg space-y-1">
                              <label className="text-[11px] font-extrabold text-stone-750">लोगो आवरण फोटो (Upload Logo Image - Optional)</label>
                              <ImageUploader
                                label="साझीदार लोगो अपलोड करें (Upload custom logo)"
                                value=""
                                onChange={(base64) => {
                                  (window as any)._temp_partner_logo_base64 = base64;
                                  alert("सहयोगी लोगो चित्र सफलतापूर्वक संकलित किया गया! अब नीचे 'सहयोगी जोड़ें' बटन दबाएं।");
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const nameInput = document.getElementById("new-partner-name") as HTMLInputElement;
                                const emojiInput = document.getElementById("new-partner-emoji") as HTMLInputElement;
                                const tempLogo = (window as any)._temp_partner_logo_base64;

                                if (!nameInput || !nameInput.value.trim()) {
                                  alert("कृपया संस्था का नाम दर्ज करें!");
                                  return;
                                }

                                const newPartner = {
                                  name: nameInput.value.trim(),
                                  logoText: emojiInput ? emojiInput.value.trim() || "🌱" : "🌱",
                                  imageUrl: tempLogo || undefined
                                };

                                const updated = [...partners, newPartner];
                                handleCmsFieldChange("partnerLogosJson", JSON.stringify(updated));

                                // Clean values
                                nameInput.value = "";
                                if (emojiInput) emojiInput.value = "";
                                (window as any)._temp_partner_logo_base64 = null;
                                alert(`सहयोगी संस्था '${newPartner.name}' को सूची में जोड़ दिया गया है। सेव करने के लिए नीचे 'वेबसाइट सेटिंग्स सहेजें' पर क्लिक करें।`);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-[#1b5025] hover:bg-ngo-forest text-[#efe7d6] rounded-xl font-hindi text-xs font-bold shadow hover:shadow-lg transition-transform active:scale-98 cursor-pointer text-center"
                            >
                              + सहयोगी जोड़ें (Add to List)
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-bold hover:bg-ngo-forest transition-colors flex items-center gap-1 shadow cursor-pointer md:w-max mt-4"
                    >
                      <Check className="w-4 h-4 text-[#efe7d6]" />
                      वेबसाइट सेटिंग्स सहेजें (Save Website Settings)
                    </button>
                  </form>
                )}

                {/* Sub-tab 7: DONATION SETTINGS */}
                {cmsSubTab === "donation" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("सहयोग निधि व बैंक खाता विवरण (Donation Settings) सहेज दिये गए हैं!");
                      loadAllData();
                    }}
                    className="space-y-4 text-xs sm:text-sm bg-white p-5 rounded-2xl border border-stone-200 shadow-sm font-hindi animate-fade-in"
                  >
                    <div className="border-b pb-2 mb-2">
                      <h4 className="font-hindi text-base font-bold text-stone-850">💰 सहयोग निधि व बैंक खाता विवरण (Donation Settings)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">यूपीआई आईडी (UPI ID for Transfer) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.donationUpiId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({ ...prev, donationUpiId: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none font-sans font-bold text-stone-800"
                          placeholder="जैसे: pvpngo@sbi"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">खाताधारक का नाम (Account Holder Name) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.donationAccountHolder || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({ ...prev, donationAccountHolder: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none text-stone-800"
                          placeholder="जैसे: Paschimanchal Vikas Parishad"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">बैंक का नाम (Bank Name) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.donationBankName || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({ ...prev, donationBankName: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none text-stone-800"
                          placeholder="जैसे: State Bank of India"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">खाता संख्या (Account Number) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.donationAccountNumber || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteContentState(prev => ({ ...prev, donationAccountNumber: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none font-sans font-bold tracking-wider text-stone-850"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">आईएफएससी कोड (IFSC Code) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.donationIfscCode || ""}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setSiteContentState(prev => ({ ...prev, donationIfscCode: val }));
                          }}
                          className="px-3 py-2 border rounded-xl outline-none font-sans font-bold text-stone-850"
                          placeholder="जैसे: SBIN0001234"
                        />
                      </div>
                    </div>

                    {/* QR Code Replacement & Preview */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <ImageUploader
                        label="दान क्यूआर कोड छवि (Merchant UPI QR Code Image) - पुरानी मिटायें या नई बदलें"
                        value={siteContentState.donationQrCode || ""}
                        onChange={(base64) => {
                          setSiteContentState(prev => ({
                            ...prev,
                            donationQrCode: base64
                          }));
                        }}
                      />
                      <p className="text-[11px] text-stone-550 font-hindi mt-1.5 leading-relaxed">
                        * यहाँ अपलोड की गई भुगतान क्यूआर कोड इमेजं सार्वजनिक 'सहयोग निधि (Donate)' सेक्शन के यूपीआई बॉक्स में स्वतः दिखाई देगी।
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-bold hover:bg-[#155e2d] transition-colors flex items-center gap-1 shadow cursor-pointer md:w-max"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      सहयोग निधि विवरण सहेजें (Save Donation Settings)
                    </button>
                  </form>
                )}

                {/* Sub-tab 8: CONTACT & LINKS */}
                {cmsSubTab === "links" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dbInstance.saveSiteContent(siteContentState);
                      alert("संपर्क व सोशल कड़ियां सुरक्षित कर दी गई हैं!");
                      loadAllData();
                    }}
                    className="space-y-4 text-xs sm:text-sm bg-[#fcfbfa] p-5 rounded-2xl border border-stone-200 shadow-sm font-hindi animate-fade-in"
                  >
                    <div className="border-b pb-2 mb-2">
                      <h4 className="font-hindi text-base font-bold text-[#121c15]">📞 संपर्क कड़ियाँ व सोशल मीडिया (Contact & Links Settings)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-hindi text-stone-700 font-extrabold mb-1">फ़ोन नंबर (Phone Number) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.contactPhone || ""}
                          onChange={(e) => handleCmsFieldChange("contactPhone", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none text-xs text-[#121c15] font-bold bg-white"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-hindi text-[#121c15] font-extrabold mb-1">ईमेल (Email Address) *</label>
                        <input
                          type="text"
                          required
                          value={siteContentState.contactEmail || ""}
                          onChange={(e) => handleCmsFieldChange("contactEmail", e.target.value)}
                          className="px-3 py-2 border rounded-xl outline-none text-xs text-[#121c15] font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-[#121c15] font-extrabold mb-1">आधिकारिक पता (Office Address) *</label>
                      <textarea
                        rows={2}
                        required
                        value={siteContentState.contactAddress || ""}
                        onChange={(e) => handleCmsFieldChange("contactAddress", e.target.value)}
                        className="px-3 py-2 border rounded-xl outline-none resize-none text-xs text-[#121c15] font-bold bg-white"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-stone-700 font-extrabold mb-1">
                        गूगल मैप्स एम्बेड लिंक (Google Maps Embed iframe src URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={siteContentState.contactMapUrl || ""}
                        onChange={(e) => handleCmsFieldChange("contactMapUrl", e.target.value)}
                        className="px-3 py-2 border rounded-xl outline-none text-xs font-mono"
                      />
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border space-y-4">
                      <h4 className="font-bold text-[#0f4d24] border-b pb-2 mb-2 font-hindi text-xs sm:text-sm uppercase">
                        सोशल मीडिया संपर्क कड़ियां (Social Connection Links)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                        <div className="flex flex-col">
                          <label className="font-bold text-stone-700 mb-1">Facebook Page/Link</label>
                          <input
                            type="text"
                            value={siteContentState.socialFacebook || ""}
                            onChange={(e) => handleCmsFieldChange("socialFacebook", e.target.value)}
                            className="px-3 py-2 bg-white border rounded-lg outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-stone-700 mb-1">Twitter (X) Link</label>
                          <input
                            type="text"
                            value={siteContentState.socialTwitter || ""}
                            onChange={(e) => handleCmsFieldChange("socialTwitter", e.target.value)}
                            className="px-3 py-2 bg-white border rounded-lg outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-stone-700 mb-1">Instagram Link</label>
                          <input
                            type="text"
                            value={siteContentState.socialInstagram || ""}
                            onChange={(e) => handleCmsFieldChange("socialInstagram", e.target.value)}
                            className="px-3 py-2 bg-white border rounded-lg outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-stone-700 mb-1">LinkedIn Page</label>
                          <input
                            type="text"
                            value={siteContentState.socialLinkedin || ""}
                            onChange={(e) => handleCmsFieldChange("socialLinkedin", e.target.value)}
                            className="px-3 py-2 bg-white border rounded-lg outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl font-hindi font-bold hover:bg-[#155e2d] transition-colors flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      संपर्क व कड़ियां सहेजें (Save Web Links)
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL WINDOW FOR DYNAMIC CONTENT INITIALIZATIONS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 flex items-center justify-center p-4">
          <div className="bg-[#f5f1e8] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-300 relative max-h-[85vh] overflow-y-auto shadow-2xl">
            
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 bg-stone-200/50 hover:bg-stone-205 p-1.5 rounded-full"
              title="बंद करें"
            >
              ✕
            </button>

            <h3 className="font-hindi text-xl font-black text-[#0f4d24] border-b pb-2 mb-6">
              {activeTab === "campaigns" && "नया अभियान जोड़ें (Add Campaign)"}
              {activeTab === "gallery" && "नया गैलरी चित्र जोड़ें (Add Photo)"}
              {activeTab === "news" && "नया प्रेस नोट जोड़ें (Add News)"}
              {activeTab === "guides" && "नया संरक्षक/मार्गदर्शक जोड़ें (Add Guide Mentor)"}
            </h3>

            <form onSubmit={handleAddNewItem} className="space-y-4 font-hindi">
              
              {/* CAMPAIGN FIELDS */}
              {activeTab === "campaigns" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">अभियान का शीर्षक (हिन्दी में) *</label>
                    <input type="text" required placeholder="जैसे: कौरवी बोली बचाओ मुहीम" value={campTitleHi} onChange={e=>setCampTitleHi(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">अभियान का शीर्षक (English Title) *</label>
                    <input type="text" required placeholder=" जैसे: Save Kaurvi Language" value={campTitleEn} onChange={e=>setCampTitleEn(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">उप-शीर्षक (हिन्दी में)</label>
                    <input type="text" placeholder="जैसे: हमारी संस्कृति, हमारी धरोहर" value={campSubHi} onChange={e=>setCampSubHi(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">उप-शीर्षक (English Subtitle)</label>
                    <input type="text" placeholder="जैसे: Protect Our Roots" value={campSubEn} onChange={e=>setCampSubEn(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">विस्तृत विवरण (Description) *</label>
                    <textarea rows={3} required placeholder="इस अभियान के उद्देश्यों व गतिविधियों का विवरण..." value={campDesc} onChange={e=>setCampDesc(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none resize-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 text-stone-700">चित्र पाथ (Image Source / URL) *</label>
                    <input type="text" required placeholder="जैसे: /src/assets/images/... या base64" value={campImg} onChange={e=>setCampImg(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                </>
              )}

              {/* GALLERY FIELDS */}
              {activeTab === "gallery" && (
                <>
                  <div className="flex flex-col gap-1.5 font-hindi text-stone-900">
                    <label className="text-xs font-bold text-stone-700">गैलरी चित्र अपलोड करें (Upload Gallery Image) *</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-250 cursor-pointer text-center min-h-[140px]
                        \${
                          dragActive
                            ? "border-[#0f4d24] bg-emerald-500/5 scale-[1.01]"
                            : galPreview
                            ? "border-emerald-300/40 bg-stone-50"
                            : "border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/10"
                        }
                      `}
                    >
                      <input
                        id="gallery-file-upload"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                      />

                      {!galPreview ? (
                        <label
                          htmlFor="gallery-file-upload"
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4"
                        >
                          <Upload className="w-8 h-8 text-stone-400 mb-2" />
                          <span className="text-xs font-bold text-stone-700 leading-tight">
                            यहाँ अपनी इमेज खींचे व छोड़े या क्लिक करें (Drag & Drop or Tap to Upload)
                          </span>
                        </label>
                      ) : (
                        <div className="relative w-full flex flex-col items-center py-2">
                          <div className="relative group/thumb rounded-xl overflow-hidden border border-stone-200 shadow-md aspect-video w-full max-w-[200px] mb-3">
                            <img
                              src={galPreview}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                                    <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 text-stone-700 font-hindi">चित्र का शीर्षक (Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="जैसे: प्रथम अधिवेशन"
                      value={galTitle}
                      onChange={e => setGalTitle(e.target.value)}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none text-[#121c15] font-bold font-sans"
                    />
                  </div>
                </>
              )}

              {/* NEWS FIELDS */}
              {activeTab === "news" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 font-hindi text-[#121c15]">प्रेस नोट शीर्षक (News Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="जैसे: बैठक संपन्न हुई..."
                      value={newsTitle}
                      onChange={e => setNewsTitle(e.target.value)}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none text-[#121c15] font-bold font-sans"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 font-hindi">संक्षिप्त सारांश *</label>
                    <input type="text" required placeholder="संक्षिप्त विवरण डालें" value={newsSummary} onChange={e=>setNewsSummary(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 font-hindi">विस्तृत समाचार सामग्री (Full Content) *</label>
                    <textarea rows={4} required placeholder="समाचार की पूर्ण रिपोर्ट..." value={newsContent} onChange={e=>setNewsContent(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none resize-none" />
                  </div>
                </>
              )}

              {/* GUIDES FIELDS */}
              {activeTab === "guides" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 font-hindi">संरक्षक/मार्गदर्शक का नाम (Name) *</label>
                    <input type="text" required placeholder="जैसे: आचार्य देवव्रत शास्त्री" value={guideName} onChange={e=>setGuideName(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 font-hindi">पद / दायित्व (Designation) *</label>
                    <input type="text" required placeholder="जैसे: वरिष्ठ सांस्कृतिक मार्गदर्शक" value={guideDesignation} onChange={e=>setGuideDesignation(e.target.value)} className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none" />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer text-stone-600"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl text-xs font-bold hover:bg-[#155e2d] cursor-pointer"
                >
                  सहेजें एवं जोड़ें (Save Item)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MEMBER/VOLUNTEER DETAILED CERTIFICATE VIEW MODAL */}
      {selectedMember && (
        <div id="printable-admin-member-application" className="fixed inset-0 z-55 overflow-y-auto bg-[#efe7d6]/95 flex items-center justify-center p-2 sm:p-4 shadow-2xl">
          <div className="bg-[#f5f1e8] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-300 relative max-h-[95vh] overflow-y-auto">
            
            <button 
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-stone-600 hover:text-stone-900 bg-stone-200/50 hover:bg-stone-200 p-2 rounded-full cursor-pointer transition-colors print:hidden"
              title="बंद करें"
            >
              ✕
            </button>

            {/* Form Heading Header */}
            <div className="text-center space-y-1 border-b-2 border-[#0f4d24] pb-4">
                <h4 className="text-xl sm:text-2xl font-black text-[#0f4d24] uppercase tracking-wide">पश्चिमांचल विकास परिषद (भारत)</h4>
                <p className="text-[10px] sm:text-xs font-extrabold text-stone-600 tracking-wider">🌿 आंदोलन सदस्यता आधिकारिक पंजीकरण पत्र 🌿</p>
                <div className="flex justify-between items-center text-[10px] font-sans font-extrabold text-stone-500 pt-2 px-1">
                  <span>MEMBERSHIP ID: <strong className="text-[#0f4d24] font-black underline">{selectedMember.id}</strong></span>
                  <span>JOIN CERT: <strong className="text-amber-805 font-black">{selectedMember.joinCertificateNo || "PVP-CRT-0000000"}</strong></span>
                </div>
              </div>

              {/* Passport Photo and Personal details flexbox */}
              <div className="flex flex-col md:flex-row gap-5.5 pt-5 relative">
                
                {/* Details on Left */}
                <div className="flex-1 space-y-3.5 text-xs text-stone-800">
                  
                  {/* Category Header: personal */}
                  <div className="bg-[#0f4d24]/10 text-[#0f4d24] text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border-l-4 border-[#0f4d24]">1. व्यक्तिगत विवरण (Personal Particulars)</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">सदस्य का पूरा नाम (Full Name)</span>
                      <strong className="text-[#0f4d24] text-sm font-black">{selectedMember.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">पिता का नाम (Father's Name)</span>
                      <strong className="text-stone-900 font-bold">{selectedMember.fathersName || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">जन्म तिथि (Date of Birth)</span>
                      <strong className="text-stone-850 font-bold font-sans">{selectedMember.dob || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">व्यवसाय / पेशा (Occupation)</span>
                      <strong className="text-stone-850 font-bold">{selectedMember.occupation || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">मोबाइल नंबर (Phone)</span>
                      <strong className="text-stone-900 font-bold font-sans">{selectedMember.phone}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">ईमेल पता (Email Account)</span>
                      <strong className="text-stone-700 font-sans break-all">{selectedMember.email || "N/A"}</strong>
                    </div>
                  </div>

                  {/* Address part */}
                  <div className="bg-[#0f4d24]/10 text-[#0f4d24] text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border-l-4 border-[#0f4d24]">2. भौगोलिक पता (Address Specifications)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">जिला (District)</span>
                      <strong className="text-[#0f4d24] font-bold">{selectedMember.district || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">ब्लॉक (Block)</span>
                      <strong className="text-stone-900 font-bold">{selectedMember.block || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 font-bold block text-[10px]">गाँव / शहर (Village/City)</span>
                      <strong className="text-stone-900 font-bold">{selectedMember.city || "N/A"}</strong>
                    </div>
                  </div>

                </div>

                {/* Passport photo thumbnail right aligned */}
                <div className="w-28 h-36 bg-white border-2 border-stone-300 rounded-lg shrink-0 overflow-hidden flex flex-col justify-between items-center p-1 self-start mx-auto sm:mx-0 relative">
                  <div className="w-full h-[120px] rounded overflow-hidden bg-stone-50 flex items-center justify-center border border-stone-200">
                    {selectedMember.photoUrl ? (
                      <img 
                        src={selectedMember.photoUrl} 
                        alt="Passport photo" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl text-stone-300">👤</span>
                    )}
                  </div>
                  <div className="text-[7.5px] text-center text-stone-600 font-sans font-bold uppercase leading-none tracking-widest pt-1 font-extrabold">
                    PASSPORT PHOTO
                  </div>
                </div>

              </div>

              {/* Questions Answer Segment */}
              <div className="space-y-3.5 pt-4 text-xs text-stone-800">
                <div className="bg-[#0f4d24]/10 text-[#0f4d24] text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border-l-4 border-[#0f4d24]">3. संगठनात्मक पृष्ठभूमि उत्तर (Organizational Disclosures)</div>
                
                <div className="space-y-3 bg-stone-100/50 p-3 rounded-xl border border-stone-200/50">
                  <div>
                    <p className="font-extrabold text-[#235832]">प्रश्न: क्या आप किसी राजनीतिक पार्टी या संगठन से जुड़े हुए हैं?</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold underline text-stone-900">{selectedMember.politicalAffiliation === "yes" ? "हाँ (Yes)" : "नहीं (No)"}</span>
                      {selectedMember.politicalAffiliation === "yes" && selectedMember.politicalDetails && (
                        <span className="text-stone-600 bg-white border px-2 py-0.5 rounded text-[11px] block mt-1">विवरण: {selectedMember.politicalDetails}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-extrabold text-[#235832]">प्रश्न: क्या आपके ऊपर कोई आपराधिक मामला दर्ज है?</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold underline text-stone-900">{selectedMember.criminalRecord === "yes" ? "हाँ (Yes)" : "नहीं (No)"}</span>
                      {selectedMember.criminalRecord === "yes" && selectedMember.criminalDetails && (
                        <span className="text-stone-600 bg-white border px-2 py-0.5 rounded text-[11px] block mt-1">विवरण: {selectedMember.criminalDetails}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-extrabold text-[#235832]">प्रश्न: क्या आप संगठन के नियमों का पालन करेंगे?</p>
                    <p className="font-bold text-stone-900 mt-1">✓ हाँ, मैं पूर्णतः संगठन के नियमों और मर्यादा का पालन करूँगा। (Mandatory Rule Adherence)</p>
                  </div>
                </div>
              </div>

              {/* Contribution details */}
                <div className="bg-[#0f4d24]/10 text-[#0f4d24] text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border-l-4 border-[#0f4d24]">4. सहयोग का प्रकार (Preferred Modes of Assistance)</div>
                <div className="p-3 bg-white border rounded-xl flex flex-wrap gap-2">
                  {selectedMember.helpModes && selectedMember.helpModes.length > 0 ? (
                    selectedMember.helpModes.map((mode, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded text-xs font-extrabold">{mode}</span>
                    ))
                  ) : (
                    <span className="text-stone-500 italic">संगठनात्मक कार्यों में सहयोग</span>
                  )}
                </div>

                {/* Additional contribution notes if any */}
                {selectedMember.helpDetails && (
                  <div>
                    <span className="text-stone-400 block text-[10px]">सहयोग का विस्तृत विवरण (Additional Details)</span>
                    <p className="p-2.5 bg-stone-50 border rounded-lg text-stone-700 italic">{selectedMember.helpDetails}</p>
                  </div>
                )}

                {/* Signature and Endorsement segment */}
                <div className="bg-[#0f4d24]/10 text-[#0f4d24] text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border-l-4 border-[#0f4d24]">5. घोषणा एवं डिजिटल हस्ताक्षर (Declaration & Verification)</div>
                
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] sm:text-xs leading-relaxed text-stone-600 italic">
                  "मैं एतद्द्वारा घोषित करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरी सर्वोत्तम जानकारी के अनुसार सत्य और सही है। मैं पश्चिमांचल विकास परिषद द्वारा निर्धारित दिशा-निर्देशों, उद्देश्यों और संविधान के अनुरूप कार्य एवं समाज सेवा करने की प्रतिज्ञा लेता/लेती हूँ।"
                </div>

                {/* Hand Signature box */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-6 pt-3">
                  <div className="space-y-1">
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">REGISTRATION DATE</span>
                    <strong className="text-stone-750 font-sans font-black">{selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString("hi-IN", {year: 'numeric', month: 'long', day: 'numeric'}) : "N/A"}</strong>
                  </div>

                  <div className="text-center sm:text-right border-t border-[#0f4d24]/30 pt-2 min-w-[200px]">
                    {/* Signed Text display with neat handwritten font style constraint */}
                    <p className="font-serif italic text-[#0f4d24] font-black text-lg text-center tracking-wider font-hindi select-none">
                      {selectedMember.digitalSignature || selectedMember.fullName}
                    </p>
                    <p className="font-sans text-[8px] uppercase tracking-widest text-[#0f4d24] text-center font-bold mt-1">✓ DIGITALLY SIGNED SECURE</p>
                    <div className="text-[10px] text-stone-500 text-center mt-1 border-t border-dashed border-stone-250 pt-1">
                      सदस्य के डिजिटल हस्ताक्षर / पुष्टि नाम
                    </div>
                  </div>
                </div>

            {/* Modal Approve / Reject / Close buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-100 print:hidden justify-between items-center bg-stone-50 p-4 rounded-2xl">
              <span className="text-stone-500 text-xs font-semibold">
                आंदोलनकारी आवेदन स्थिति: &nbsp;
                {selectedMember.status === "सक्रिय (Approved)" ? (
                  <span className="bg-emerald-100 text-emerald-800 border-emerald-250 border px-2 py-0.5 rounded font-black text-[11px]">सक्रिय (Approved)</span>
                ) : selectedMember.status === "अस्वीकृत (Rejected)" ? (
                  <span className="bg-red-50 text-red-700 border-red-200 border px-2 py-0.5 rounded font-black text-[11px]">अस्वीकृत (Rejected)</span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 border-amber-200 border px-2 py-0.5 rounded font-black text-[11px] animate-pulse">लंबित (Pending)</span>
                )}
              </span>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold font-hindi cursor-pointer transition-colors"
                >
                  बंद करें (Close)
                </button>

                {selectedMember.status !== "सक्रिय (Approved)" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateVolunteerStatus(selectedMember, "सक्रिय (Approved)");
                      setSelectedMember(prev => prev ? { ...prev, status: "सक्रिय (Approved)" } : null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black font-hindi cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-200"
                  >
                    <Check className="w-4 h-4" />
                    स्वीकार करें (Approve)
                  </button>
                )}

                {selectedMember.status !== "अस्वीकृत (Rejected)" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateVolunteerStatus(selectedMember, "अस्वीकृत (Rejected)");
                      setSelectedMember(prev => prev ? { ...prev, status: "अस्वीकृत (Rejected)" } : null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black font-hindi cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-red-200"
                  >
                    <EyeOff className="w-4 h-4" />
                    अस्वीकृत करें (Reject)
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Print style block wrapper */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-admin-member-application, #printable-admin-member-application * {
            visibility: visible !important;
          }
          #printable-admin-member-application {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: 4px border-double border-[#0f4d24] !important;
            padding: 30px !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}} />

      {/* EDIT MODAL WINDOW FOR DYNAMIC ELEMENTS */}
      {editingItem && editingItemInput && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-stone-950/70 flex items-center justify-center p-4 shadow-2xl" id="visual-edit-modal">
          <div className="bg-[#f5f1e8] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-300 relative max-h-[85vh] overflow-y-auto">
            
            <button 
              type="button"
              onClick={() => {
                setEditingItem(null);
                setEditingItemInput(null);
              }}
              className="absolute top-4 right-4 text-stone-600 hover:text-stone-900 bg-stone-200/50 hover:bg-stone-200 p-2 rounded-full cursor-pointer transition-colors"
              title="बंद करें"
            >
              ✕
            </button>

            <h3 className="font-hindi text-lg font-black text-[#0f4d24] border-b pb-2 mb-6 uppercase">
              संशोधित करें (Edit {editingItem.type.replace("_", " ")})
            </h3>

            <form onSubmit={handleSaveEditedItem} className="space-y-4 font-hindi text-xs sm:text-sm">

              {editingItem.type === "campaign" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">अभियान शीर्षक (हिन्दी) *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.titleHindi || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, titleHindi: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">Campaign Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.titleEnglish || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, titleEnglish: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">विस्तृत विवरण (Description) *</label>
                    <textarea
                      rows={4}
                      required
                      value={editingItemInput.description || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, description: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none resize-none"
                    />
                  </div>

                  <ImageUploader
                    label="अभियान आवरण चित्र (Campaign Banner Image)"
                    value={editingItemInput.imageUrl || ""}
                    onChange={(base64) => setEditingItemInput({ ...editingItemInput, imageUrl: base64 })}
                  />
                </>
              )}

              {/* NEWS FIELDS EDIT */}
              {editingItem.type === "news" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">समाचार का शीर्षक *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.title || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, title: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">समाचार श्रेणी *</label>
                    <select
                      value={editingItemInput.category || "जल अभियान"}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, category: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none"
                    >
                      <option value="जल अभियान">जल अभियान</option>
                      <option value="प्राकृतिक खेती">प्राकृतिक खेती</option>
                      <option value="सांस्कृतिक विधा">सांस्कृतिक विधा</option>
                      <option value="सैनिक संकल्प">सैनिक संकल्प</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">संक्षिप्त सारांश *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.summary || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, summary: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">विस्तृत समाचार सामग्री (Full Content) *</label>
                    <textarea
                      rows={5}
                      required
                      value={editingItemInput.content || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, content: e.target.value })}
                      className="px-3 py-2 bg-white border rounded-xl outline-none resize-none"
                    />
                  </div>

                  <ImageUploader
                    label="समाचार चित्र/पेपर कटिंग (News Image clipping)"
                    value={editingItemInput.imageUrl || ""}
                    onChange={(base64) => setEditingItemInput({ ...editingItemInput, imageUrl: base64 })}
                  />
                </>
              )}

              {/* GALLERY FIELDS EDIT */}
              {editingItem.type === "gallery" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 col-stone-700">गैलरी चित्र शीर्षक (Title) *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.title || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, title: e.target.value })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 text-stone-700">गैलरी चित्र श्रेणी (Category) *</label>
                    <select
                      value={editingItemInput.category || "Jal Panchayat"}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, category: e.target.value })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none text-stone-800"
                    >
                      <option value="Hindon Bachao Movement">Hindon Bachao Movement</option>
                      <option value="Environmental Campaigns">Environmental Campaigns</option>
                      <option value="Jal Panchayat">Jal Panchayat</option>
                      <option value="Public Meetings">Public Meetings</option>
                      <option value="Ground Activities">Ground Activities</option>
                    </select>
                  </div>

                  <ImageUploader
                    label="गैलरी चित्र (Gallery Photo)"
                    value={editingItemInput.url || ""}
                    onChange={(base64) => setEditingItemInput({ ...editingItemInput, url: base64 })}
                  />
                </>
              )}

              {/* GUIDES FIELDS EDIT */}
              {editingItem.type === "guides" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">संरक्षक/मार्गदर्शक का नाम (Name) *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.name || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, name: e.target.value })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1">पद / दायित्व (Designation) *</label>
                    <input
                      type="text"
                      required
                      value={editingItemInput.designation || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, designation: e.target.value })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 col-stone-700 font-hindi">संक्षिप्त परिचय (Introduction) *</label>
                    <textarea
                      rows={4}
                      required
                      value={editingItemInput.description || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, description: e.target.value })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none resize-none focus:ring-1 focus:ring-[#0f4d24]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1 text-stone-700 font-hindi">प्रदर्शन क्रम (Display Order) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingItemInput.displayOrder || 1}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, displayOrder: Number(e.target.value) || 1 })}
                      className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <ImageUploader
                      label="फोटो संशोधित करें (Upload Portrait Photo) *"
                      value={editingItemInput.imageUrl || ""}
                      onChange={(base64) => setEditingItemInput({ ...editingItemInput, imageUrl: base64 })}
                    />
                    <div className="text-[10px] text-stone-500 mt-1">अथवा फ़ोटो का URL / पाथ सीधे पेस्ट कर सकते हैं:</div>
                    <input
                      type="text"
                      placeholder="/src/assets/images/... या base64"
                      value={editingItemInput.imageUrl || ""}
                      onChange={(e) => setEditingItemInput({ ...editingItemInput, imageUrl: e.target.value })}
                      className="px-3 py-2 mt-1 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0f4d24]"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setEditingItemInput(null);
                  }}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer text-stone-600"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-[#0f4d24] text-[#efe7d6] rounded-xl text-xs font-bold hover:bg-[#155e2d] cursor-pointer"
                >
                  संशोधन सहेजें (Save Changes)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL FOR DELETION */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-stone-950/80 flex items-center justify-center p-4 animate-fade-in" id="delete-confirm-modal" onClick={() => setDeleteConfirmItem(null)}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 relative shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            
            <button 
              type="button"
              onClick={() => setDeleteConfirmItem(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-2 rounded-full cursor-pointer transition-colors"
              title="बंद करें"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="bg-red-50 p-2 rounded-2xl border border-red-100 text-red-650 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-hindi text-base sm:text-lg font-black text-red-700 leading-tight">
                हटाने की पुष्टि करें (Confirm Delete)
              </h3>
            </div>

            <div className="font-hindi text-xs sm:text-sm text-stone-700 space-y-3.5 pt-1">
              <p className="font-semibold leading-relaxed">
                क्या आप निम्नलिखित <strong className="text-stone-900 underline decoration-red-400">{deleteConfirmItem.type}</strong> को स्थायी रूप से हटाना चाहते हैं?
              </p>
              
              <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100/60 font-medium">
                <span className="text-[10px] uppercase font-sans text-stone-400 block font-bold tracking-wider">मद का विवरण (Item Title)</span>
                <span className="text-stone-900 text-xs sm:text-sm font-black tracking-wide leading-relaxed block mt-1">
                  {deleteConfirmItem.displayTitle}
                </span>
                <span className="text-[10px] font-sans text-stone-400 block mt-2">ID: {deleteConfirmItem.id}</span>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-amber-800 text-[11px] leading-relaxed font-bold flex gap-2">
                <span className="text-base select-none">🚨</span>
                <p>चेतावनी: यह क्रिया अपरिवर्तनीय है। एक बार हटाए जाने के बाद इस डेटा को वापस नहीं लाया जा सकता है!</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-750 rounded-xl text-xs font-bold transition-all cursor-pointer font-hindi"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={executeDeleteItem}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-200/50 cursor-pointer font-hindi font-black"
                id="confirm-delete-button"
              >
                <Trash2 className="w-4 h-4" />
                हाँ, मिटाएं (Delete)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

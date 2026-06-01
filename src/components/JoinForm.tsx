import React, { useState, useEffect, useRef } from "react";
import { 
  User, Phone, Mail, FileText, CheckCircle, ShieldCheck, Download, 
  Award, Camera, Calendar, Briefcase, MapPin, AlertCircle, Check, IdCard, Printer 
} from "lucide-react";
import { dbInstance, Volunteer } from "../lib/db.ts";
import { generatePvpMembershipPDF } from "../lib/pdfGenerator";

export default function JoinForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    fathersName: "",
    dob: "",
    occupation: "",
    city: "",
    block: "",
    district: "",
    phone: "",
    email: "",
    photoUrl: "", // Passport Size Photo base64
    isPoliticallyAffiliated: false,
    politicalDetails: "",
    hasCriminalRecord: false,
    criminalDetails: "",
    willAbideRules: true, // Mandatory
    helpModes: [] as string[], // तन, मन, धन, सोशल मीडिया, जन-जागरण, स्वयंसेवा
    digitalSignature: "",
    nameConfirmation: "",
    declarationChecked: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<Volunteer | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fill from stored user if available
    const stored = localStorage.getItem("pvp_current_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          phone: user.phone || "",
          email: user.email || ""
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleHelpModeToggle = (mode: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.helpModes.includes(mode);
      if (alreadySelected) {
        return {
          ...prev,
          helpModes: prev.helpModes.filter((m) => m !== mode)
        };
      } else {
        return {
          ...prev,
          helpModes: [...prev.helpModes, mode]
        };
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("केवल JPG, JPEG, PNG और WEBP प्रारूप ही समर्थित हैं।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("फ़ाइल का आकार 5MB से कम होना चाहिए।");
      return;
    }

    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const scale = MAX_WIDTH / img.width;
        
        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setFormData((prev) => ({ ...prev, photoUrl: compressed }));
        } else {
          setFormData((prev) => ({ ...prev, photoUrl: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setSubmitError(null);
    setPhotoError("");

    const errors: string[] = [];

    if (!formData.fullName.trim()) {
      errors.push("पूरा नाम भरना अनिवार्य है। (Full Name is required)");
    }
    if (!formData.fathersName.trim()) {
      errors.push("पिता/पति का नाम अनिवार्य है। (Father's Name is required)");
    }
    if (!formData.dob.trim()) {
      errors.push("जन्म तिथि दर्ज करना अनिवार्य है। (Date of Birth is required)");
    }
    if (!formData.occupation.trim()) {
      errors.push("व्यवसाय/पेशा भरना अनिवार्य है। (Occupation is required)");
    }
    if (!formData.city.trim()) {
      errors.push("गाँव / शहर का नाम अनिवार्य है। (Village/City is required)");
    }
    if (!formData.block.trim()) {
      errors.push("विकास खंड / ब्लॉक भरना अनिवार्य है। (Block is required)");
    }
    if (!formData.district) {
      errors.push("जिला चुनना अनिवार्य है। (District selection is required)");
    }
    if (!formData.phone.trim()) {
      errors.push("मोबाइल नंबर भरना अनिवार्य है। (Mobile number is required)");
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errors.push("कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें। (Please enter a valid 10-digit mobile number)");
    }

    if (!formData.photoUrl) {
      setPhotoError("पासपोर्ट साइज फोटो अपलोड करना अनिवार्य है।");
      errors.push("पासपोर्ट साइज फोटो अपलोड करना अनिवार्य है। (Passport size photo is required)");
    }

    if (!formData.declarationChecked) {
      errors.push("कृपया घोषणा पत्र स्वीकार करें। (Please accept the declaration)");
    }

    if (formData.fullName.trim().toLowerCase() !== formData.nameConfirmation.trim().toLowerCase()) {
      errors.push("पुष्टिकरण नाम आपके द्वारा भरे गए पूरे नाम से मेल खाना चाहिए। (Confirmation name must match your full name)");
    }

    if (!formData.willAbideRules) {
      errors.push("संगठन के नियमों का पालन करने की सहमति अनिवार्य है। (Agreement to abide by organizational rules is required)");
    }

    if (!formData.digitalSignature.trim()) {
      errors.push("डिजिटल हस्ताक्षर (Digital Signature) अनिवार्य है। (Digital signature is required)");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      const element = document.getElementById("validation-errors-anchor");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare membership data
      const memberData: Omit<Volunteer, "id" | "createdAt"> & { status?: string } = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        fathersName: formData.fathersName,
        dob: formData.dob,
        occupation: formData.occupation,
        block: formData.block,
        district: formData.district,
        photoUrl: formData.photoUrl,
        isPoliticallyAffiliated: formData.isPoliticallyAffiliated,
        politicalDetails: formData.isPoliticallyAffiliated ? formData.politicalDetails : "",
        hasCriminalRecord: formData.hasCriminalRecord,
        criminalDetails: formData.hasCriminalRecord ? formData.criminalDetails : "",
        willAbideRules: formData.willAbideRules,
        helpModes: formData.helpModes,
        digitalSignature: formData.digitalSignature,
        nameConfirmation: formData.nameConfirmation,
        status: "लंबित (Pending)"
      };

      const result = await dbInstance.addVolunteer(memberData);
      setRegistrationResult(result);
      setIsSubmitted(true);

      // Link membership registration to logged-in user profile
      const storedUser = localStorage.getItem("pvp_current_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.uid) {
            await dbInstance.updateUserProfile(parsedUser.uid, {
              volunteerId: result.id
            } as any);
            parsedUser.volunteerId = result.id;
            localStorage.setItem("pvp_current_user", JSON.stringify(parsedUser));
            
            // Trigger global storage update event
            window.dispatchEvent(new Event("storage"));
          }
        } catch (err) {
          console.error("Failed to link volunteer registration to profile:", err);
        }
      }

      // Scroll to success screen
      setTimeout(() => {
        document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (err: any) {
      console.error("Error submitting volunteer registration:", err);
      setSubmitError(err.message || "पंजीकरण के दौरान नेटवर्क या सर्वर से जुड़ने में कोई त्रुटि हुई।");
      const element = document.getElementById("validation-errors-anchor");
      element?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!registrationResult) return;
    setIsDownloadingPdf(true);
    const success = await generatePvpMembershipPDF(registrationResult);
    setIsDownloadingPdf(false);
    if (!success) {
      alert("PDF डाउनलोड करने में समस्या आई। कृपया फिर से प्रयास करें या प्रिंट का विकल्प चुनें।");
    }
  };

  const districts = [
    "मेरठ (Meerut)",
    "बागपत (Baghpat)",
    "शामली (Shamli)",
    "सहारनपुर (Saharanpur)",
    "मुजफ्फरनगर (Muzaffarnagar)",
    "गाजियाबाद (Ghaziabad)",
    "हापुड़ (Hapur)",
    "गौतम बुद्ध नगर (Noida/GB Nagar)",
    "बुलंदशहर (Bulandshahr)",
    "बिजनौर (Bijnor)"
  ];

  const helperOptions = [
    { id: "तन", label: "तन (Physical Volunteering)" },
    { id: "मन", label: "मन (Mental/Strategic Support)" },
    { id: "धन", label: "धन (Financial Membership Contribution)" },
    { id: "सोशल मीडिया", label: "सोशल मीडिया (Digital Campaigning)" },
    { id: "जन-जागरण", label: "जन-जागरण (Public Awareness Camps)" },
    { id: "स्वयंसेवा", label: "स्वयंसेवा (On-field Social Services)" }
  ];

  return (
    <section
      id="join"
      className="py-12 sm:py-20 bg-[#efe7d6]/30 relative scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 print:hidden">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg select-none">
            🚩 राष्ट्र-सेवा का महापर्व 🚩
          </div>
          <h2 className="font-hindi text-2xl sm:text-4xl font-black text-stone-900 mt-2">
            आंदोलन सदस्यता / पंजीकरण फॉर्म
          </h2>
          <p className="text-stone-600 mt-3 text-xs sm:text-sm font-medium leading-relaxed">
            पश्चिमांचल विकास परिषद के राष्ट्रीय अभियान 'गंगा-यमुना-हिंडन जल चेतना' तथा संस्कृति रक्षा आंदोलन का हिस्सा बनें। प्रामाणिक विवरण भरकर अपनी आधिकारिक सदस्यता प्राप्त करें।
          </p>
        </div>

        {!isSubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column info helper checklist */}
            <div className="lg:col-span-4 space-y-6 print:hidden">
              <div className="bg-[#f5f1e8] p-5 rounded-2xl border border-stone-200/80 shadow-md">
                <h3 className="font-hindi text-base sm:text-lg font-black text-[#0f4d24] flex items-center gap-2 mb-3 border-b pb-2 border-stone-250">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  आंदोलनकारी सदस्यता निर्देश
                </h3>
                <ol className="font-hindi text-stone-700 text-xs sm:text-sm space-y-3.5 leading-relaxed font-semibold">
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-800 font-extrabold">१.</span>
                    <span>सभी तारांकित (*) वाले विवरणों को सावधानीपूर्वक और सही-सही भरना अनिवार्य है।</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-800 font-extrabold">२.</span>
                    <span>एक डिजिटल पासपोर्ट आकार की हालिया तस्वीर अपलोड करें (चेहरा स्पष्ट होना चाहिए)।</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-800 font-extrabold">३.</span>
                    <span>यह सदस्यता गैर-राजनीतिक एवं राष्ट्रीय चरित्र निर्माण हेतु पूर्णतः समर्पित है।</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-800 font-extrabold">४.</span>
                    <span>पंजीकरण के उपरांत प्राप्त डिजिटल 'सदस्यता कार्ड' को सुरक्षित सहेजें।</span>
                  </li>
                </ol>
              </div>

              <div className="bg-[#0f4d24] text-[#efe7d6] p-5 rounded-2xl border border-ngo-forest/30 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full blur" />
                <h4 className="font-hindi text-base font-black flex items-center gap-1.5 text-amber-300">
                  <span>💡</span> संगठन का पावन ध्येय
                </h4>
                <p className="font-hindi text-xs text-stone-200 mt-2 leading-relaxed">
                  "जल-संरक्षण, मृदा स्वास्थ्य की पुनर्स्थापना, प्राचीन कौरवी स्वाभिमान और युवा सशक्तिकरण ही हमारा संकल्प है। आपके सहयोग से ही हम अखंड समाज का सृजन करेंगे।"
                </p>
                <div className="text-[10px] text-amber-200/80 font-sans mt-3 text-right">
                  — नितिन स्वामी, राष्ट्रीय अध्यक्ष
                </div>
              </div>
            </div>

            {/* Right Column / Comprehensive Form */}
            <div className="lg:col-span-8 bg-[#f5f1e8] p-5 sm:p-8 rounded-3xl shadow-xl border border-stone-200/90 relative">
              <div className="absolute inset-1.5 border border-dashed border-ngo-forest/20 rounded-2xl pointer-events-none" />
              
              <form onSubmit={handleSubmit} className="relative space-y-6 z-10" id="membership-main-form">
                
                <div id="validation-errors-anchor" />

                {/* Validation and Submission Errors Display */}
                {(validationErrors.length > 0 || submitError) && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-2 animate-pulse" id="join-errors">
                    <div className="flex items-center gap-2 text-red-800 font-hindi font-bold">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>पंजीकरण त्रुटि / Information Required:</span>
                    </div>
                    {submitError && (
                      <p className="text-stone-850 font-mono text-xs bg-red-100/50 p-2.5 rounded-xl border border-red-200 leading-normal">
                        <strong>Database Error:</strong> {submitError}
                      </p>
                    )}
                    {validationErrors.length > 0 && (
                      <ul className="list-disc list-inside text-red-700 font-hindi text-xs sm:text-sm space-y-1 pl-2">
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* 1. PERSONAL DETAILS BLOCK */}
                <div>
                  <h3 className="font-hindi text-sm sm:text-base font-black text-amber-950 uppercase tracking-wider border-l-3 border-amber-600 pl-2 mb-4">
                    १. व्यक्तिगत विवरण (Personal Details)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        सदस्य का पूरा नाम (Full Name) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          name="fullName"
                          placeholder="जैसे: सुमित सिंह तोमर"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        पिता/पति का नाम (Father's Name) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          name="fathersName"
                          placeholder="जैसे: श्री रामपाल सिंह"
                          value={formData.fathersName}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        जन्म तिथि (Date of Birth) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="date"
                          required
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-sans text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        व्यवसाय/पेशा (Occupation) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          name="occupation"
                          placeholder="जैसे: कृषि, छात्र, शिक्षक, व्यवसाय"
                          value={formData.occupation}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        गाँव / शहर (Village / City) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          name="city"
                          placeholder="जैसे: बड़ौत"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        विकास खंड / ब्लॉक (Block) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="block"
                        placeholder="जैसे: बागपत ब्लॉक"
                        value={formData.block}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        संबद्ध जिला (District) <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                      >
                        <option value="">-- जिला चुनें --</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        मोबाइल नंबर (Mobile No.) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          name="phone"
                          placeholder="10 अंकों का नंबर"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl font-sans text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col mt-4">
                    <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                      ईमेल एड्रेस (Email Address - Optional)
                    </label>
                    <div className="relative font-sans">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none animate-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PASSPORT PHOTO DETAILS */}
                <div id="photo-section" className="border-t border-stone-250 pt-5">
                  <h3 className="font-hindi text-sm sm:text-base font-black text-amber-950 uppercase tracking-wider border-l-3 border-amber-600 pl-2 mb-3">
                    २. पासपोर्ट आकार फोटो (Passport Size Photo) *
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8">
                      <p className="font-hindi text-xs text-stone-600 leading-relaxed mb-3">
                        सदस्यता पहचान पत्र (Membership ID-Card) पर प्रकाशन हेतु एक स्पष्ट वर्गकार (Square) पासपोर्ट फोटो अपलोड करें। (समर्थित: JPG, PNG, WEBP. अधिकतम 2MB)
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-[#0f4d24] text-white rounded-xl text-xs sm:text-sm font-bold font-hindi cursor-pointer hover:bg-ngo-forest transition-colors flex items-center gap-1">
                          <Camera className="w-4 h-4" />
                          फ़ोटो चुनें (Select Image)
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-xs sm:text-sm font-bold rounded-xl transition-all"
                          >
                            हटाएं (Remove)
                          </button>
                        )}
                      </div>
                      {photoError && <p className="text-red-600 text-xs mt-1.5 font-bold">{photoError}</p>}
                    </div>

                    <div className="sm:col-span-4 flex justify-center">
                      <div className="w-24 h-32 border-2 border-dashed border-stone-350 bg-stone-100 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-inner relative">
                        {formData.photoUrl ? (
                          <img
                            src={formData.photoUrl}
                            alt="Passport Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <span className="text-2xl text-stone-400 block mb-1">👤</span>
                            <span className="text-[9px] font-hindi text-stone-500 font-extrabold leading-none block">पासपोर्ट फोटो</span>
                            <span className="text-[8px] font-sans text-stone-400 block mt-0.5">3.5 x 4.5 cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. ORGANIZATIONAL QUESTIONS BLOCK */}
                <div className="border-t border-stone-250 pt-5">
                  <h3 className="font-hindi text-sm sm:text-base font-black text-amber-950 uppercase tracking-wider border-l-3 border-amber-600 pl-2 mb-4">
                    ३. सांगठनिक घोषणा व अभिविन्यास (Organizational Evaluation)
                  </h3>

                  <div className="space-y-4">
                    {/* Political party question */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200">
                      <span className="font-hindi text-xs sm:text-sm font-bold text-stone-800 leading-normal block mb-2">
                        • क्या आप वर्तमान में किसी राजनीतिक पार्टी, दल अथवा अन्य किसी संगठन से सक्रिय रूप से जुड़े हुए हैं?
                      </span>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.isPoliticallyAffiliated === true}
                            onChange={() => setFormData((prev) => ({ ...prev, isPoliticallyAffiliated: true }))}
                            className="accent-ngo-forest"
                          />
                          हाँ (Yes)
                        </label>
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.isPoliticallyAffiliated === false}
                            onChange={() => setFormData((prev) => ({ ...prev, isPoliticallyAffiliated: false, politicalDetails: "" }))}
                            className="accent-ngo-forest"
                          />
                          नहीं (No)
                        </label>
                      </div>
                      {formData.isPoliticallyAffiliated && (
                        <textarea
                          rows={2}
                          name="politicalDetails"
                          required
                          placeholder="यदि हाँ, तो राजनीतिक दल का नाम, पद तथा वर्तमान जिम्मेदारी का ब्यौरा दें..."
                          value={formData.politicalDetails}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-hindi text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-ngo-forest resize-none mt-2"
                        />
                      )}
                    </div>

                    {/* Criminal Record question */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200">
                      <span className="font-hindi text-xs sm:text-sm font-bold text-stone-800 leading-normal block mb-2">
                        • क्या आपके ऊपर स्थानीय पुलिस थाने अथवा किसी न्यायालय में कोई आपराधिक मामला दर्ज / लंबित है?
                      </span>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.hasCriminalRecord === true}
                            onChange={() => setFormData((prev) => ({ ...prev, hasCriminalRecord: true }))}
                            className="accent-ngo-forest"
                          />
                          हाँ (Yes)
                        </label>
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer">
                          <input
                            type="radio"
                            checked={formData.hasCriminalRecord === false}
                            onChange={() => setFormData((prev) => ({ ...prev, hasCriminalRecord: false, criminalDetails: "" }))}
                            className="accent-ngo-forest"
                          />
                          नहीं (No)
                        </label>
                      </div>
                      {formData.hasCriminalRecord && (
                        <textarea
                          rows={2}
                          name="criminalDetails"
                          required
                          placeholder="यदि हाँ, तो धारा संख्या, पुलिस थाना व दर्ज अभियोग के संदर्भ का विस्तृत ब्यौरा यहाँ अंकित करें..."
                          value={formData.criminalDetails}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-hindi text-xs text-stone-900 outline-none focus:bg-white focus:ring-1 focus:ring-ngo-forest resize-none mt-2"
                        />
                      )}
                    </div>

                    {/* Code of action rule abiding - MANDATORY Check */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200">
                      <span className="font-hindi text-xs sm:text-sm font-bold text-stone-800 leading-normal block mb-2">
                        • क्या आप संगठन (पश्चिमांचल विकास परिषद) के समस्त पंचशील नियमों, नीतियों तथा अनुशासनात्मक संहिता का पूर्ण पालन करने हेतु संकल्पित हैं? <span className="text-red-500">*</span>
                      </span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer text-[#0f4d24] font-black">
                          <input
                            type="radio"
                            required
                            checked={formData.willAbideRules === true}
                            onChange={() => setFormData((prev) => ({ ...prev, willAbideRules: true }))}
                            className="accent-ngo-forest"
                          />
                          हाँ, पूर्णतः सहमत हूँ (Yes, I will obey strictly)
                        </label>
                        <label className="flex items-center gap-1.5 font-hindi text-xs cursor-pointer text-red-700">
                          <input
                            type="radio"
                            checked={formData.willAbideRules === false}
                            onChange={() => setFormData((prev) => ({ ...prev, willAbideRules: false }))}
                            className="accent-ngo-forest"
                          />
                          असहमत (Disagreed)
                        </label>
                      </div>
                    </div>

                    {/* Multiple Modes of Assistance */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200">
                      <span className="font-hindi text-xs sm:text-sm font-bold text-stone-800 leading-normal block mb-2.5">
                        • आप किस प्रकार परिषद के जनकल्याणकारी आंदोलनों में सहयोग प्रदान करना चाहते हैं? (बहुचेयनीय / Multiple Choice)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {helperOptions.map((opt) => {
                          const isSelected = formData.helpModes.includes(opt.id);
                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => handleHelpModeToggle(opt.id)}
                              className={`px-3 py-2.5 rounded-xl border font-hindi font-bold transition-all text-left text-xs ${
                                isSelected 
                                  ? "bg-amber-100/60 text-amber-950 border-amber-400 font-extrabold shadow-sm" 
                                  : "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-250"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${
                                  isSelected ? "bg-amber-600 text-white border-amber-600" : "bg-white border-stone-300"
                                }`}>
                                  {isSelected && "✓"}
                                </span>
                                <span>{opt.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. JOINING VALUES (AUTO) & SIGNATURE */}
                <div className="border-t border-stone-250 pt-5">
                  <h3 className="font-hindi text-sm sm:text-base font-black text-amber-950 uppercase tracking-wider border-l-3 border-amber-600 pl-2 mb-4">
                    ४. हस्ताक्षर व संपुष्टि (Signature & Dynamic Authenticity)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-800 mb-1">
                        सदस्यता ग्रहण की तिथि
                      </label>
                      <input
                        type="text"
                        disabled
                        value={new Date().toLocaleDateString("hi-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                        className="w-full px-3 py-2 bg-stone-200 border border-stone-350 rounded-xl font-hindi text-xs sm:text-sm text-stone-700 outline-none font-bold"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        डिजिटल हस्ताक्षर (Digital Signature) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="digitalSignature"
                        placeholder="जैसे: सुमित तोमर"
                        value={formData.digitalSignature}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none font-black italic tracking-wide"
                      />
                      <span className="text-[10px] text-stone-500 font-hindi mt-1">उपनाम सहित अपना नाम पूरा हिन्दी/अंग्रेजी अक्षरों में लिखें।</span>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-hindi text-xs sm:text-sm font-bold text-stone-850 mb-1">
                        नाम की दोबारा संपुष्टि (Name Confirm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="nameConfirmation"
                        placeholder="नाम दोबारा लिखें"
                        value={formData.nameConfirmation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-hindi text-xs sm:text-sm text-stone-900 focus:ring-1 focus:ring-ngo-forest outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. LEGIT DECLARATION MANDATORY CHECKBOX */}
                <div className="p-4 bg-yellow-50 border border-yellow-250 rounded-2xl mt-4">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      required
                      id="declarationChecked"
                      name="declarationChecked"
                      checked={formData.declarationChecked}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded text-amber-700 focus:ring-amber-500 bg-white border-stone-300 cursor-pointer"
                    />
                    <label htmlFor="declarationChecked" className="font-hindi text-xs sm:text-xs text-stone-800 leading-relaxed font-bold select-none cursor-pointer">
                      "मैं घोषणा करता/करती हूँ कि मेरे द्वारा दी गई जानकारी मेरी जानकारी के अनुसार सही है। मैं संगठन की गरिमा, नियम एवं अनुशासन का पालन करूंगा/करूंगी तथा किसी भी गैरकानूनी गतिविधि में शामिल नहीं हूँ।" <span className="text-red-500 font-extrabold">*</span>
                    </label>
                  </div>
                </div>

                {/* BUTTONS EXEC */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-2xl font-hindi text-base sm:text-lg font-black shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] ${
                      isSubmitting 
                        ? "bg-stone-400 text-stone-700 cursor-not-allowed opacity-75" 
                        : "bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] cursor-pointer"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-stone-600 border-t-white shrink-0" />
                        पंजीकरण प्रक्रिया जारी है... (Registering...)
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        आधिकारिक सदस्यता ग्रहण करें और पहचान पत्र बनाएं
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        ) : (
          /* REGISTRATION SUCCESS WITH MEMBERSHIP ID, CERTIFICATE & CARD */
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            {/* SUCCESS BANNER */}
            <div className="text-center w-full mb-8 bg-emerald-600/10 border border-emerald-250 rounded-2xl p-4 sm:p-6 print:hidden">
              <CheckCircle className="w-12 h-12 text-emerald-700 mx-auto animate-bounce mb-2" />
              <h3 className="font-hindi text-xl sm:text-2xl font-black text-emerald-800">
                सदस्यता पंजीकरण पूर्ण! बधाई हो आप पर्यावरण प्रहरी बन गए हैं।
              </h3>
              <p className="font-hindi text-xs sm:text-sm text-stone-650 mt-1.5 font-extrabold max-w-2xl mx-auto">
                पश्चिम उत्तर प्रदेश की नवचेतना हेतु पश्चिमांचल विकास परिषद आपका अभिनन्दन करती है। नीचे आपका प्रामाणिक सदस्यता पहचान पत्र व सेवा प्रमाण-पत्र दर्शित है।
              </p>
            </div>

            <div className="w-full space-y-12 shrink-0">
              
              {/* CARD PREVIEW CONTAINER */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md print:border-none print:shadow-none print:p-0">
                <h4 className="font-hindi text-base text-stone-800 font-black mb-4 print:hidden text-center flex items-center justify-center gap-2">
                  <IdCard className="w-5 h-5 text-amber-700" />
                  आधिकारिक डिजिटल सदस्यता पहचान पत्र (Dynamic Membership ID-Card)
                </h4>

                <div className="flex justify-center">
                  {/* REAL MEMBERSHIP CARD COMPONENT */}
                  <div
                    className="w-full max-w-[460px] h-[270px] bg-gradient-to-br from-[#fcfbf7] to-[#efe7d6] border-4 border-[#0f4d24] rounded-2xl relative overflow-hidden text-stone-900 shadow-xl border-double flex flex-col justify-between p-3.5 select-none"
                    id="identity-membership-card"
                  >
                    {/* Security Watermark logo inside */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0 scale-125 select-none text-7xl">
                      🌱
                    </div>

                    {/* Card Header Brand banner */}
                    <div className="flex items-center gap-2 border-b border-[#0f4d24]/30 pb-2 z-10">
                      <div className="w-10 h-10 shrink-0 bg-[#0f4d24] rounded-lg flex items-center justify-center text-white font-bold select-none text-lg border-2 border-amber-500">
                        🌱
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-hindi text-xs sm:text-sm font-black text-[#0f4d24] tracking-wide leading-none">
                          पश्चिमांचल विकास परिषद (भारत)
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-hindi text-amber-800 font-extrabold tracking-wider leading-none mt-1">
                          प्रकृति से संस्कृति की ओर • राष्ट्र सेवा प्रभाग
                        </span>
                      </div>
                    </div>

                    {/* Card Core Details (Portrait side & fields) */}
                    <div className="flex gap-4 items-start flex-1 my-3 z-10">
                      {/* Left Side Portrait photobox in Card */}
                      <div className="w-[85px] h-[110px] bg-white rounded-xl border border-[#0f4d24]/45 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-inner bg-stone-50">
                        {registrationResult?.photoUrl ? (
                          <img
                            src={registrationResult.photoUrl}
                            alt="avatar"
                            className="w-full h-full object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-3xl">👤</span>
                        )}
                      </div>

                      {/* Right Fields description inside Card */}
                      <div className="flex-1 space-y-1 font-hindi text-left">
                        <div>
                          <span className="text-[10px] text-stone-500 block leading-none">नाम (Member Name)</span>
                          <span className="text-xs sm:text-sm font-black text-stone-900 tracking-wide font-hindi leading-snug">{registrationResult?.fullName}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-[9px] text-stone-550 block leading-none">पिता का नाम (Father Name)</span>
                            <span className="text-[10px] font-bold text-stone-850 tracking-wide leading-tight">{registrationResult?.fathersName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-stone-550 block leading-none">संबद्ध जिला (District)</span>
                            <span className="text-[10px] font-bold text-[#155a2c] tracking-wide leading-tight">{registrationResult?.district || "N/A"}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-[9px] text-stone-550 block leading-none">सदस्यता संख्या (ID No.)</span>
                            <span className="text-[10px] font-mono font-black text-amber-900 tracking-wider block">{registrationResult?.id}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-stone-550 block leading-none">पंजीकरण तिथि (Issue Date)</span>
                            <span className="text-[10px] font-mono text-stone-800 tracking-wider block">
                              {registrationResult?.createdAt ? new Date(registrationResult.createdAt).toLocaleDateString("en-IN") : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Security band and signatures inside Card */}
                    <div className="border-t border-[#0f4d24]/20 pt-1.5 flex items-center justify-between z-10">
                      <div className="flex flex-col text-[8px] sm:text-[9px] leading-tight font-hindi text-stone-600">
                        <span className="font-extrabold text-stone-800">पद: राष्ट्र-रक्षक स्वयंसेवक श्रेणी-१</span>
                        <span className="font-sans text-[7px] text-stone-400">Verifiable offline on Admin database</span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* President signature inside Card */}
                        <div className="flex flex-col items-center leading-none">
                          <svg width="45" height="12" viewBox="0 0 100 30" className="opacity-80 scale-120">
                            <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          <span className="text-[7px] font-hindi font-black text-stone-800 whitespace-nowrap mt-1">(नितिन स्वामी - राष्ट्रीय अध्यक्ष)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* CERTIFICATE PREVIEW CONTAINER */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md print:border-none print:shadow-none print:p-0">
                <h4 className="font-hindi text-base text-stone-800 font-black mb-4 print:hidden text-center flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  आधिकारिक आन्दोलन सेवा प्रमाण पत्र (Induction Guard Honor Certificate)
                </h4>

                {/* Printable Certificate Frame */}
                <div
                  className="bg-[#faf7f0] rounded-3xl p-6 sm:p-10 border-[12px] border-ngo-dark shadow-xl relative overflow-hidden w-full max-w-2xl select-none text-stone-900 border-double mx-auto"
                  id="printable-certificate"
                >
                  
                  {/* Decorative vintage borders inside */}
                  <div className="absolute inset-2 border-2 border-amber-900/15 rounded-2xl pointer-events-none" />
                  <div className="absolute inset-4 border border-ngo-forest/20 rounded-xl pointer-events-none" />
                  
                  {/* Watermarked logo background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-10 pointer-events-none scale-150">
                    🌱
                  </div>

                  <div className="flex flex-col items-center text-center">
                    
                    <span className="text-[9px] font-sans text-stone-500 tracking-widest font-extrabold uppercase leading-none mb-1.5">
                      OFFICIAL INDUCTION CERTIFICATE
                    </span>
                    
                    <h4 className="font-hindi text-2xl sm:text-3xl font-black text-[#0f4d24] leading-none">
                      पश्चिमांचल विकास परिषद (भारत)
                    </h4>
                    <span className="font-hindi text-[10px] text-amber-800 font-extrabold bg-[#efe7d6] py-0.5 px-2.5 rounded-full border border-stone-300 mt-2">
                      "वसुधैव कुटुम्बकम् • प्रकृतिः रक्षति रक्षिता"
                    </span>

                    <div className="w-16 h-0.5 bg-stone-300 my-4" />

                    <h5 className="font-hindi text-xl sm:text-3.5xl text-amber-900 font-black tracking-wider leading-none">
                      🌻 राष्ट्र जागृति सेवा सम्मान-पत्र 🌻
                    </h5>

                    <p className="font-hindi text-stone-600 text-xs sm:text-sm mt-5 leading-none font-medium">
                      ससम्मान प्रमाणित किया जाता है कि राष्ट्रप्रेमी
                    </p>

                    {/* Recipient Dynamic Name */}
                    <span className="font-hindi text-xl sm:text-2.5xl font-black text-stone-900 border-b-2 border-dashed border-stone-800/50 pb-1 px-6 my-2.5 leading-none tracking-wide inline-block max-w-full truncate">
                      {registrationResult?.fullName}
                    </span>

                    <span className="font-hindi text-xs text-stone-600 italic">
                      पुत्र/पुत्री : <strong className="text-stone-800 font-bold font-hindi">{registrationResult?.fathersName || "N/A"}</strong>, निवासी : <strong className="text-stone-800 font-bold font-hindi">{registrationResult?.city || "N/A"}</strong> ({registrationResult?.district})
                    </span>

                    <div className="font-hindi text-stone-800 text-xs sm:text-sm leading-relaxed max-w-lg mt-5 font-semibold space-y-1">
                      <p>
                        ने स्वेच्छा से परिषद की सामाजिक एवं पर्यावरणीय चेतना प्रभाग में
                      </p>
                      <p className="font-hindi text-[#0f4d24] text-xs sm:text-sm font-black italic bg-[#0f4d24]/10 py-1 px-4 rounded-xl border border-[#0f4d24]/20 w-max mx-auto my-1.5">
                        सक्रिय राष्ट्र रक्षक सदस्य
                      </p>
                      <p className="text-[11px] sm:text-xs">
                        के रूप में सम्मिलित होकर प्रकृति व मानवता की रक्षा हेतु सहकारित्व का संकल्प लिया है। परिषद् आपके यशस्वी और पर्यावरण-अनुकूल भावी जीवन की मंगल कामना करती है।
                      </p>
                    </div>

                    {/* Footer values inside Certificate */}
                    <div className="grid grid-cols-3 gap-2 w-full mt-8 pt-5 border-t border-stone-300/50 items-end">
                      
                      {/* Left: Cert IDs */}
                      <div className="flex flex-col items-start font-hindi text-[9px] sm:text-xs text-left">
                        <span className="text-[#1f6b35] font-extrabold font-sans leading-none">ID: {registrationResult?.id}</span>
                        <span className="text-[#8b5a2b] font-extrabold font-sans leading-none mt-1">CERT: {registrationResult?.certificateNo}</span>
                        <span className="text-stone-500 font-normal mt-1 block">दिनांक: {registrationResult?.createdAt ? new Date(registrationResult.createdAt).toLocaleDateString("hi-IN") : ""}</span>
                      </div>

                      {/* Middle Seal Stamp */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border-4 border-dashed border-amber-800/20 flex items-center justify-center bg-amber-800/10 text-amber-800 rotate-12 relative shadow-inner">
                          <div className="text-[7px] font-sans font-black flex flex-col items-center leading-none text-center">
                            <span>🌱 SEAL</span>
                            <span className="text-[9px] mt-0.5">🌱</span>
                            <span>OFFICIAL</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Signatures */}
                      <div className="flex flex-col items-end text-right font-hindi text-[9px]">
                        <svg width="45" height="15" viewBox="0 0 100 30" className="opacity-80">
                          <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="font-hindi font-black text-stone-800 mt-1">(नितिन स्वामी)</span>
                        <span className="text-[8px] font-sans text-stone-400">President, PVP Core</span>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Print, Download, Re-register action buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 w-full print:hidden">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-8 rounded-xl font-hindi text-base font-black shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-5 h-5 text-amber-100 animate-bounce" />
                {isDownloadingPdf ? "पीडीएफ तैयार हो रहा है..." : "आधिकारिक PDF डाउनलोड करें (Download Certificate)"}
              </button>

              <button
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f4d24] hover:bg-ngo-forest text-[#efe7d6] py-3 px-8 rounded-xl font-hindi text-base font-black shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <Printer className="w-5 h-5 text-emerald-400" />
                प्रमाण-पत्र व कार्ड प्रिंट करें (Print / Save)
              </button>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    fullName: "",
                    fathersName: "",
                    dob: "",
                    occupation: "",
                    city: "",
                    block: "",
                    district: "",
                    phone: "",
                    email: "",
                    photoUrl: "",
                    isPoliticallyAffiliated: false,
                    politicalDetails: "",
                    hasCriminalRecord: false,
                    criminalDetails: "",
                    willAbideRules: true,
                    helpModes: [],
                    digitalSignature: "",
                    nameConfirmation: "",
                    declarationChecked: false
                  });
                }}
                className="bg-stone-200 hover:bg-stone-300 text-stone-850 py-3 px-6 rounded-xl font-hindi text-base font-bold shadow transition-colors cursor-pointer"
              >
                एक और नया पंजीकरण करें (Register Another Member)
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

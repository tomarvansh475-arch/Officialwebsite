import React, { useState, useEffect } from "react";
import { CreditCard, Smartphone, Check, Heart, Shield, Copy, Sparkles, QrCode, Download, Printer, Mail, History, Trash2, Award, Landmark, AlertCircle } from "lucide-react";
import { DONATION_OPTIONS } from "../data";
import { dbInstance, UserProfile, DonationRecord } from "../lib/db";

export default function DonationSection() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(501);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Checkout & Receipt States
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<DonationRecord | null>(null);
  const [historyList, setHistoryList] = useState<DonationRecord[]>([]);
  const [emailStatus, setEmailStatus] = useState(false);
  
  // Custom states for site settings
  const [siteContent, setSiteContent] = useState<any>(null);

  // Load Donation Records on startup and update info
  useEffect(() => {
    try {
      const stored = dbInstance.getDonations();
      setHistoryList(stored);

      // Load Site Settings
      setSiteContent(dbInstance.getSiteContent());

      // Prefill user details if logged in
      const activeUserStr = localStorage.getItem("pvp_current_user");
      if (activeUserStr) {
        const user: UserProfile = JSON.parse(activeUserStr);
        setDonorName(user.fullName);
        setDonorEmail(user.email);
        setDonorPhone(user.phone || "");
      }
    } catch (e) {
      console.error("Failed to load historical donations", e);
    }
  }, [showCheckout]);

  const getActiveAmount = () => {
    if (selectedPreset === null) return Number(customAmount) || 0;
    return selectedPreset;
  };

  const getUpiId = () => {
    return siteContent?.donationUpiId || "pvpngo@sbi";
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(getUpiId());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePayViaUpiApp = () => {
    const amount = getActiveAmount();
    if (amount <= 0) {
      alert("कृपया भुगतान करने के लिए पहले दान राशि चुनें या दर्ज करें! (Please enter a valid amount first!)");
      return;
    }
    const upiId = getUpiId();

    // Generate valid UPI deep link according to user instruction:
    // upi://pay?pa={UPI_ID}&pn=Paschimanchal Vikas Parishad&am={AMOUNT}&cu=INR
    const deepLink = `upi://pay?pa=${upiId}&pn=Paschimanchal%20Vikas%20Parishad&am=${amount}&cu=INR`;

    // Try to detect if the deep link succeeded in opening any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)
    // Standard approach: Listen if browser window loses focus when launching external URL scheme
    let appIsInstalled = false;
    const checkAppOpen = () => {
      appIsInstalled = true;
    };
    window.addEventListener("blur", checkAppOpen);

    // Immediately trigger real UPI deep-link redirect
    window.location.href = deepLink;

    // Direct launch fallback via dynamic anchor
    try {
      const link = document.createElement("a");
      link.href = deepLink;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Alternative anchor launch failed", e);
    }

    // After 1.5 seconds, check if the browser successfully suspended/blurred
    setTimeout(() => {
      window.removeEventListener("blur", checkAppOpen);
      if (!appIsInstalled) {
        alert("त्रुटि: आपके डिवाइस पर कोई संगत यूपीआई (UPI) ऐप (जैसे Google Pay, PhonePe, Paytm, BHIM) स्थापित नहीं है, या आपके ब्राउज़र द्वारा डायरेक्ट लिंकिंग अवरुद्ध की गई है।\n\nकृपया सुनिश्चित करें कि एक संगत मोबाइल पेमेंट ऐप सक्रिय है, या सुगमता के लिए नीचे दिए गए 'UPI क्यूआर व बैंक विवरण' बटन पर क्लिक करके सीधे स्कैन या बैंक ट्रांसफर करें।\n\n(Error: No active UPI payment app found on this device. Please verify that a UPI app is installed, or tap the QR Code button below to view bank transfer credentials.)");
      } else {
        // Fast receipt guidance fallback modal for successful app handoffs
        setTimeout(() => {
          if (window.confirm("क्या आपने यूपीआई ऐप के माध्यम से दान भुगतान पूरा कर लिया है? 80G आयकर छूट रसीद व प्रमाण-पत्र तुरंत प्राप्त करने के लिए यहाँ क्लिक करें! (Did you complete the payment? Click OK to fill details and instantly claim your 80G tax benefit certificate!)")) {
            setShowCheckout(true);
          }
        }, 1500);
      }
    }, 1500);
  };

  const startCheckout = () => {
    const finalAmount = getActiveAmount();
    if (finalAmount <= 0) {
      alert("कृपया एक मान्य राशि दर्ज या चयन करें!");
      return;
    }
    setShowCheckout(true);
    setGeneratedReceipt(null);
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getActiveAmount();
    if (!donorName.trim() || !donorEmail.trim()) {
      alert("कृपया नाम और ईमेल ठीक से दर्ज करें!");
      return;
    }

    // Generate unique ID and ref number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const receiptId = `PVP/2026/80G/${randomNum}`;
    const today = new Date().toLocaleDateString("hi-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Check logged in user
    let loggedInUid = undefined;
    const activeUserStr = localStorage.getItem("pvp_current_user");
    if (activeUserStr) {
      try {
        const user: UserProfile = JSON.parse(activeUserStr);
        loggedInUid = user.uid;
      } catch (e) {
        console.error(e);
      }
    }

    const receipt: DonationRecord = {
      receiptId,
      donorName,
      donorEmail,
      donorPhone: donorPhone || "N/A",
      pan: panNumber.toUpperCase() || "N/A",
      amount: finalAmount,
      date: today,
      status: "लंबित (Pending Verification)",
      userId: loggedInUid
    };

    // Save donation to central database, which updates user records too
    dbInstance.addDonation(receipt);

    // Sync state
    const allDons = dbInstance.getDonations();
    setHistoryList(allDons);

    setGeneratedReceipt(receipt);
    setShowCheckout(false);
    setEmailStatus(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!generatedReceipt) return;
    const { receiptId, donorName, donorEmail, donorPhone, pan, amount, date } = generatedReceipt;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>आयकर छूट दान रसीद - पश्चिमांचल विकास परिषद</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #f5f1e8;
      color: #1c1917;
      margin: 0;
      padding: 40px;
    }
    .certificate {
      border: 8px double #1b5025;
      padding: 40px;
      max-width: 700px;
      margin: 20px auto;
      background-color: #ffffff;
      position: relative;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #e7e5e4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 36px;
      margin-bottom: 8px;
    }
    .title-main {
      font-size: 26px;
      font-weight: 900;
      color: #0f4d24;
      margin: 0;
    }
    .title-sub {
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #78716c;
      margin: 5px 0 15px 0;
    }
    .cert-badge {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      display: inline-block;
      font-weight: 700;
    }
    .body-content {
      line-height: 1.8;
      font-size: 15px;
      margin-bottom: 40px;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }
    .grid-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #f5f5f4;
    }
    .grid-table td.label {
      color: #78716c;
      font-weight: 600;
    }
    .grid-table td.value {
      font-weight: 700;
      text-align: right;
    }
    .amount-box {
      background-color: #fdfcf7;
      border: 1px solid #efe7d6;
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
    }
    .amount-value {
      font-size: 26px;
      font-weight: 950;
      color: #0f4d24;
    }
    .footer-signs {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-text {
      font-size: 12px;
      color: #78716c;
      font-style: italic;
    }
    .sign-block {
      text-align: right;
    }
    .signature {
      font-size: 20px;
      font-weight: 700;
      font-family: cursive;
      color: #0f4d24;
      margin-bottom: 5px;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      font-size: 80px;
      opacity: 0.04;
      color: #0f4d24;
      font-weight: 900;
      pointer-events: none;
    }
    @media print {
      body { padding: 0; background: none; }
      .certificate { border: 6px double #1b5025; box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">PVP BHARAT</div>
    <div class="header">
      <div class="logo">🌱</div>
      <h1 class="title-main">पश्चिमांचल विकास परिषद (भारत)</h1>
      <div class="title-sub">Paschimanchal Vikas Parishad (PVP) • West UP</div>
      <div class="cert-badge">80G आयकर दान प्रमाण-पत्र (DONATION RECEIPT)</div>
    </div>
    
    <div class="body-content">
      <p>सहर्ष प्रमाणित किया जाता है कि पर्यावरण संरक्षण, तालाब संवर्धन एवं सांस्कृतिक संवर्धन जन-अभियान हेतु निम्नलिखित दान राशि सफलतापूर्वक प्राप्त हुई है:</p>
      
      <table class="grid-table">
        <tr>
          <td class="label">रसीद संख्या (Receipt Ref):</td>
          <td class="value" style="font-family: monospace;">${receiptId}</td>
        </tr>
        <tr>
          <td class="label">दाता का नाम (Donor Name):</td>
          <td class="value">${donorName}</td>
        </tr>
        <tr>
          <td class="label">ईमेल पता (Email):</td>
          <td class="value">${donorEmail}</td>
        </tr>
        ${donorPhone && donorPhone !== "N/A" ? `
        <tr>
          <td class="label">मोबाइल नंबर (Mobile):</td>
          <td class="value">${donorPhone}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="label">पैन कार्ड (PAN Number):</td>
          <td class="value">${pan}</td>
        </tr>
        <tr>
          <td class="label">दान की तिथि (Date):</td>
          <td class="value">${date}</td>
        </tr>
      </table>
      
      <div class="amount-box">
        <span class="label">कुल स्वीकृत दान राशि (Total Donated Amount):</span>
        <div class="amount-value">₹${amount.toLocaleString()}</div>
      </div>
      
      <p style="font-size: 13px; color: #44403c; text-align: center;">यह रसीद आयकर की धारा 80G के तहत कर नियमानुसार छूट हेतु पूर्णतः वैध है।</p>
    </div>
    
    <div class="footer-signs">
      <div class="footer-text">
        "प्रकृतिः रक्षति रक्षिता"<br>
        Nature protects its protectors.
      </div>
      <div class="sign-block">
        <div class="signature">Nitin Swami</div>
        <div style="font-size: 14px; font-weight: 850;">(नितिन स्वामी)</div>
        <div style="font-size: 11px; color: #78716c;">राष्ट्रीय अध्यक्ष • पी.वी.प. (भारत)</div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PVP_Receipt_${receiptId.replace(/\//g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (window.confirm("क्या आप अपना सहयोग इतिहास साफ करना चाहते हैं?")) {
      // Deleting all donations of this visitor from DB
      const currentDons = dbInstance.getDonations();
      
      let loggedInUid: string | undefined = undefined;
      const activeUserStr = localStorage.getItem("pvp_current_user");
      if (activeUserStr) {
        try {
          loggedInUid = JSON.parse(activeUserStr).uid;
        } catch (e) {}
      }

      currentDons.forEach(d => {
        if (loggedInUid && d.userId === loggedInUid) {
          dbInstance.deleteDonation(d.receiptId);
        } else if (!loggedInUid && !d.userId) {
          dbInstance.deleteDonation(d.receiptId);
        }
      });

      setHistoryList([]);
      alert("इतिहास सफलतापूर्वक साफ हुआ! (History Cleared)");
    }
  };

  return (
    <section
      id="donate"
      className="py-16 sm:py-24 bg-[#efe7d6]/20 scroll-mt-20 overflow-hidden print:bg-white print:py-4"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 print:hidden">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg select-none">
            💰 सहयोग निधि 💰
          </div>
          <h2 className="font-hindi text-3xl sm:text-4xl font-black text-stone-900 mt-2.5">
            प्रकृति संरक्षण अभियान में सहभागिता
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base font-medium">
            परिषद किसी सरकारी अनुदान पर आश्रित नहीं है। यह पूर्णतः लोक-सहभागिता और समाज के दानी बंधुओं की दान निधि से संचालित है। आपके द्वारा दिया गया एक-एक पैसा सीधे धरातल पर तालाब संवर्धन व वृक्षारोपण में उपयोग किया जाता है।
          </p>
        </div>

        {/* Donation UI Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch print:block" id="donation-block-wrapper">
          
          {/* Left Column: Guidelines / Preservation details */}
          <div className="lg:col-span- così lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8 print:hidden">
            
            <div className="bg-[#f5f1e8] p-6 rounded-2xl border border-stone-200 shadow-md">
              <h3 className="font-hindi text-lg sm:text-xl font-bold text-[#0f4d24] flex items-center gap-2 mb-3.5">
                <Shield className="w-5.5 h-5.5 text-emerald-600" />
                सुरक्षित एवं पारदर्शी सहयोग
              </h3>
              <ul className="font-hindi text-stone-700 text-xs sm:text-sm space-y-3.5 leading-relaxed font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-ngo-forest mt-0.5 font-bold">❇</span>
                  <span><strong>80G आयकर छूट:</strong> परिषद को दिया गया दान आयकर अधिनियम की धारा 80G के तहत कर मुक्त है। (रसीद आपके ईमेल पर तुरंत जाएगी)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ngo-forest mt-0.5 font-bold">❇</span>
                  <span><strong>100% धरातलीय उपयोग:</strong> कार्यों की मासिक रिपोर्ट तथा आय-व्यय ब्यौरा वेबसाइट पर निरंतर प्रकाशित किया जाता है।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ngo-forest mt-0.5 font-bold">❇</span>
                  <span><strong>सम्मान सूची:</strong> ₹11,000 से अधिक सहयोग देने वाले बंधुओं का नाम परिषद के स्थानीय 'पर्यावरण स्तंभ' पट्ट पर सम्मानीय तौर पर उत्कीर्ण किया जाता है।</span>
                </li>
              </ul>
            </div>

            {/* Historical list logs shown underneath */}
            {historyList.length > 0 && (
              <div className="bg-[#f5f1e8] p-6 rounded-2xl border border-stone-200 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h4 className="font-hindi text-sm sm:text-base font-bold text-stone-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-ngo-forest" />
                    मेरा पूर्व सहयोग इतिहास
                  </h4>
                  <button
                    onClick={clearHistory}
                    className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                    title="इतिहास साफ करें"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {historyList.map((rec) => (
                    <div key={rec.receiptId} className="bg-white p-3 rounded-xl border border-stone-200 text-xs flex justify-between items-center shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-hindi font-bold text-stone-800">{rec.donorName}</span>
                        <span className="font-mono text-stone-500 text-[10px]">{rec.receiptId} • {rec.date}</span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-bold text-[#0f4d24] text-sm">₹{rec.amount.toLocaleString()}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] py-0.5 px-1.5 rounded-full font-bold">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick trust banner */}
            <div className="bg-stone-900 p-6 rounded-2xl text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart className="w-16 h-16 fill-white" />
              </div>
              <span className="text-amber-400 font-hindi font-bold text-xs">“एक विचार जो संजोए कल”</span>
              <p className="font-hindi text-stone-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                "वृक्ष लगाओ, जल बचाओ, धरती का शृंगार सजाओ!" - पश्चिमांचल के उज्ज्वल भविष्य के निर्माण के इस पुनीत कार्य में आज ही भामाशाह बनें।
              </p>
            </div>

          </div>

          {/* Right Column: Dynamic payment panel, Receipts, & Checkouts */}
          <div className="lg:col-span-7 bg-[#f5f1e8] p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 relative print:shadow-none print:border-0 print:p-0 print:bg-white">
            <div className="absolute inset-2 border border-dashed border-ngo-forest/15 rounded-2xl pointer-events-none print:hidden" />
            
            <div className="relative z-10">
              
              {/* Receipt Visualizer (Shown instantly after checkout success) */}
              {generatedReceipt ? (
                <div className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-ngo-beige shadow-lg animate-fade-in print:p-0 print:border-0 print:shadow-none" id="instant-receipt">
                  
                  {/* Decorative Header */}
                  <div className="text-center pb-4 border-b border-dashed border-stone-300">
                    <span className="font-hindi text-xl font-extrabold text-[#0f4d24]">पश्चिमांचल विकास परिषद (भारत)</span>
                    <p className="text-[10px] sm:text-xs font-sans text-stone-500 font-bold tracking-widest uppercase mt-0.5">
                      Paschimanchal Vikas Parishad (PVP) • West UP
                    </p>
                    <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-hindi py-0.5 px-3 rounded-full border border-emerald-250 font-bold mt-2">
                      80G आयकर दान प्रमाण-पत्र (RECEIPT)
                    </span>
                  </div>

                  {/* Body Grid */}
                  <div className="py-4.5 space-y-3.5 font-hindi text-stone-850 text-sm sm:text-base font-semibold">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="text-stone-500 font-hindi">रसीद संख्या (Receipt Ref):</span>
                      <span className="font-mono font-black text-stone-900">{generatedReceipt.receiptId}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="text-stone-500 font-hindi">दातव्य नाम (Donor Name):</span>
                      <span className="text-stone-900">{generatedReceipt.donorName}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="text-stone-500 font-hindi">ईमेल पता (Email):</span>
                      <span className="font-sans text-stone-900 break-all">{generatedReceipt.donorEmail}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="text-stone-500 font-hindi">पैन कार्ड (PAN Number):</span>
                      <span className="font-sans font-bold text-stone-900">{generatedReceipt.pan}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="text-stone-500 font-hindi">दान तिथि (Giving Date):</span>
                      <span className="text-stone-900">{generatedReceipt.date}</span>
                    </div>

                    <div className="flex justify-between items-center bg-ngo-beige/35 p-3 rounded-xl border border-stone-200.5">
                      <span className="text-stone-700 font-bold font-hindi">कुल अंशदान (Total Donated):</span>
                      <span className="font-sans font-black text-xl text-[#0f4d24]">₹{generatedReceipt.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-hindi">स्थिति (Status):</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">✓ {generatedReceipt.status}</span>
                    </div>
                  </div>

                  {/* Email Sent Notification status */}
                  {emailStatus && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-800 text-center font-hindi font-bold flex items-center justify-center gap-2 print:hidden animate-pulse">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>प्रमाण-पत्र की पीडीएफ प्रति <strong>{generatedReceipt.donorEmail}</strong> पर भेज दी गई है।</span>
                    </div>
                  )}

                  {/* Receipt controls */}
                  <div className="mt-6 flex flex-col gap-4 print:hidden">
                    {generatedReceipt.status !== "सफल (Paid)" && (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-302 text-amber-900 text-xs sm:text-sm leading-relaxed font-hindi font-bold">
                        <p className="flex items-center gap-2 text-sm text-amber-850 mb-1 font-extrabold">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                          भुगतान सत्यापन लंबित (Payment Verification Pending)
                        </p>
                        आपका अंशदान विवरण सुरक्षित सहेज लिया गया है। परिषद द्वारा आपके भुगतान/ट्रांजैक्शन की पुष्टि होने के उपरांत आपकी आधिकारिक रसीद एवं 80G आयकर छूट प्रमाण-पत्र आपके प्रोफ़ाइल डैशबोर्ड पर डाउनलोड करने के लिए सक्रिय कर दिया जाएगा।
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      {generatedReceipt.status === "सफल (Paid)" ? (
                        <>
                          <button
                            onClick={handleDownloadReceipt}
                            className="px-5 py-2.5 bg-emerald-850 hover:bg-emerald-900 text-[#efe7d6] rounded-xl text-sm font-hindi font-extrabold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            रसीद डाउनलोड करें (Download PDF Receipt)
                          </button>
                          <button
                            onClick={handlePrint}
                            className="px-5 py-2.5 bg-sky-850 hover:bg-sky-900 text-white rounded-xl text-sm font-hindi font-extrabold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            प्रिंट करें (Print Receipt)
                          </button>
                        </>
                      ) : (
                        <div className="px-5 py-2.5 bg-amber-500/5 text-amber-850 border border-amber-300 text-center rounded-xl text-xs font-hindi font-bold flex items-center justify-center">
                          🔄 सत्यापन के बाद रसीद व प्रिंट उपलब्ध होगा (Awaiting Admin Review)
                        </div>
                      )}
                      <button
                        onClick={() => setGeneratedReceipt(null)}
                        className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-750 font-hindi font-bold rounded-xl text-sm transition-all text-center cursor-pointer"
                      >
                        नया दान करें (Donate Again)
                      </button>
                    </div>
                  </div>

                </div>
              ) : showCheckout ? (
                /* Dynamic Checkout simulation form */
                <form onSubmit={handleCompletePayment} className="space-y-5 animate-fade-in" aria-label="Donation checkout form">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Award className="w-5 h-5 text-ngo-forest" />
                    <h3 className="font-hindi text-base sm:text-lg font-extrabold text-stone-900">80G आयकर रसीद विवरण (Donation Details)</h3>
                  </div>

                  <div className="font-hindi text-stone-605 text-sm font-bold bg-[#efe7d6]/40 p-3.5 rounded-xl border">
                    राशि भुगतान: <span className="font-sans font-black text-base text-[#0f4d24]">₹{getActiveAmount().toLocaleString()}</span>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="donor_name" className="font-hindi text-sm font-bold text-stone-800 mb-1">
                      दाता का पूरा नाम (Full Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="donor_name"
                      required
                      placeholder="जैसे: अमित शर्मा"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-4 py-2 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl text-sm focus:outline-none text-stone-900 font-hindi"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="donor_email" className="font-hindi text-sm font-bold text-stone-800 mb-1">
                      ईमेल पता (Email Address) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="donor_email"
                      required
                      placeholder="जैसे: info@domain.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl text-sm focus:outline-none text-stone-900 font-sans"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="donor_phone" className="font-hindi text-sm font-bold text-stone-800 mb-1">
                      मोबाइल नंबर (Mobile Number) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="donor_phone"
                      required
                      placeholder="जैसे: 9720XXXXXX"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl text-sm focus:outline-none text-stone-900 font-sans"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="pan_number" className="font-hindi text-sm font-bold text-stone-800 mb-1 flex items-center justify-between">
                      <span>पैन कार्ड (PAN Number - For Tax Benefit) <span className="text-xs text-stone-500 font-sans">(Optional)</span></span>
                    </label>
                    <input
                      type="text"
                      id="pan_number"
                      maxLength={10}
                      pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}"
                      placeholder="जैसे: ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl text-sm focus:outline-none text-stone-900 font-sans uppercase font-bold"
                    />
                  </div>

                  {/* Complete form trigger */}
                  <div className="flex flex-col gap-3 sm:flex-row justify-end pt-3 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition-all"
                    >
                      पीछे जाएं (Go Back)
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1b5025] hover:bg-ngo-forest text-[#efe7d6] rounded-xl font-hindi font-bold shadow-md hover:shadow-xl transition-all"
                    >
                      भुगतान पूरा करें (Complete Giving)
                    </button>
                  </div>
                </form>
              ) : (
                /* Primary presets selector and UPI screen */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Preset Cards Select Grid */}
                  <div className="space-y-3">
                    <label className="font-hindi text-sm sm:text-base font-bold text-stone-800">
                      सहयोग राशि चुनें (Select Preset Amount)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DONATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.amount}
                          onClick={() => {
                            setSelectedPreset(opt.amount);
                            setCustomAmount("");
                          }}
                          className={`p-3.5 rounded-2xl text-left border flex flex-col justify-between transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ngo-forest
                            ${
                              selectedPreset === opt.amount
                                ? "bg-[#0f4d24] text-[#efe7d6] border-[#0f4d24] shadow-md"
                                : "bg-[#efe7d6]/40 text-stone-900 hover:bg-[#efe7d6]/80 border-stone-300"
                            }
                          `}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-hindi font-extrabold text-sm sm:text-base">{opt.label}</span>
                            <span className="font-sans font-black text-[#1f6b35] font-hindi bg-white/35 py-0.5 px-2 rounded-full text-xs sm:text-sm">
                              ₹{opt.amount}
                            </span>
                          </div>
                          <span className={`text-[10px] sm:text-xs mt-1 leading-normal ${selectedPreset === opt.amount ? "text-emerald-250" : "text-stone-550"}`}>
                            प्रभाव: {opt.impact}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount enter */}
                  <div className="flex flex-col">
                    <label htmlFor="customAmount" className="font-hindi text-sm font-bold text-stone-800 mb-2">
                      अपनी इच्छा अनुसार अन्य राशि दर्ज करें (Or Enter Custom Amount)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-black text-stone-900 text-lg">
                        ₹
                      </span>
                      <input
                        type="number"
                        id="customAmount"
                        name="customAmount"
                        placeholder="कोई भी राशि दर्ज करें"
                        value={customAmount}
                        onChange={(e) => {
                          setSelectedPreset(null);
                          setCustomAmount(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-stone-900 font-extrabold text-lg focus:outline-none"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Total display layout */}
                  <div className="p-4 bg-ngo-beige rounded-2xl border border-stone-300 flex items-center justify-between shadow-inner">
                    <span className="font-hindi text-sm font-bold text-stone-700">कुल सहयोग निधि (Total Giving):</span>
                    <span className="font-sans font-black text-[#0f4d24] text-xl sm:text-2xl flex items-center gap-1">
                      ₹{getActiveAmount().toLocaleString()}
                    </span>
                  </div>

                  {/* Method choice */}
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    
                    <button
                      onClick={handlePayViaUpiApp}
                      className="flex-1 md:flex-[1.5] bg-[#0f4d24] hover:bg-[#0b3c1b] text-[#efe7d6] py-3 px-4 rounded-xl font-hindi text-sm sm:text-base font-extrabold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 border border-emerald-950/20"
                    >
                      <Smartphone className="w-4.5 h-4.5 text-emerald-300 animate-pulse" />
                      अभी दान करें (Donate via UPI App)
                    </button>

                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="flex-1 bg-amber-800 hover:bg-amber-900 text-white py-3 px-4 rounded-xl font-hindi text-sm sm:text-base font-bold shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 border border-amber-950/20"
                    >
                      <QrCode className="w-4.5 h-4.5 text-amber-200" />
                      {showQR ? "क्यूआर बंद करें" : "क्यूआर व बैंक विवरण"}
                    </button>

                    <button
                      onClick={startCheckout}
                      className="flex-1 bg-stone-700 hover:bg-stone-800 text-[#efe7d6] py-3 px-4 rounded-xl font-hindi text-sm sm:text-base font-bold shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 border border-stone-850"
                    >
                      <CreditCard className="w-4.5 h-4.5 text-stone-300" />
                      वैकल्पिक ऑनलाइन व रसीद
                    </button>

                  </div>

                  {/* Dynamic QR block & Bank Details */}
                  {showQR && (
                    <div className="bg-[#efe7d6]/55 p-5 rounded-2xl border border-stone-300 flex flex-col items-center animate-fade-in space-y-5" id="upi-qr-block">
                      
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="bg-white p-3.5 rounded-xl shadow-md border hover:scale-103 transition-transform">
                          {siteContent?.donationQrCode ? (
                            <img 
                              src={siteContent.donationQrCode} 
                              alt="Paschimanchal Vikas Parishad Donation QR Code" 
                              className="w-40 h-40 object-contain block mx-auto referrerpolicy"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <svg width="150" height="150" viewBox="0 0 100 100" className="opacity-90 mx-auto">
                              {/* Outer landmarks */}
                              <path d="M 5 5 H 25 V 25 H 5 Z M 10 10 V 20 H 20 V 10 Z" fill="#000" />
                              <path d="M 75 5 H 95 V 25 H 75 Z M 80 10 V 20 H 90 V 10 Z" fill="#000" />
                              <path d="M 5 75 H 25 V 95 H 5 Z M 10 80 V 90 H 20 V 80 Z" fill="#000" />
                              
                              {/* Fake stylized QR maze */}
                              <path
                                d="M 33 5 H 55 V 15 H 65 V 33 H 55 V 50 H 33 Z M 35 35 H 45 V 45 H 35 Z M 65 35 H 95 V 45 H 85 V 65 H 95 V 75 H 85 V 85 H 65 M 48 55 H 52 V 65 H 48 M 65 55 V 60 H 95 M 5 33 H 15 V 45 H 5 M 22 45 V 65 M 33 65 H 55 V 95 M 35 75 H 45 V 85 M 55 75 H 65 V 95"
                                fill="#000"
                                stroke="#000"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              
                              {/* Leaf/Plant mini logo overlay in middle of QR */}
                              <rect x="42" y="42" width="16" height="16" rx="4" fill="#0f4d24" stroke="#fff" strokeWidth="2" />
                              <text x="50" y="52" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🌱</text>
                            </svg>
                          )}
                        </div>

                        <span className="font-hindi text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                          Scan via BHIM / Google Pay / PhonePe / Paytm / Any UPI App
                        </span>
                        
                        <div className="flex items-center gap-3 bg-[#f5f1e8] py-1.5 px-3.5 rounded-xl border border-stone-300 inline-flex mx-auto">
                          <span className="font-sans font-black text-xs text-stone-700">UPI ID: <strong className="text-[#0f4d24]">{getUpiId()}</strong></span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-stone-500 hover:text-ngo-forest p-1 border rounded bg-white hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center"
                            title="Copy UPI ID"
                          >
                            {isCopied ? "Copied!" : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Explicit Bank Transfer Details Table */}
                      <div className="w-full bg-white p-4 rounded-xl border border-stone-300 shadow-sm text-left">
                        <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2.5">
                          <Landmark className="w-4.5 h-4.5 text-stone-600" />
                          <h4 className="font-hindi text-sm font-bold text-stone-800">🏛️ डायरेक्ट बैंक ट्रांसफर विवरण</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold">
                          <div>
                            <span className="text-stone-500 block">खाताधारक का नाम (Holder Name):</span>
                            <span className="text-stone-900 font-hindi">{siteContent?.donationAccountHolder || "---"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">बैंक का नाम (Bank Name):</span>
                            <span className="text-stone-900 font-hindi">{siteContent?.donationBankName || "---"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block font-normal">खाता संख्या (Account Number):</span>
                            <span className="text-stone-900 font-mono tracking-wider font-black">{siteContent?.donationAccountNumber || "---"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block font-normal">आईएफएससी कोड (IFSC Code):</span>
                            <span className="text-stone-900 font-mono tracking-wide font-black uppercase">{siteContent?.donationIfscCode || "---"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Receipt generator request link for QR bank payers */}
                      <button
                        onClick={() => {
                          setShowCheckout(true);
                        }}
                        className="font-hindi text-xs text-stone-600 hover:text-[#0f4d24] font-black underline cursor-pointer"
                      >
                        पेमेंट पूरा होने के बाद यहाँ क्लिक कर तुरंत 80G प्रमाण-पत्र रसीद प्राप्त करें
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

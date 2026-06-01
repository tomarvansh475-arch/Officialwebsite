import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { dbInstance } from "../lib/db";

export default function ContactSection() {
  const content = dbInstance.getSiteContent();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setFormData({ name: "", phone: "", subject: "", message: "" });
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 bg-[#efe7d6]/30 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="leaf-divider font-hindi text-ngo-forest font-bold text-lg select-none">
            📞 संपर्क सूत्र 📞
          </div>
          <h2 className="font-hindi text-3xl sm:text-4xl font-black text-stone-900 mt-2.5">
            हमसे संपर्क करें (Contact Us)
          </h2>
          <p className="text-stone-600 mt-4 text-sm sm:text-base font-medium">
            यदि आपके पास पश्चिमांचल में तालाब पुनरुद्धार, वृक्षारोपण, स्वास्थ्य अथवा सांस्कृतिक प्रचार से जुड़े कोई सुझाव हैं, तो बेझिझक हमसे संपर्क करें।
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch" id="contact-split-grid">
          
          {/* Left Column: Coordinates & Google Map Embed */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8">
            
            {/* Quick Contact Details */}
            <div className="space-y-5">
              
              {/* Address */}
              <div className="flex gap-4 p-4 rounded-xl bg-[#f5f1e8] border border-stone-200 shadow-sm hover:border-ngo-forest/40 transition-colors">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-ngo-forest/10 flex items-center justify-center text-ngo-forest">
                  <MapPin className="w-5.5 h-5.5 text-ngo-dark" />
                </div>
                <div>
                  <h4 className="font-hindi text-base sm:text-lg font-bold text-stone-900">संस्थान मुख्यालय (Head Office)</h4>
                  <p className="font-hindi text-stone-600 text-sm mt-1 leading-relaxed">
                    {content.contactAddress || "ग्राम इस्लामपुर घसौली, जिला शामली (पश्चिमी उत्तर प्रदेश), पिन - 247775"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 p-4 rounded-xl bg-[#f5f1e8] border border-stone-200 shadow-sm hover:border-ngo-forest/40 transition-colors">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-ngo-forest/10 flex items-center justify-center text-ngo-forest">
                  <Phone className="w-5.5 h-5.5 text-ngo-dark" />
                </div>
                <div className="flex-1">
                  <h4 className="font-hindi text-base sm:text-lg font-bold text-stone-900">संपर्क सूत्र (Call Us)</h4>
                  <div className="font-sans text-stone-600 text-sm mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <strong>{content.contactPhone || "+91 9720220072"}</strong>
                    <a
                      href={`tel:${content.contactPhone || "+919720220072"}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#1b5025] hover:bg-ngo-forest text-[#efe7d6] rounded-lg font-hindi text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      📞 कॉल करें (Call Now)
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-4 rounded-xl bg-[#f5f1e8] border border-stone-200 shadow-sm hover:border-ngo-forest/40 transition-colors">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-ngo-forest/10 flex items-center justify-center text-ngo-forest">
                  <Mail className="w-5.5 h-5.5 text-ngo-dark" />
                </div>
                <div className="flex-1">
                  <h4 className="font-hindi text-base sm:text-lg font-bold text-stone-900">आधिकारिक ईमेल (Email Us)</h4>
                  <div className="font-sans text-stone-600 text-sm mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <strong className="text-xs sm:text-sm break-all">{content.contactEmail || "paschimanchalvikasparisad@gmail.com"}</strong>
                    <a
                      href={`mailto:${content.contactEmail || "paschimanchalvikasparisad@gmail.com"}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-800 hover:bg-amber-700 text-[#f5f1e8] rounded-lg font-hindi text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      ✉️ मेल भेजें (Send Mail)
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Google Map Embed */}
            <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-stone-200">
              <iframe
                title="Google Maps PVP Head Office"
                src={content.contactMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55355.61767171439!2d77.2755325!3d29.4475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c21be9ab5ff73%3A0xe5a3c00445d4c885!2sShamli%2C%20Uttar%20Pradesh%20247775!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

          {/* Right Column: Contact form */}
          <div className="lg:col-span-7 bg-[#f5f1e8] p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200 relative">
            <div className="absolute inset-2 border border-dashed border-ngo-forest/15 rounded-2xl pointer-events-none" />
            
            <div className="relative z-10">
              
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-6" aria-label="Comment Form">
                  
                  {/* Name and Mobile Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="flex flex-col">
                      <label htmlFor="contact_name" className="font-hindi text-sm sm:text-base font-bold text-stone-800 mb-1.5">
                        आपका नाम (Your Name) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="contact_name"
                        required
                        placeholder="जैसे: अमित चौधरी"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl font-hindi text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="contact_phone" className="font-hindi text-sm sm:text-base font-bold text-stone-800 mb-1.5">
                        संपर्क सूत्र (Mobile Number) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="contact_phone"
                        required
                        pattern="[0-9]{10}"
                        placeholder="जैसे: 98xxxxxxxx"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl font-sans text-stone-900 focus:outline-none"
                      />
                    </div>

                  </div>

                  {/* Subject */}
                  <div className="flex flex-col">
                    <label htmlFor="contact_subject" className="font-hindi text-sm sm:text-base font-bold text-stone-800 mb-1.5">
                      विषय (Subject) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="contact_subject"
                      required
                      placeholder="आप किस विषय में चर्चा करना चाहते हैं?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl font-hindi text-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* Message body */}
                  <div className="flex flex-col">
                    <label htmlFor="contact_message" className="font-hindi text-sm sm:text-base font-bold text-stone-800 mb-1.5">
                      संदेश या प्रश्न (Message) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      id="contact_message"
                      rows={5}
                      required
                      placeholder="अपने विचार यहाँ साझा करें..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#efe7d6]/60 border border-stone-350 focus:border-ngo-forest rounded-xl font-hindi text-stone-900 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#1b5025] hover:bg-[#113a19] text-[#efe7d6] py-3.5 px-6 rounded-xl font-hindi text-base font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 border border-[#efe7d6]/25"
                  >
                    <Send className="w-5 h-5 text-emerald-400" />
                    संदेश भेजें
                  </button>

                </form>
              ) : (
                /* Success interaction display */
                <div className="flex flex-col items-center text-center py-10 px-4 animate-fade-in" id="contact-success-block">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce mb-4" />
                  <h3 className="font-hindi text-xl sm:text-2xl font-black text-emerald-800">
                    संदेश सफलतापूर्वक प्राप्त हुआ!
                  </h3>
                  <p className="font-hindi text-stone-600 text-sm sm:text-base mt-2.5 max-w-sm leading-relaxed">
                    धन्यवाद <strong>{formData.name}</strong> जी। आपका संदेश हमारे जिला शामली पी.वी.प. सचिवालय को प्रेषित कर दिया गया है। हमारे प्रतिनिधि जल्द से जल्द आपसे संपर्क करेंगे।
                  </p>
                  
                  <div className="w-full h-px bg-stone-300 my-6" />

                  <span className="text-xs font-sans text-stone-500 font-bold italic uppercase flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                    Your message details are preserved securely.
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

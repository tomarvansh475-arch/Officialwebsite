import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Volunteer } from "./db";

export async function generatePvpMembershipPDF(volunteer: Volunteer): Promise<boolean> {
  try {
    const isApproved = volunteer.status === "सक्रिय (Approved)" || (volunteer.status as string)?.includes("Approved") || (volunteer.status as string)?.includes("सक्रिय");
    const statusText = isApproved ? "सक्रिय (Approved)" : "लंबित (Pending Review)";
    const statusColor = isApproved ? "#0f4d24" : "#b45309";
    const statusBg = isApproved ? "#ecfdf5" : "#fef3c7";
    const certNo = volunteer.certificateNo || `PVP-CERT-2026-${volunteer.id.split("-").pop() || "6111"}`;
    const joinDate = volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString("hi-IN") : new Date().toLocaleDateString("hi-IN");
    const joinDateEn = volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");

    // Create container element
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "800px";
    container.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    container.style.backgroundColor = "#faf7f0";
    container.style.padding = "40px";
    container.style.boxSizing = "border-box";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "60px";

    // --- HTML FOR PAGE 1: MEMBERSHIP ID CARD ---
    const cardHtml = `
      <div id="pdf-id-card" style="width: 480px; height: 290px; background: linear-gradient(135deg, #fdfcf7 0%, #efe7d6 100%); border: 6px double #0f4d24; border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; justify-content: space-between; padding: 16px; box-sizing: border-box; margin: 0 auto;">
        <!-- Watermark logo -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; font-size: 150px; font-weight: bold; pointer-events: none; z-index: 0; user-select: none;">🌱</div>
        
        <!-- Status Watermark overlay for non-approved -->
        ${!isApproved ? `
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 40; pointer-events: none; background-color: rgba(255,255,255,0.05);">
            <div style="transform: rotate(-12deg); font-weight: 900; background-color: #b45309; color: #ffffff; border: 2px solid #ffffff; padding: 8px 18px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
              लंबित (Pending Review)
            </div>
          </div>
        ` : ""}

        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2.5px solid rgba(15, 77, 36, 0.25); padding-bottom: 8px; z-index: 10;">
          <div style="width: 42px; height: 42px; background-color: #0f4d24; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #faf7f0; font-size: 22px; font-weight: bold; border: 2px solid #b45309;">🌱</div>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 13px; font-weight: 900; color: #0f4d24; margin: 0; font-family: inherit;">पश्चिमांचल विकास परिषद (भारत)</span>
            <span style="font-size: 8.5px; color: #7c2d12; font-weight: 800; letter-spacing: 0.5px; margin-top: 3px;">प्रकृति से संस्कृति की ओर • राष्ट्र सेवा प्रभाग</span>
          </div>
        </div>

        <!-- Body content split -->
        <div style="display: flex; gap: 16px; align-items: flex-start; margin: 12px 0; z-index: 10; flex: 1;">
          <!-- Photo Container -->
          <div style="width: 85px; height: 110px; border-radius: 8px; border: 1.5px solid rgba(15,77,36,0.35); background-color: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
            ${volunteer.photoUrl ? `
              <img src="${volunteer.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            ` : `
              <span style="font-size: 40px; color: #a1a1aa;">👤</span>
            `}
          </div>

          <!-- Fields list -->
          <div style="display: flex; flex-direction: column; flex-grow: 1; text-align: left; gap: 5px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 8px; color: #78716c; font-weight: 800; text-transform: uppercase;">नाम (Member Name)</span>
              <span style="font-size: 12.5px; font-weight: 900; color: #0f4d24; line-height: 1.2;">${volunteer.fullName}</span>
            </div>

            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 8px; padding-top: 2px;">
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 7.5px; color: #78716c; font-weight: 800; text-transform: uppercase;">पिता का नाम (Father)</span>
                <span style="font-size: 10.5px; font-weight: 800; color: #1c1917;">${volunteer.fathersName || "N/A"}</span>
              </div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 7.5px; color: #78716c; font-weight: 800; text-transform: uppercase;">संबद्ध जिला (District)</span>
                <span style="font-size: 10.5px; font-weight: 800; color: #0f4d24;">${volunteer.district || "N/A"}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 8px; padding-top: 2px;">
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 7.5px; color: #78716c; font-weight: 800; text-transform: uppercase;">सदस्यता संख्या (ID No)</span>
                <span style="font-size: 10.5px; font-weight: 900; color: #7c2d12; font-family: monospace;">${volunteer.id}</span>
              </div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 7.5px; color: #78716c; font-weight: 800; text-transform: uppercase;">पंजीकरण तिथि (Date)</span>
                <span style="font-size: 10.5px; font-weight: 800; color: #1c1917; font-family: monospace;">${joinDateEn}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div style="border-top: 1.5px solid rgba(15, 77, 36, 0.2); padding-top: 6px; display: flex; justify-content: space-between; align-items: flex-end; z-index: 10;">
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 8.5px; font-weight: 900; color: #1c1917;">पद: राष्ट्र-रक्षक स्वयंसेवक सेनापति</span>
            <span style="font-size: 6.5px; color: #a1a1aa; font-family: monospace;">Secured through Admin Verification system</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <svg width="45" height="12" viewBox="0 0 100 30" style="opacity:0.85;">
              <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span style="font-size: 7px; font-weight: 900; color: #1c1917; margin-top: 2px;">(नितिन स्वामी - राष्ट्रीय अध्यक्ष)</span>
          </div>
        </div>
      </div>
    `;

    // --- HTML FOR PAGE 2: VERIFICATION CERTIFICATE ---
    const certificateHtml = `
      <div id="pdf-cert-frame" style="width: 700px; padding: 40px; background-color: #faf7f0; border: 12px double #0d361a; box-sizing: border-box; text-align: center; position: relative; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        <!-- Double thin safety borders -->
        <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid rgba(139, 92, 26, 0.2); border-radius: 8px; pointer-events: none;"></div>
        <div style="position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1px solid rgba(15, 77, 36, 0.25); border-radius: 6px; pointer-events: none;"></div>
        
        <!-- Watermark logo -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(1.6); opacity: 0.035; font-size: 260px; font-weight: bold; pointer-events: none; z-index: 0; user-select: none;">🌱</div>
        
        <!-- Cert Header Title -->
        <div style="z-index: 10; position: relative;">
          <div style="font-size: 40px; margin-bottom: 1px;">🌱</div>
          <h2 style="font-size: 26px; font-weight: 900; color: #0f4d24; margin: 0; font-family: inherit; letter-spacing: 0.5px;">पश्चिमांचल विकास परिषद (भारत)</h2>
          <div style="font-size: 11px; color: #7c2d12; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; border-bottom: 2px solid rgba(15, 77, 36, 0.2); display: inline-block; padding-bottom: 8px; width: 85%;">
            PASCHIMANCHAL VIKAS PARISHAD (PVP)
          </div>
          
          <div style="margin: 20px 0 15px 0;">
            <span style="font-size: 12.5px; font-weight: bold; background-color: #efe7d6; border: 1.5px solid #d6c4a5; border-radius: 9999px; padding: 6px 20px; color: #0f4d24; text-transform: uppercase; letter-spacing: 0.5px;">
              स्वयंसेवक सैन्य प्रमाण-पत्र (Guard Induction Honor)
            </span>
          </div>
        </div>

        <!-- Core Message context -->
        <div style="padding: 10px 40px; z-index: 10; position: relative; line-height: 1.8; color: #1c1917; text-align: center;">
          <p style="font-size: 13.5px; font-weight: bold; color: #57534e; margin-bottom: 12px;">
            सत्यमेव जयते • प्रकृति रक्षा ही देश रक्षा है
          </p>
          <p style="font-size: 14.5px; margin: 15px 0; font-weight: 500;">
            सहर्ष प्रमाणित किया जाता है कि पर्यावरण संरक्षण, जल-तालाब संवर्धन एवं प्राकृतिक विरासत के रक्षण हेतु समर्पित सैनिक के रूप में निम्नलिखित सदस्य का पंजीकरण पश्चिमांचल विकास परिषद के केंद्रीय सैन्य आयोग में किया गया है:
          </p>

          <!-- Member highlight details -->
          <div style="font-size: 18px; font-weight: 900; color: #0f4d24; margin: 18px 0; background-color: rgba(15, 77, 36, 0.04); padding: 10px; border-radius: 12px; border: 1px dashed rgba(15, 77, 36, 0.2); display: inline-block; padding-left: 30px; padding-right: 30px;">
            ${volunteer.fullName}
          </div>

          <p style="font-size: 14px; margin-top: 5px; font-weight: 600;">
            सुपुत्र/सुपुत्री: <strong style="color:#1d1d1f">${volunteer.fathersName || "N/A"}</strong>, निवासी: <strong style="color:#1d1d1f">${volunteer.city || "N/A"}</strong> (${volunteer.district || "N/A"})
          </p>
          
          <p style="font-size: 13.5px; color: #44403c; margin: 15px auto; max-width: 550px; line-height: 1.6;">
            हम इनके उज्जवल भविष्य की कामना करते हैं। आशा है कि ये पश्चिमांचल (पश्चिम उत्तर प्रदेश) क्षेत्र के समस्त जनपदों में पर्यावरण संवर्धन एवं जन-जागरण अभियानों में अपना बहुमूल्य योगदान तन-मन-धन व स्वयंसेवा से निरंतर प्रदान करते रहेंगे।
          </p>
        </div>

        <!-- Security and Metadata bands -->
        <div style="margin: 25px auto 40px auto; width: 90%; border-top: 1.5px dashed rgba(15, 77, 36, 0.15); border-bottom: 1.5px dashed rgba(15, 77, 36, 0.15); padding: 12px 0; display: flex; justify-content: space-around; font-size: 12.5px; z-index: 10; position: relative; font-family: monospace; font-weight: bold; background-color: #fcfbf7;">
          <span style="color: #0f4d24;">MEMBER ID: ${volunteer.id}</span>
          <span style="color: #b45309;">CERTIFICATE NO: ${certNo}</span>
          <span style="color: #1c1917;">DATE: ${joinDate}</span>
        </div>

        <!-- Bottom Signatures -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; margin-top: 10px; z-index: 10; position: relative;">
          <!-- Left side Official Seal -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 54px; height: 54px; border: 2.5px double #0d361a; border-radius: 50%; display: flex; flex-direction: column; items-center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #0d361a; background-color: rgba(13, 54, 26, 0.05);">
              <span style="margin: 0; line-height: 1;">🌱 SEAL</span>
              <span style="font-size: 8px; margin: 1px 0;">★</span>
              <span style="margin: 0; line-height: 1;">OFFICIAL</span>
            </div>
            <span style="font-size: 10px; font-weight: 800; color: #78716c; margin-top: 6px;">आधिकारिक मुहर</span>
          </div>

          <!-- Center Status indicator -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: ${statusBg}; border: 1.5px solid ${statusBg}; border-radius: 12px; padding: 6px 16px; min-width: 130px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <span style="font-size: 8.5px; color: #78716c; font-weight: bold; text-transform: uppercase;">VERIFICATION STATUS</span>
            <span style="font-size: 11.5px; color: ${statusColor}; font-weight: bold; margin-top: 2px;">${statusText}</span>
          </div>

          <!-- Right side leader signature -->
          <div style="display: flex; flex-direction: column; items-end; text-align: right;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 50px;">
              <svg width="65" height="20" viewBox="0 0 100 30" style="opacity:0.9; margin-bottom: 2px;">
                <path d="M 5 20 C 20 10, 30 5, 50 15 C 70 25, 80 5, 95 10" fill="none" stroke="#1c3e1c" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <span style="font-size: 11.5px; font-weight: 900; color: #1c1917;">(नितिन स्वामी)</span>
            </div>
            <span style="font-size: 9.5px; font-weight: bold; color: #78716c; margin-top: 4px;">राष्ट्रीय अध्यक्ष, केंद्रीय सैन्य परिषद</span>
          </div>
        </div>
      </div>
    `;

    // Render HTML to container
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 80px; align-items: center;">
        ${cardHtml}
        ${certificateHtml}
      </div>
    `;

    // Append to body temporarily
    document.body.appendChild(container);

    // Give images a small delay to ensure rendering completes
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Capture Page 1: ID Card
    const cardEl = container.querySelector("#pdf-id-card") as HTMLElement;
    const certEl = container.querySelector("#pdf-cert-frame") as HTMLElement;

    if (!cardEl || !certEl) {
      console.error("PDF generation elements failed to mount");
      document.body.removeChild(container);
      return false;
    }

    // Configure jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // 1. Snapshot Page 1 (ID Card)
    const cardCanvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#faf7f0",
      logging: false
    });
    const cardImg = cardCanvas.toDataURL("image/jpeg", 0.95);
    // Position ID Card nicely centered on A4 Page 1
    // A4 width: 210, height: 297
    // ID Card is 480x290 (ratio 1.65). Inside PDF let's make it 180mm wide -> height: 180 / 1.65 = 109mm
    const cardWidth = 170;
    const cardHeight = (cardCanvas.height * cardWidth) / cardCanvas.width;
    const cardX = (210 - cardWidth) / 2;
    const cardY = 50; // top-padding

    // Header context above ID Card inside PDF
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(15, 77, 36); // #0f4d24
    pdf.text("PASCHIMANCHAL VIKAS PARISHAD", 105, 22, { align: "center" });
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 113, 108); // Grey
    pdf.text("Registered Volunteer Membership Credentials", 105, 28, { align: "center" });
    
    // Draw ID Card
    pdf.addImage(cardImg, "JPEG", cardX, cardY, cardWidth, cardHeight);
    
    // Instructions at bottom of Page 1
    pdf.setFontSize(9);
    pdf.setTextColor(120, 113, 108);
    pdf.text("Disclaimer: This identity card is issued strictly for organization identification purposes.", 105, 175, { align: "center" });
    pdf.text("Scan QR/Check authenticity at https://paschimanchalvikasparisad.org", 105, 181, { align: "center" });

    // 2. Snapshot Page 2 (Induction Certificate)
    pdf.addPage();
    const certCanvas = await html2canvas(certEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#faf7f0",
      logging: false
    });
    const certImg = certCanvas.toDataURL("image/jpeg", 0.95);
    // A4 height: 297, width: 210. Certificate is 700 width, we want to fill nicely
    const certWidth = 190;
    const certHeight = (certCanvas.height * certWidth) / certCanvas.width;
    const certX = (210 - certWidth) / 2; // = 10mm margins
    const certY = (297 - certHeight) / 2; // Center page

    pdf.addImage(certImg, "JPEG", certX, certY, certWidth, certHeight);

    // Save and download PDF file
    const safeName = volunteer.fullName.trim().replace(/\s+/g, "_");
    pdf.save(`PVP_Membership_${safeName}_${volunteer.id}.pdf`);

    // Clean up temporary DOM node
    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error("Critical client-side PDF generation failure:", error);
    return false;
  }
}

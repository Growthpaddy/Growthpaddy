import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface StrictResumeData {
  full_name: string;
  role_title: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  linkedin_url: string;
  experience_history: Array<{
    role: string;
    company: string;
    dates: string;
    location: string;
    description: string;
    bullets?: string[];
  }>;
  tools: string[]; // Formatted as comma-separated list in PDF
  certifications: string[];
}

/**
 * Generates a clean, professional, 10-field PDF resume using PDFKit.
 * Typography & Styling:
 * - Font: Helvetica / -apple-system standard
 * - Primary Headers: #0f172a (Slate 900)
 * - Accent Links & Roles: #2563eb (Blue 600)
 * - Body Text: #334155 (Slate 700)
 * - Dividers & Borders: #e2e8f0 (Slate 200)
 */
export function generateResumePdfStream(data: StrictResumeData): Readable {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: {
      Title: `${data.full_name} - Resume`,
      Author: data.full_name,
      Subject: "Professional Candidate Resume",
      Keywords: "Resume, CV, Digital Campux",
    },
  });

  const primaryColor = "#0f172a";
  const accentColor = "#2563eb";
  const secondaryColor = "#475569";
  const mutedColor = "#64748b";
  const bodyColor = "#334155";
  const dividerColor = "#cbd5e1";

  const pageWidth = doc.page.width;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw a section header with clean underline
  const drawSectionHeader = (title: string) => {
    doc.moveDown(0.8);
    const y = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(primaryColor)
      .text(title.toUpperCase(), margin, y, {
        characterSpacing: 0.8,
      });

    doc.moveDown(0.25);
    const lineY = doc.y;
    doc
      .strokeColor(dividerColor)
      .lineWidth(0.75)
      .moveTo(margin, lineY)
      .lineTo(margin + contentWidth, lineY)
      .stroke();

    doc.moveDown(0.45);
  };

  // -------------------------------------------------------------
  // 1. TOP HEADER: Name, Role Title, and Contact Info
  // -------------------------------------------------------------
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(primaryColor)
    .text(data.full_name || "Candidate Name", margin, 40, {
      align: "left",
    });

  if (data.role_title) {
    doc.moveDown(0.15);
    doc
      .font("Helvetica-Bold")
      .fontSize(11.5)
      .fillColor(accentColor)
      .text(data.role_title, {
        align: "left",
      });
  }

  // Contact info line (location, email, phone, linkedin_url)
  const contactParts: { text: string; link?: string }[] = [];
  if (data.location) contactParts.push({ text: data.location });
  if (data.email) contactParts.push({ text: data.email, link: `mailto:${data.email}` });
  if (data.phone) contactParts.push({ text: data.phone, link: `tel:${data.phone.replace(/\s+/g, "")}` });
  if (data.linkedin_url) {
    const cleanLinkedin = data.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/");
    contactParts.push({ text: cleanLinkedin, link: data.linkedin_url.startsWith("http") ? data.linkedin_url : `https://${data.linkedin_url}` });
  }

  if (contactParts.length > 0) {
    doc.moveDown(0.25);
    let contactX = margin;
    const contactY = doc.y;

    doc.font("Helvetica").fontSize(8.5);

    contactParts.forEach((part, index) => {
      if (index > 0) {
        doc.fillColor(mutedColor).text("  •  ", contactX, contactY, { continued: false, lineBreak: false });
        contactX += doc.widthOfString("  •  ");
      }

      if (part.link) {
        doc.fillColor(accentColor).text(part.text, contactX, contactY, {
          link: part.link,
          underline: false,
          continued: false,
          lineBreak: false,
        });
      } else {
        doc.fillColor(secondaryColor).text(part.text, contactX, contactY, {
          continued: false,
          lineBreak: false,
        });
      }

      contactX += doc.widthOfString(part.text);
    });

    doc.moveDown(0.7);
  }

  // Header Divider
  const headerLineY = doc.y;
  doc
    .strokeColor(primaryColor)
    .lineWidth(1.25)
    .moveTo(margin, headerLineY)
    .lineTo(margin + contentWidth, headerLineY)
    .stroke();

  doc.moveDown(0.4);

  // -------------------------------------------------------------
  // 2. PROFESSIONAL SUMMARY (Bio)
  // -------------------------------------------------------------
  if (data.bio && data.bio.trim().length > 0) {
    drawSectionHeader("Professional Summary");
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(bodyColor)
      .text(data.bio.trim(), margin, doc.y, {
        width: contentWidth,
        align: "justify",
        lineGap: 2.5,
      });
  }

  // -------------------------------------------------------------
  // 3. WORK & EXPERIENCE HISTORY
  // -------------------------------------------------------------
  if (Array.isArray(data.experience_history) && data.experience_history.length > 0) {
    drawSectionHeader("Experience & Work History");

    data.experience_history.forEach((exp, idx) => {
      if (idx > 0) {
        doc.moveDown(0.5);
      }

      // Check remaining page space
      if (doc.y > doc.page.height - 90) {
        doc.addPage();
      }

      const roleText = exp.role || "Professional Specialist";
      const companyText = exp.company ? `  |  ${exp.company}` : "";

      // Role + Company Line
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(primaryColor)
        .text(roleText, margin, doc.y, { continued: Boolean(companyText) });

      if (companyText) {
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(secondaryColor)
          .text(companyText);
      }

      // Dates & Location Sub-line
      const metaParts: string[] = [];
      if (exp.dates) metaParts.push(exp.dates);
      if (exp.location) metaParts.push(exp.location);

      if (metaParts.length > 0) {
        doc.moveDown(0.1);
        doc
          .font("Helvetica-Oblique")
          .fontSize(8.5)
          .fillColor(mutedColor)
          .text(metaParts.join("  •  "), margin, doc.y);
      }

      // Description
      if (exp.description && exp.description.trim()) {
        doc.moveDown(0.2);
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(bodyColor)
          .text(exp.description.trim(), margin, doc.y, {
            width: contentWidth,
            lineGap: 2,
          });
      }

      // Bullets
      if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
        doc.moveDown(0.15);
        exp.bullets.forEach((bullet) => {
          if (!bullet || !bullet.trim()) return;
          doc
            .font("Helvetica")
            .fontSize(8.8)
            .fillColor(bodyColor)
            .text(`•   ${bullet.trim()}`, margin + 8, doc.y, {
              width: contentWidth - 8,
              lineGap: 1.8,
            });
          doc.moveDown(0.1);
        });
      }
    });
  }

  // -------------------------------------------------------------
  // 4. CORE TOOLS & TECHNOLOGIES
  // -------------------------------------------------------------
  if (Array.isArray(data.tools) && data.tools.length > 0) {
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
    }

    drawSectionHeader("Core Tools & Technologies");
    const formattedTools = data.tools.join(", ");

    doc
      .font("Helvetica")
      .fontSize(9.2)
      .fillColor(bodyColor)
      .text(formattedTools, margin, doc.y, {
        width: contentWidth,
        lineGap: 2.5,
      });
  }

  // -------------------------------------------------------------
  // 5. CERTIFICATIONS & ACCREDITATIONS
  // -------------------------------------------------------------
  if (Array.isArray(data.certifications) && data.certifications.length > 0) {
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
    }

    drawSectionHeader("Certifications & Accreditations");

    data.certifications.forEach((cert) => {
      if (!cert || !cert.trim()) return;
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(bodyColor)
        .text(`•   ${cert.trim()}`, margin + 4, doc.y, {
          width: contentWidth - 4,
          lineGap: 1.8,
        });
      doc.moveDown(0.15);
    });
  }

  // Finalize the PDF
  doc.end();

  return doc;
}

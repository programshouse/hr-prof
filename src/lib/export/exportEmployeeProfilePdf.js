import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registerPdfFonts } from './pdfFonts';

const BLUE = [35, 112, 190];
const DARK = [35, 35, 35];
const TEXT = [70, 70, 70];
const MUTED = [105, 105, 105];
const LIGHT_BLUE = [205, 225, 245];

// Keep title colors identical in Arabic and English.
const TITLE_BLUE = BLUE;
const TITLE_DARK = DARK;

// jsPDF's Arabic plugin is registered as a preProcessText hook in the bundled
// build. Do NOT call doc.processArabic() manually here; doing that shapes the
// same text twice and produces reversed/disconnected/doubled Arabic glyphs.
const LOGO_HEIGHT = 42;
const LOGO_MAX_WIDTH = 180;

function pdfText(value) {
  if (value === null || value === undefined || value === '') return '--';
  return String(value);
}

function cleanTitle(value = '', isRTL = false) {
  const clean = String(value).replace(/^\d+\.\s*/, '').trim();
  return isRTL ? clean : clean.toUpperCase();
}

function mediaBaseFromApi() {
  const apiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (!apiUrl) return '';

  return apiUrl
    .replace(/\/api\/hr\/v1\/?$/i, '')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
}

function unwrapImageSource(source) {
  if (!source) return '';
  if (typeof source === 'string') return source.trim();

  if (typeof source === 'object') {
    return String(
      source.image_url ||
        source.imageUrl ||
        source.image_path ||
        source.imagePath ||
        source.photo_url ||
        source.photoUrl ||
        source.photo_path ||
        source.photoPath ||
        source.avatar_url ||
        source.avatarUrl ||
        source.url ||
        source.src ||
        source.path ||
        ''
    ).trim();
  }

  return '';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function resolveImageCandidates(source, imageBaseUrl = '') {
  const rawSource = unwrapImageSource(source);
  if (!rawSource) return [];

  const raw = rawSource.replace(/\\/g, '/').trim();

  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) {
    return [raw];
  }

  const base = (imageBaseUrl || mediaBaseFromApi()).replace(/\/$/, '');
  const candidates = [];

  // Try the literal URL first when the API already returned a complete URL.
  if (/^https?:\/\//i.test(raw)) {
    candidates.push(raw);

    // Mixed-content URLs commonly come back from older Laravel data.
    if (raw.startsWith('http://')) {
      candidates.push(`https://${raw.slice('http://'.length)}`);
    }

    if (base) {
      try {
        const absolute = new URL(raw);
        const baseUrl = new URL(base);

        if (absolute.origin === baseUrl.origin) {
          const basePath = baseUrl.pathname.replace(/\/$/, '');
          const pathname = absolute.pathname.replace(/\/{2,}/g, '/');

          // If the API returned /storage/... while the Laravel app lives
          // below /hr, try /hr/storage/... as well.
          if (basePath && basePath !== '/' && !pathname.startsWith(`${basePath}/`)) {
            candidates.push(`${baseUrl.origin}${basePath}${pathname}${absolute.search || ''}`);
          }

          // Also repair accidental /hr/hr/... duplication.
          if (basePath) {
            const duplicated = `${basePath}${basePath}/`;
            if (pathname.startsWith(duplicated)) {
              candidates.push(
                `${baseUrl.origin}${pathname.replace(duplicated, `${basePath}/`)}${absolute.search || ''}`
              );
            }
          }
        }
      } catch {
        // Keep the original absolute candidate.
      }
    }

    return unique(candidates);
  }

  const cleanPath = raw.replace(/^\/+/, '');

  // The visible employee profile uses the Laravel app base itself. Keep the
  // PDF resolver in sync with that behaviour.
  if (base) {
    const cleanBase = base.replace(/\/$/, '');
    const baseUrl = (() => {
      try {
        return new URL(cleanBase);
      } catch {
        return null;
      }
    })();

    candidates.push(`${cleanBase}/${cleanPath}`);

    if (baseUrl) {
      const basePath = baseUrl.pathname.replace(/^\/+|\/+$/g, '');

      // Raw values can already start with `hr/`; don't create /hr/hr/.
      if (basePath && cleanPath.toLowerCase().startsWith(`${basePath.toLowerCase()}/`)) {
        candidates.push(`${baseUrl.origin}/${cleanPath}`);
      }

      // Laravel sometimes stores paths as public/storage/... while the public
      // URL is storage/.... Try both forms.
      if (cleanPath.startsWith('public/')) {
        candidates.push(`${cleanBase}/${cleanPath.replace(/^public\//, '')}`);
      }

      if (cleanPath.startsWith('storage/')) {
        candidates.push(`${baseUrl.origin}/${cleanPath}`);
      }
    }
  }

  // Relative URL as seen by the browser can still be correct when the app and
  // uploaded files are served from the same host.
  if (typeof window !== 'undefined') {
    try {
      candidates.push(new URL(raw, window.location.href).href);
    } catch {
      // Ignore malformed relative values.
    }
  }

  return unique(candidates);
}

export async function exportEmployeeProfilePdf({
  tables = [],
  fileName = 'employee-profile',
  title = '',
  subtitle = '',
  header = {},
  language = '',
  isRTL: requestedRTL,
  signatures = [],
  signaturesTitle = '',
}) {
  const detectedLanguage =
    language ||
    header.language ||
    document?.documentElement?.lang ||
    'en';

  const isRTL =
    typeof requestedRTL === 'boolean'
      ? requestedRTL
      : typeof header.isRTL === 'boolean'
        ? header.isRTL
        : String(detectedLanguage).toLowerCase().startsWith('ar') ||
          document?.documentElement?.dir === 'rtl';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  // DejaVu is bundled locally and supports both Latin and Arabic.
  const fonts = await registerPdfFonts(doc);

  if (isRTL && typeof doc.setLanguage === 'function') {
    doc.setLanguage('ar');
  }
  const FONT = isRTL ? fonts.arabic : fonts.latin;

  // NOTE: doc.setR2L() is intentionally NOT used. This file already mirrors
  // alignment, columns and the photo position manually, so setR2L would
  // double-reverse the layout.

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 38;
  const marginTop = 38;
  const marginBottom = 36;
  const contentWidth = pageWidth - marginX * 2;

  let cursorY = marginTop;

  const employeeName =
    header.name ||
    header.employeeName ||
    header.fullName ||
    header.full_name ||
    title ||
    'EMPLOYEE NAME';

  const employeeJob =
    header.jobTitle ||
    header.job_title ||
    header.position ||
    header.positionName ||
    header.designation ||
    '';

  // Arabic glyphs look a little smaller than the Latin font at the same
  // point size, so give Arabic a small size boost everywhere in the PDF.
  const ARABIC_FONT_SIZE_BONUS = 1.8;

  const setFont = (style = 'normal', size = 12, color = TEXT) => {
    doc.setFont(FONT, style);
    doc.setFontSize(size + (isRTL ? ARABIC_FONT_SIZE_BONUS : 0));
    doc.setTextColor(...color);
  };

  /* =========================================================
     TEXT DRAWING
     jsPDF shapes Arabic automatically through its preProcessText hook.
     Keeping the original Unicode text here avoids double shaping.
  ========================================================= */

  const drawText = (text, x, y, options) => doc.text(text, x, y, options);

  const drawContinuationHeader = () => {
    setFont('bold', 9.5, MUTED);

    drawText(
      isRTL ? String(employeeName) : String(employeeName).toUpperCase(),
      isRTL ? pageWidth - marginX : marginX,
      21,
      { align: isRTL ? 'right' : 'left' }
    );

    doc.setDrawColor(...LIGHT_BLUE);
    doc.setLineWidth(0.5);
    doc.line(marginX, 27, pageWidth - marginX, 27);
  };

  const addNewPage = () => {
    doc.addPage();
    drawContinuationHeader();
    cursorY = marginTop + 5;
  };

  const ensureSpace = (requiredHeight = 50) => {
    if (cursorY + requiredHeight > pageHeight - marginBottom) {
      addNewPage();
      return true;
    }
    return false;
  };

  /* =========================================================
     COMPANY LOGO
     (drawn first because it moves cursorY, and the photo and
     header text are positioned from cursorY)
  ========================================================= */

  if (header.logo) {
    try {
      const logo = await loadLogo(header.logo);

      let logoH = LOGO_HEIGHT;
      let logoW = logoH * logo.ratio;
      if (logoW > LOGO_MAX_WIDTH) {
        logoW = LOGO_MAX_WIDTH;
        logoH = logoW / logo.ratio;
      }

      // Keep the calculated logo width/height exactly as-is, but center it.
      const logoX = (pageWidth - logoW) / 2;
      doc.addImage(logo.dataUrl, 'PNG', logoX, cursorY - 2, logoW, logoH);
      cursorY += logoH + 8;
    } catch (error) {
      console.warn('PDF logo skipped:', error);
    }
  }

  /* =========================================================
     PROFILE PHOTO
  ========================================================= */

  const photoSize = 72;
  let photoLoaded = false;

  // `header.photo` is intentionally the ONLY employee-image input.
  // EmployeeDetailsPage resolves it from the same authoritative source used by
  // EmployeeProfileHeader. Generic image fields and DOM queries are forbidden
  // here because they can point to applicant documents or another avatar.
  const photoSource = header.photo || null;

  const photoCandidates = unique([
    ...resolveImageCandidates(
      photoSource,
      header.imageBaseUrl || header.mediaBaseUrl || ''
    ),
  ]);

  let photoData = '';

  if (photoCandidates.length) {
    try {
      photoData = await loadFirstImageAsDataUrl(photoCandidates);
    } catch (error) {
      console.error('Employee PDF photo failed:', {
        candidates: photoCandidates,
        error,
      });
    }
  }

  if (photoData) {
    // Match the reference CV: square photo in the top-right in both languages.
    const photoX = pageWidth - marginX - photoSize;
    const photoY = cursorY - 2;

    doc.setFillColor(245, 247, 250);
    doc.rect(photoX, photoY, photoSize, photoSize, 'F');
    doc.addImage(photoData, 'PNG', photoX, photoY, photoSize, photoSize);
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.6);
    doc.rect(photoX, photoY, photoSize, photoSize);
    photoLoaded = true;
  }

  /* =========================================================
     CV HEADER
  ========================================================= */

  const headerTextWidth = photoLoaded
    ? contentWidth - photoSize - 24
    : contentWidth;

  // The photo stays top-right like the supplied CV sample. In Arabic, place
  // the right-aligned text immediately to the left of the photo.
  const headerTextX =
    isRTL && photoLoaded
      ? pageWidth - marginX - photoSize - 24
      : isRTL
        ? pageWidth - marginX
        : marginX;
  const headerAlign = isRTL ? 'right' : 'left';

  setFont('bold', 22, TITLE_BLUE);

  const displayName = isRTL
    ? String(employeeName)
    : String(employeeName).toUpperCase();

  const nameLines = doc.splitTextToSize(displayName, headerTextWidth);
  drawText(nameLines, headerTextX, cursorY + 17, {
    align: headerAlign,
    maxWidth: headerTextWidth,
  });

  let jobY = cursorY + 17 + nameLines.length * 13;

  if (employeeJob) {
    setFont('bold', 13, TITLE_DARK);
    drawText(
      isRTL ? String(employeeJob) : String(employeeJob).toUpperCase(),
      headerTextX,
      jobY,
      { align: headerAlign, maxWidth: headerTextWidth }
    );
    jobY += 16;
  }

  const contactItems = [];
  if (header.address || header.location) contactItems.push(header.address || header.location);
  if (header.phone || header.phoneNumber || header.phone_number) {
    contactItems.push(header.phone || header.phoneNumber || header.phone_number);
  }
  if (header.email) contactItems.push(header.email);
  if (header.website) contactItems.push(header.website);

  if (contactItems.length) {
    setFont('normal', 9.6, TEXT);
    const contactLines = doc.splitTextToSize(contactItems.join('  |  '), headerTextWidth);
    drawText(contactLines, headerTextX, jobY, {
      align: headerAlign,
      maxWidth: headerTextWidth,
    });
  }

  cursorY += photoLoaded ? 77 : 70;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.9);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 15;

  /* =========================================================
     SECTION TITLE
  ========================================================= */

  function drawSectionTitle(sectionTitle) {
    ensureSpace(35);

    const titleText = cleanTitle(sectionTitle, isRTL);

    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.65);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 11;

    setFont('bold', 8.8, TITLE_BLUE);
    drawText(titleText, isRTL ? pageWidth - marginX : marginX, cursorY, {
      align: isRTL ? 'right' : 'left',
    });

    cursorY += 6;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.65);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 14;
  }

  /* =========================================================
     OPTIONAL SUMMARY
  ========================================================= */

  if (header.summary) {
    drawSectionTitle(header.summaryTitle || (isRTL ? 'الملخص' : 'Summary'));
    setFont('normal', 8.3, TEXT);

    const summaryLines = doc.splitTextToSize(String(header.summary), contentWidth);
    drawText(
      summaryLines,
      isRTL ? pageWidth - marginX : marginX,
      cursorY,
      {
        align: isRTL ? 'right' : 'left',
        maxWidth: contentWidth,
      }
    );

    cursorY += summaryLines.length * 10.5 + 10;
  }

  /* =========================================================
     FIELD / VALUE SECTION
  ========================================================= */

  function drawCvField(label, value, x, y, width) {
    const labelText = pdfText(label);
    const valueText = pdfText(value);
    const isUrl = /^https?:\/\//i.test(valueText.trim());

    if (isRTL) {
      setFont('normal', 9.6, isUrl ? TITLE_BLUE : TEXT);
      const combined = `${labelText}: ${valueText}`;
      const lines = doc.splitTextToSize(combined, width);

      // Draw the whole Arabic field from the right. This avoids broken
      // label/value order caused by mixing separate bidi text fragments.
      drawText(lines, x + width, y, {
        align: 'right',
        maxWidth: width,
      });

      if (isUrl) {
        doc.link(x, y - 8, width, Math.max(14, lines.length * 10), { url: valueText.trim() });
      }

      return Math.max(17, lines.length * 10);
    }

    const upperLabel = String(labelText).trim().toUpperCase();
    const finalLabel = `${upperLabel}:`;

    setFont('bold', 7.2, DARK);
    drawText(finalLabel, x, y);

    const labelWidth = doc.getTextWidth(finalLabel);
    const valueX = x + labelWidth + 5;
    const availableWidth = Math.max(width - labelWidth - 5, 30);

    setFont('normal', 8.2, isUrl ? TITLE_BLUE : TEXT);
    const valueLines = doc.splitTextToSize(valueText, availableWidth);
    drawText(valueLines, valueX, y);

    if (isUrl) {
      doc.link(valueX, y - 8, availableWidth, Math.max(12, valueLines.length * 10), { url: valueText.trim() });
    }

    return Math.max(17, valueLines.length * 10);
  }

  function drawFieldValueSection(rows = []) {
    const columnGap = 30;
    const columnWidth = (contentWidth - columnGap) / 2;

    let column = 0;
    let rowHeight = 22;

    for (let i = 0; i < rows.length; i += 1) {
      const field = rows[i];
      if (!field) continue;

      const label = pdfText(field.label);
      const value = pdfText(field.value);
      const isLong = value.length > 55 || label.length > 35;

      if (isLong) {
        if (column === 1) {
          cursorY += rowHeight;
          column = 0;
          rowHeight = 22;
        }

        ensureSpace(35);
        const usedHeight = drawCvField(label, value, marginX, cursorY, contentWidth);
        cursorY += Math.max(22, usedHeight + 4);
        continue;
      }

      ensureSpace(30);

      // RTL starts on the right column and then moves to the left column.
      const x = isRTL
        ? column === 0
          ? marginX + columnWidth + columnGap
          : marginX
        : column === 0
          ? marginX
          : marginX + columnWidth + columnGap;

      const usedHeight = drawCvField(label, value, x, cursorY, columnWidth);
      rowHeight = Math.max(rowHeight, usedHeight + 5);

      if (column === 1) {
        cursorY += rowHeight;
        column = 0;
        rowHeight = 22;
      } else {
        column = 1;
      }
    }

    if (column === 1) cursorY += rowHeight;
    cursorY += 3;
  }

  /* =========================================================
     REPEATING TABLE SECTION
  ========================================================= */

  function drawCvTable(section) {
    ensureSpace(60);

    const originalColumns = section.columns || [];
    const columns = isRTL ? [...originalColumns].reverse() : originalColumns;
    const rows = section.rows || [];

    autoTable(doc, {
      startY: cursorY,
      margin: {
        left: marginX,
        right: marginX,
        bottom: marginBottom + 5,
        top: 40,
      },
      tableWidth: contentWidth,
      head: [columns.map((column) => pdfText(column.label))],
      body: rows.map((row) => columns.map((column) => pdfText(row[column.key]))),
      theme: 'plain',
      styles: {
        font: FONT,
        fontSize: isRTL ? 11.6 : 9.8,
        textColor: TEXT,
        halign: isRTL ? 'right' : 'left',
        cellPadding: {
          top: 4,
          right: isRTL ? 0 : 5,
          bottom: 5,
          left: isRTL ? 5 : 0,
        },
        lineWidth: 0,
        overflow: 'linebreak',
        valign: 'top',
      },
      headStyles: {
        font: FONT,
        fontStyle: 'bold',
        fontSize: isRTL ? 11.6 : 9.8,
        halign: isRTL ? 'right' : 'left',
        textColor: TITLE_DARK,
        fillColor: [255, 255, 255],
        cellPadding: {
          top: 1,
          right: isRTL ? 0 : 5,
          bottom: 6,
          left: isRTL ? 5 : 0,
        },
        lineColor: LIGHT_BLUE,
        lineWidth: { bottom: 0.55 },
      },
      bodyStyles: { textColor: TEXT },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      didParseCell(data) {
        if (data.section === 'body') {
          // In LTR, visually emphasize the first logical column.
          // In RTL, the first logical column is the last visual column.
          const emphasizedIndex = isRTL ? columns.length - 1 : 0;
          if (data.column.index === emphasizedIndex) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = DARK;
          }
        }
      },
      didDrawPage(data) {
        if (data.pageNumber > 1) drawContinuationHeader();
      },
    });

    cursorY = doc.lastAutoTable.finalY + 12;
  }

  /* =========================================================
     RENDER SECTIONS
  ========================================================= */

  for (const section of tables) {
    if (!section || !Array.isArray(section.columns) || !Array.isArray(section.rows)) continue;
    if (section.rows.length === 0) continue;

    const hasUsefulData = section.rows.some((row) => {
      if (!row) return false;
      return section.columns.some((column) => {
        const value = row[column.key];
        return value !== null && value !== undefined && value !== '';
      });
    });

    if (!hasUsefulData) continue;

    if (section.type === 'signatures' || section.isSignatureSection) {
      drawSignaturesSection(section.rows || signatures, section.title);
      cursorY += 2;
      continue;
    }

    drawSectionTitle(section.title || '');

    const isFieldValue =
      section.columns.length === 2 &&
      section.columns[0]?.key === 'label' &&
      section.columns[1]?.key === 'value';

    if (isFieldValue) drawFieldValueSection(section.rows);
    else drawCvTable(section);

    cursorY += 2;
  }

  /* =========================================================
     SIGNATURES / APPROVALS
  ========================================================= */

  function drawSignaturesSection(items = [], sectionTitle = '') {
    if (!items || !items.length) return;

    ensureSpace(Math.min(items.length * 75 + 40, 200));
    drawSectionTitle(
      sectionTitle || (isRTL ? 'التوقيعات والاعتمادات' : 'Signatures & Approvals')
    );

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (!item) continue;

      const hasSignatureImage = Boolean(item.signatureImage);
      const boxHeight = hasSignatureImage ? 72 : 58;
      ensureSpace(boxHeight + 10);

      const boxX = marginX;
      const boxY = cursorY;
      const boxWidth = contentWidth;

      // Card container
      doc.setFillColor(252, 253, 255);
      doc.setDrawColor(...LIGHT_BLUE);
      doc.setLineWidth(0.65);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

      // Top bar of card: Role title + decision checkboxes
      const titleY = boxY + 14;
      setFont('bold', 9.5, TITLE_BLUE);
      const roleTitle = pdfText(item.role || item.title || item.label);

      let decisionText = '';
      if (item.decision === 'approved') {
        decisionText = isRTL
          ? 'القرار:  [ ✓ ] موافقة     [   ] رفض'
          : 'Decision:  [ ✓ ] Approved     [   ] Rejected';
      } else if (item.decision === 'rejected') {
        decisionText = isRTL
          ? 'القرار:  [   ] موافقة     [ ✓ ] رفض'
          : 'Decision:  [   ] Approved     [ ✓ ] Rejected';
      } else {
        decisionText =
          item.decisionLabel ||
          (isRTL
            ? 'القرار:  [   ] موافقة     [   ] رفض'
            : 'Decision:  [   ] Approved     [   ] Rejected');
      }

      if (isRTL) {
        drawText(roleTitle, boxX + boxWidth - 12, titleY, { align: 'right' });
        setFont('normal', 8.2, item.decision ? DARK : MUTED);
        drawText(decisionText, boxX + 12, titleY, { align: 'left' });
      } else {
        drawText(roleTitle, boxX + 12, titleY, { align: 'left' });
        setFont('normal', 8.2, item.decision ? DARK : MUTED);
        drawText(decisionText, boxX + boxWidth - 12, titleY, { align: 'right' });
      }

      // Divider inside card
      doc.setDrawColor(225, 235, 246);
      doc.setLineWidth(0.45);
      doc.line(boxX + 10, boxY + 22, boxX + boxWidth - 10, boxY + 22);

      // Middle bar: Name, Signature, Date
      const fieldsY = boxY + 36;
      const third = (boxWidth - 24) / 3;

      const nameVal = item.name ? String(item.name).trim() : '';
      const dateVal = item.date ? String(item.date).trim() : '';
      const notesVal = item.notes ? String(item.notes).trim() : '';

      const namePrefix = isRTL ? 'الاسم: ' : 'Name: ';
      const sigPrefix = isRTL ? 'التوقيع: ' : 'Signature: ';
      const datePrefix = isRTL ? 'التاريخ: ' : 'Date: ';
      const notesPrefix = isRTL ? 'ملاحظات: ' : 'Notes: ';

      const nameDisplay = nameVal
        ? `${namePrefix}${nameVal}`
        : `${namePrefix}........................................`;
      const dateDisplay = dateVal
        ? `${datePrefix}${dateVal}`
        : isRTL
          ? 'التاريخ:      /      / 202'
          : 'Date:      /      / 202';
      const sigVal = item.signatureText || item.signature || '';
      const sigDisplay = hasSignatureImage
        ? `${sigPrefix}`
        : sigVal
          ? `${sigPrefix}${sigVal}`
          : `${sigPrefix}........................................`;

      setFont('normal', 8.4, DARK);

      if (isRTL) {
        drawText(nameDisplay, boxX + boxWidth - 12, fieldsY, { align: 'right' });
        drawText(sigDisplay, boxX + boxWidth - 12 - third, fieldsY, { align: 'right' });
        drawText(dateDisplay, boxX + boxWidth - 12 - third * 2, fieldsY, { align: 'right' });
      } else {
        drawText(nameDisplay, boxX + 12, fieldsY, { align: 'left' });
        drawText(sigDisplay, boxX + 12 + third, fieldsY, { align: 'left' });
        drawText(dateDisplay, boxX + 12 + third * 2, fieldsY, { align: 'left' });
      }

      // Draw embedded digital signature image if present
      if (hasSignatureImage) {
        try {
          const sigW = 68;
          const sigH = 22;
          const sigX = isRTL
            ? boxX + boxWidth - 12 - third - doc.getTextWidth(sigPrefix) - sigW
            : boxX + 12 + third + doc.getTextWidth(sigPrefix) + 2;
          const sigY = fieldsY - 14;
          doc.addImage(item.signatureImage, 'PNG', sigX, sigY, sigW, sigH);
        } catch (err) {
          console.warn('Failed to embed signature image in PDF:', err);
        }
      }

      // Bottom bar: Notes line
      const notesY = boxY + (hasSignatureImage ? 58 : 50);
      setFont('normal', 7.5, notesVal ? DARK : MUTED);
      const notesDisplay = notesVal
        ? `${notesPrefix}${notesVal}`
        : `${notesPrefix}.....................................................................................................................................`;

      if (isRTL) {
        drawText(notesDisplay, boxX + boxWidth - 12, notesY, { align: 'right' });
      } else {
        drawText(notesDisplay, boxX + 12, notesY, { align: 'left' });
      }

      // Add AcroForm interactive form fields for unfilled inputs
      if (doc.AcroForm && typeof doc.addField === 'function') {
        try {
          if (!nameVal) {
            const nameField = new doc.AcroFormTextField();
            nameField.fieldName = `sig_${i}_name`;
            const nameFieldX = isRTL
              ? boxX + boxWidth - 12 - third + 4
              : boxX + 12 + doc.getTextWidth(namePrefix) + 2;
            nameField.Rect = [nameFieldX, fieldsY - 10, third - doc.getTextWidth(namePrefix) - 6, 13];
            nameField.fontSize = 8;
            doc.addField(nameField);
          }
          if (!hasSignatureImage && !sigVal) {
            const sigField = new doc.AcroFormTextField();
            sigField.fieldName = `sig_${i}_sign`;
            const sigFieldX = isRTL
              ? boxX + boxWidth - 12 - third * 2 + 4
              : boxX + 12 + third + doc.getTextWidth(sigPrefix) + 2;
            sigField.Rect = [sigFieldX, fieldsY - 10, third - doc.getTextWidth(sigPrefix) - 6, 13];
            sigField.fontSize = 8;
            doc.addField(sigField);
          }
          if (!dateVal) {
            const dateField = new doc.AcroFormTextField();
            dateField.fieldName = `sig_${i}_date`;
            const dateFieldX = isRTL
              ? boxX + 12
              : boxX + 12 + third * 2 + doc.getTextWidth(datePrefix) + 2;
            dateField.Rect = [dateFieldX, fieldsY - 10, third - doc.getTextWidth(datePrefix) - 6, 13];
            dateField.fontSize = 8;
            doc.addField(dateField);
          }
          if (!notesVal) {
            const notesField = new doc.AcroFormTextField();
            notesField.fieldName = `sig_${i}_notes`;
            const notesFieldX = isRTL
              ? boxX + 12
              : boxX + 12 + doc.getTextWidth(notesPrefix) + 2;
            const notesFieldW = contentWidth - doc.getTextWidth(notesPrefix) - 24;
            notesField.Rect = [notesFieldX, notesY - 9, notesFieldW, 12];
            notesField.fontSize = 7.5;
            doc.addField(notesField);
          }
        } catch (e) {
          // ignore AcroForm errors
        }
      }

      cursorY += boxHeight + 8;
    }
    cursorY += 4;
  }

  if (Array.isArray(signatures) && signatures.length > 0) {
    drawSignaturesSection(signatures, signaturesTitle);
  }

  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  const totalPages = doc.internal.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    setFont('normal', 6.8, MUTED);
    drawText(
      `${pageNumber} / ${totalPages}`,
      isRTL ? marginX : pageWidth - marginX,
      pageHeight - 15,
      { align: isRTL ? 'left' : 'right' }
    );
  }

  doc.save(`${fileName}.pdf`);
}

/* =========================================================
   IMAGE HELPERS
========================================================= */

// jsPDF cannot embed SVG directly, so draw it onto a canvas and export PNG.
// The logo is a public asset (e.g. /nizam-logo.svg), so it is NOT passed
// through resolveImageUrl (that is only for API media paths).
async function loadLogo(src) {
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Logo failed to load: ${src}`));
    image.src = src;
  });

  // SVGs without width/height can report 0 in some browsers.
  const width = img.naturalWidth || 300;
  const height = img.naturalHeight || 100;
  const scale = 4; // render larger so the logo stays sharp in the PDF

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return { dataUrl: canvas.toDataURL('image/png'), ratio: width / height };
}

async function loadFirstImageAsDataUrl(candidates = []) {
  let lastError = null;

  for (const src of candidates) {
    try {
      const dataUrl = await loadImageAsDataUrl(src);
      if (dataUrl) return dataUrl;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No employee image candidate could be loaded');
}

async function loadImageAsDataUrl(src) {
  if (!src) throw new Error('Image source is empty');

  if (typeof src === 'string' && src.startsWith('data:image/')) {
    return cropImageToSquare(src);
  }

  if (typeof src === 'string' && src.startsWith('blob:')) {
    return cropImageToSquare(src);
  }

  const credentialModes = ['include', 'omit'];
  let lastFetchError = null;

  for (const credentials of credentialModes) {
    try {
      const response = await fetch(src, {
        mode: 'cors',
        credentials,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Image request failed with status ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.type && !blob.type.startsWith('image/')) {
        throw new Error(`Employee image URL returned ${blob.type} instead of an image`);
      }

      const dataUrl = await blobToDataUrl(blob);
      return cropImageToSquare(dataUrl);
    } catch (error) {
      lastFetchError = error;
    }
  }

  // Fall back to an Image element. This succeeds for same-origin files and
  // cross-origin files that expose Access-Control-Allow-Origin.
  return new Promise((resolve, reject) => {
    const img = new Image();

    try {
      const url = new URL(src, window.location.href);
      if (url.origin !== window.location.origin) {
        img.crossOrigin = 'anonymous';
      }
    } catch {
      // Relative URL: same-origin.
    }

    img.onload = () => {
      try {
        resolve(cropLoadedImage(img));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(
        new Error(
          `Could not load employee image for PDF: ${src}. ` +
            `Fetch error: ${lastFetchError?.message || 'unknown'}`
        )
      );
    };

    img.src = src;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function cropImageToSquare(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(cropLoadedImage(img));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Could not decode employee image'));
    img.src = src;
  });
}

function cropLoadedImage(img) {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (!width || !height) throw new Error('Invalid employee image dimensions');

  const cropSize = Math.min(width, height);
  const sourceX = (width - cropSize) / 2;
  const sourceY = (height - cropSize) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 500, 500);
  ctx.drawImage(img, sourceX, sourceY, cropSize, cropSize, 0, 0, 500, 500);

  try {
    return canvas.toDataURL('image/png', 0.95);
  } catch (error) {
    throw new Error(
      `Unable to export employee image. The image server must allow CORS. ${error.message}`
    );
  }
}

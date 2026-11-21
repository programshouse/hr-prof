// src/lib/export/tableExport.js
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registerAmiriFont } from './fonts/Amiri-Regular';

/**
 * ✅ Supports BOTH:
 * 1) Old API: { rows, columns, fileName, title }
 * 2) New API: { tables: [{ title, rows, columns }], fileName, title, subtitle }
 */

const safeArr = (v) => (Array.isArray(v) ? v : []);
const ARABIC_REGEX = /[\u0600-\u06FF]/;
const hasArabic = (value) => ARABIC_REGEX.test(String(value ?? ''));

const normalizeTables = (opts = {}) => {
  if (Array.isArray(opts.tables) && opts.tables.length > 0) {
    return opts.tables
      .map((t) => ({
        title: t?.title || '',
        columns: safeArr(t?.columns),
        rows: safeArr(t?.rows),
      }))
      .filter((t) => t.columns.length > 0);
  }

  return [
    {
      title: opts.title || '',
      columns: safeArr(opts.columns),
      rows: safeArr(opts.rows),
    },
  ];
};

const cellValue = (row, key) => {
  if (!row) return '';
  const v = row?.[key];
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
};

const slugSheetName = (name) => {
  // Excel sheet name rules: max 31 chars, no : \ / ? * [ ]
  const cleaned = String(name || '')
    .replace(/[:\\\/\?\*\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (cleaned || 'Sheet').slice(0, 31);
};

const makeUniqueSheetName = (baseName, used) => {
  let name = slugSheetName(baseName);
  if (!used.has(name)) {
    used.add(name);
    return name;
  }

  // Add suffix like " (2)" with max 31 chars
  let i = 2;
  while (i < 1000) {
    const suffix = ` (${i})`;
    const trimmed = name.slice(0, 31 - suffix.length);
    const candidate = `${trimmed}${suffix}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
    i += 1;
  }

  // Fallback extremely unlikely
  const fallback = `${name.slice(0, 25)}_${Date.now().toString().slice(-5)}`;
  used.add(fallback);
  return fallback;
};

/**
 * Export to Excel (.xlsx)
 * ✅ Fix: ensure unique sheet names so nothing gets overwritten
 */

const normalizeArabicDigits = (text) =>
  String(text ?? '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

const preparePdfText = (value, doc) => {
  const text = normalizeArabicDigits(String(value ?? ''));
  if (!text) return '';

  if (hasArabic(text) && typeof doc?.processArabic === 'function') {
    return doc.processArabic(text);
  }

  return text;
};

const registerArabicFont = (doc) => {
  registerAmiriFont(doc);
  doc.setFont('Amiri-Regular', 'normal');
};

export function exportToExcel({
  rows,
  columns,
  tables,
  fileName = 'export',
  title = 'Report',
  subtitle = '',
}) {
  const normalized = normalizeTables({ rows, columns, tables, title });

  const hasAnyRows = normalized.some((t) => (t.rows || []).length > 0);
  if (!hasAnyRows) {
    console.warn('exportToExcel: no rows to export');
    alert('No rows to export to Excel');
    return;
  }

  // Check if content has Arabic for RTL alignment
  const hasArabicContent =
    hasArabic(title) ||
    hasArabic(subtitle) ||
    normalized.some((t) =>
      hasArabic(t.title) ||
      t.columns.some((c) => hasArabic(c.label ?? c.key)) ||
      t.rows.some((row) => t.columns.some((c) => hasArabic(cellValue(row, c.key))))
    );

  const wb = XLSX.utils.book_new();

  // Build AOA (single sheet)
  const aoa = [];
  aoa.push([title]);
  if (subtitle) aoa.push([subtitle]);
  aoa.push([`Generated At: ${new Date().toLocaleString()}`]);
  aoa.push([]);

  const rowMeta = []; // keep track of special rows to style
  // rowMeta: { type: 'reportTitle'|'reportSub'|'sectionTitle'|'header'|'data', r, cCount }

  const pushRow = (arr, meta) => {
    const r = aoa.length;
    aoa.push(arr);
    if (meta) rowMeta.push({ ...meta, r, cCount: (arr || []).length });
  };

  normalized.forEach((t) => {
    const cols = safeArr(t.columns);
    const rs = safeArr(t.rows);

    // section title row
    pushRow([t.title || 'Section'], { type: 'sectionTitle' });

    // header row
    pushRow(cols.map((c) => c.label ?? c.key), { type: 'header' });

    // data
    if (rs.length) {
      rs.forEach((r) => {
        pushRow(cols.map((c) => cellValue(r, c.key)), { type: 'data' });
      });
    } else {
      pushRow(['No data'], { type: 'data' });
    }

    pushRow([]);
    pushRow([]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // compute max columns
  const maxCols = aoa.reduce((m, row) => Math.max(m, (row || []).length), 0);

  // merges for report title + subtitle + generated + each section title
  ws['!merges'] = ws['!merges'] || [];

  const mergeAcross = (r, fromC = 0, toC = Math.max(maxCols - 1, 0)) => {
    if (toC <= fromC) return;
    ws['!merges'].push({ s: { r, c: fromC }, e: { r, c: toC } });
  };

  // Merge report header lines
  mergeAcross(0);
  if (subtitle) mergeAcross(1);
  mergeAcross(subtitle ? 2 : 1);

  // Merge all section title rows
  rowMeta
    .filter((x) => x.type === 'sectionTitle')
    .forEach((x) => mergeAcross(x.r));

  // Styles helpers
  const BORDER = {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  };

  const setCell = (r, c, style) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
    ws[addr].s = { ...(ws[addr].s || {}), ...style };
  };

  const applyRowStyle = (r, style) => {
    for (let c = 0; c < maxCols; c++) setCell(r, c, style);
  };

  // Report title style
  applyRowStyle(0, {
    font: { bold: true, sz: 16 },
    alignment: { 
      vertical: 'center', 
      horizontal: hasArabicContent ? 'right' : 'left',
      readingOrder: hasArabicContent ? 2 : 0 // 2 = RTL, 0 = LTR
    },
  });

  // Subtitle + generated
  const subtitleRow = subtitle ? 1 : null;
  const generatedRow = subtitle ? 2 : 1;

  if (subtitleRow !== null) {
    applyRowStyle(subtitleRow, {
      font: { sz: 11, color: { rgb: '374151' } },
      alignment: { 
        vertical: 'center', 
        horizontal: hasArabicContent ? 'right' : 'left',
        readingOrder: hasArabicContent ? 2 : 0
      },
    });
  }

  applyRowStyle(generatedRow, {
    font: { sz: 10, color: { rgb: '6B7280' } },
    alignment: { 
      vertical: 'center', 
      horizontal: hasArabicContent ? 'right' : 'left',
      readingOrder: hasArabicContent ? 2 : 0
    },
  });

  // Section + header + data styles
  rowMeta.forEach(({ type, r }) => {
    if (type === 'sectionTitle') {
      applyRowStyle(r, {
        font: { bold: true, sz: 12, color: { rgb: '111827' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'EEF2FF' } },
        alignment: { 
          vertical: 'center', 
          horizontal: hasArabicContent ? 'right' : 'left',
          readingOrder: hasArabicContent ? 2 : 0
        },
      });
    }

    if (type === 'header') {
      applyRowStyle(r, {
        font: { bold: true, color: { rgb: '111827' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
        border: BORDER,
        alignment: { 
          vertical: 'center', 
          horizontal: hasArabicContent ? 'right' : 'left', 
          wrapText: true,
          readingOrder: hasArabicContent ? 2 : 0
        },
      });
    }

    if (type === 'data') {
      // borders for all data rows (even empty)
      applyRowStyle(r, {
        border: BORDER,
        alignment: { 
          vertical: 'top', 
          horizontal: hasArabicContent ? 'right' : 'left', 
          wrapText: true,
          readingOrder: hasArabicContent ? 2 : 0
        },
      });
    }
  });

  // Column widths (best effort)
  const colWidths = Array.from({ length: maxCols }, (_, colIdx) => {
    let maxLen = 10;
    for (const row of aoa) {
      const val = row?.[colIdx];
      if (val === null || val === undefined) continue;
      const len = String(val).length;
      if (len > maxLen) maxLen = len;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 12), 45) };
  });

  ws['!cols'] = colWidths;
  ws['!freeze'] = { xSplit: 0, ySplit: 3 };

  const usedSheetNames = new Set();
  const sheetName = makeUniqueSheetName('Payroll', usedSheetNames);

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`, { compression: true });
}


/**
 * Export to PDF 
 */
export function exportToPdf({
  rows,
  columns,
  tables,
  fileName = 'export',
  title = 'Report',
  subtitle = '',
}) {
  try {
    const normalized = normalizeTables({ rows, columns, tables, title });

    const hasAnyRows = normalized.some((t) => (t.rows || []).length > 0);
    if (!hasAnyRows) {
      console.warn('exportToPdf: no rows to export');
      alert('No rows to export to PDF');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'A4',
    });

    registerArabicFont(doc);

    let cursorY = 40;

    const drawHeader = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleIsArabic = hasArabic(title);
      const subtitleIsArabic = hasArabic(subtitle);

      doc.setFont('Amiri-Regular', 'normal');
      doc.setFontSize(14);
      doc.text(
        preparePdfText(title, doc),
        titleIsArabic ? pageWidth - 40 : 40,
        cursorY,
        { align: titleIsArabic ? 'right' : 'left' }
      );

      if (subtitle) {
        cursorY += 16;
        doc.setFontSize(10);
        doc.text(
          preparePdfText(subtitle, doc),
          subtitleIsArabic ? pageWidth - 40 : 40,
          cursorY,
          { align: subtitleIsArabic ? 'right' : 'left' }
        );
      }

      cursorY += 18;
    };

    drawHeader();

    normalized.forEach((t, idx) => {
      const sectionHasArabic =
        hasArabic(t.title) ||
        t.columns.some((c) => hasArabic(c.label ?? c.key)) ||
        t.rows.some((row) => t.columns.some((c) => hasArabic(cellValue(row, c.key))));

      if (t.title) {
        cursorY += idx === 0 ? 0 : 14;
        doc.setFont('Amiri-Regular', 'normal');
        doc.setFontSize(12);

        doc.text(
          preparePdfText(t.title, doc),
          sectionHasArabic ? doc.internal.pageSize.getWidth() - 40 : 40,
          cursorY,
          { align: sectionHasArabic ? 'right' : 'left' }
        );

        cursorY += 10;
      }

      const head = [t.columns.map((c) => preparePdfText(c.label ?? c.key, doc))];
      const body = (t.rows || []).map((row) =>
        t.columns.map((c) => preparePdfText(cellValue(row, c.key), doc))
      );

      autoTable(doc, {
        startY: cursorY,
        head,
        body,
        margin: { left: 40, right: 40 },
        styles: {
          font: 'Amiri-Regular',
          fontStyle: 'normal',
          fontSize: 8,
          halign: sectionHasArabic ? 'right' : 'left',
          overflow: 'linebreak',
          cellPadding: 4,
        },
        headStyles: {
          font: 'Amiri-Regular',
          fontStyle: 'normal',
          fillColor: [31, 41, 55],
          textColor: 255,
          halign: sectionHasArabic ? 'right' : 'left',
        },
        bodyStyles: {
          font: 'Amiri-Regular',
          fontStyle: 'normal',
          halign: sectionHasArabic ? 'right' : 'left',
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            doc.setFont('Amiri-Regular', 'normal');
            doc.setFontSize(9);

            const pageWidth = doc.internal.pageSize.getWidth();
            const titleIsArabic = hasArabic(title);
            const subtitleIsArabic = hasArabic(subtitle);

            doc.text(
              preparePdfText(title, doc),
              titleIsArabic ? pageWidth - 40 : 40,
              22,
              { align: titleIsArabic ? 'right' : 'left' }
            );

            if (subtitle) {
              doc.text(
                preparePdfText(subtitle, doc),
                subtitleIsArabic ? pageWidth - 40 : 40,
                34,
                { align: subtitleIsArabic ? 'right' : 'left' }
              );
            }
          }
        },
      });

      cursorY = (doc.lastAutoTable?.finalY || cursorY) + 18;

      const pageHeight = doc.internal.pageSize.getHeight();
      if (cursorY > pageHeight - 80 && idx < normalized.length - 1) {
        doc.addPage();
        cursorY = 40;
        drawHeader();
      }
    });

    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert(error?.message || 'PDF export failed');
  }
}

/**
 * Print tables
 * Fix: print AFTER window loads (no flaky timeout)
 */
export function printTable({ rows, columns, tables, title = 'Report', subtitle = '' }) {
  const normalized = normalizeTables({ rows, columns, tables, title });

  const hasAnyRows = normalized.some((t) => (t.rows || []).length > 0);
  if (!hasAnyRows) {
    console.warn('printTable: no rows to export');
    alert('No rows to print');
    return;
  }

  // Check if content has Arabic for RTL alignment
  const hasArabicContent = 
    hasArabic(title) || 
    hasArabic(subtitle) || 
    normalized.some(t => 
      hasArabic(t.title) || 
      t.columns.some(c => hasArabic(c.label ?? c.key)) ||
      t.rows.some(row => t.columns.some(c => hasArabic(cellValue(row, c.key))))
    );

  const escapeHtml = (str) =>
    String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const renderTable = (t) => {
    const textAlign = hasArabic(t.title) || t.columns.some(c => hasArabic(c.label ?? c.key)) ? 'right' : 'left';
    
    const tableHeader = t.columns
      .map(
        (c) =>
          `<th style="padding:6px 8px;border:1px solid #ccc;background:#f3f4f6;text-align:${textAlign};">
            ${escapeHtml(c.label ?? c.key)}
          </th>`
      )
      .join('');

    const tableBody =
      (t.rows || [])
        .map((row) => {
          const tds = t.columns
            .map(
              (c) =>
                `<td style="padding:6px 8px;border:1px solid #ccc;text-align:${textAlign};">
                  ${escapeHtml(cellValue(row, c.key))}
                </td>`
            )
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('') ||
      `<tr><td colspan="${t.columns.length}" style="padding:10px;border:1px solid #ccc;text-align:${textAlign};">No data</td></tr>`;

    return `
      <section style="margin-top:18px; break-inside: avoid; direction: ${hasArabic(t.title) ? 'rtl' : 'ltr'};">
       
        <table style="border-collapse:collapse;width:100%;font-size:12px;direction: ${hasArabic(t.title) ? 'rtl' : 'ltr'};">
          <thead><tr>${tableHeader}</tr></thead>
          <tbody>${tableBody}</tbody>
        </table>
      </section>
    `;
  };

  const html = `
    <!doctype html>
    <html dir="${hasArabicContent ? 'rtl' : 'ltr'}">
      <head>
        <title>${escapeHtml(title)}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 16px; color:#111; direction: ${hasArabicContent ? 'rtl' : 'ltr'}; }
          h1 { font-size: 20px; margin: 0 0 6px; text-align: ${hasArabicContent ? 'right' : 'left'}; }
          .subtitle { font-size: 12px; color: #444; margin: 0 0 12px; text-align: ${hasArabicContent ? 'right' : 'left'}; }

          .toolbar {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px 0 14px;
            border-bottom: 1px solid #eee;
            margin-bottom: 12px;
            display: flex;
            gap: 8px;
            align-items: center;
            z-index: 10;
          }
          .btn {
            appearance: none;
            border: 1px solid #ddd;
            background: #111;
            color: #fff;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
          }
          .btn.secondary {
            background: #fff;
            color: #111;
          }
          .hint { font-size: 12px; color: #555; }

          @media print {
            .toolbar { display: none !important; }
            body { padding: 0; }
            section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button class="btn" id="btnPrint">Print</button>
          <button class="btn secondary" id="btnClose">Close</button>
          <span class="hint">Tip: you can also use Ctrl+P</span>
        </div>

        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}

        ${normalized.map(renderTable).join('')}

        <script>
          document.getElementById('btnPrint').addEventListener('click', () => window.print());
          document.getElementById('btnClose').addEventListener('click', () => window.close());
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('printTable: popup blocked');
    alert('Popup blocked by browser – allow popups to print.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // No auto-print, user chooses when to print (Print button / Ctrl+P)
  printWindow.focus();
}
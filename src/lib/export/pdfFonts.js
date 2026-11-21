import DejaVuRegular from '@/assets/fonts/DejaVuSans.ttf';
import DejaVuBold from '@/assets/fonts/DejaVuSans-Bold.ttf';
import { registerAmiriFont } from './fonts/Amiri-Regular';

/* =========================================================
   CONVERT FONT URL TO BASE64
========================================================= */

async function toBase64(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Font request failed: ${response.status} ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

/* =========================================================
   REGISTER ONE FONT
========================================================= */

async function registerFont(doc, { url, fileName, family, style }) {
  const base64 = await toBase64(url);

  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, family, style);
}

/* =========================================================
   REGISTER PDF FONTS
========================================================= */

export async function registerPdfFonts(doc) {
  // English / Latin PDF font.
  await registerFont(doc, {
    url: DejaVuRegular,
    fileName: 'DejaVuSans.ttf',
    family: 'DejaVu',
    style: 'normal',
  });

  await registerFont(doc, {
    url: DejaVuBold,
    fileName: 'DejaVuSans-Bold.ttf',
    family: 'DejaVu',
    style: 'bold',
  });

  // Arabic PDF font. Amiri is already embedded in this project as base64,
  // so Arabic export does not depend on a missing public font file or CDN.
  registerAmiriFont(doc);

  doc.setFont('DejaVu', 'normal');

  return {
    latin: 'DejaVu',
    arabic: 'Amiri-Regular',
    arabicLoaded: true,
  };
}

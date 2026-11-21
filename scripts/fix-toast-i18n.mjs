/**
 * Replace common hardcoded English toast strings with i18n.t() calls.
 * Run: node scripts/fix-toast-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

const replacements = [
  [/toast\.success\('([^']+) created successfully'\)/g, "toast.success(i18n.t('messages.success.created'))"],
  [/toast\.success\("([^"]+) created successfully"\)/g, 'toast.success(i18n.t("messages.success.created"))'],
  [/toast\.success\('([^']+) updated successfully'\)/g, "toast.success(i18n.t('messages.success.updated'))"],
  [/toast\.success\("([^"]+) updated successfully"\)/g, 'toast.success(i18n.t("messages.success.updated"))'],
  [/toast\.success\('([^']+) deleted successfully'\)/g, "toast.success(i18n.t('messages.success.deleted'))"],
  [/toast\.success\("([^"]+) deleted successfully"\)/g, 'toast.success(i18n.t("messages.success.deleted"))'],
  [/toast\.success\('([^']+) saved successfully'\)/g, "toast.success(i18n.t('messages.success.saved'))"],
  [/toast\.error\('Failed to create ([^']+)'\)/g, "toast.error(i18n.t('messages.error.createFailed'))"],
  [/toast\.error\("Failed to create ([^"]+)"\)/g, 'toast.error(i18n.t("messages.error.createFailed"))'],
  [/toast\.error\('Failed to update ([^']+)'\)/g, "toast.error(i18n.t('messages.error.updateFailed'))"],
  [/toast\.error\("Failed to update ([^"]+)"\)/g, 'toast.error(i18n.t("messages.error.updateFailed"))'],
  [/toast\.error\('Failed to delete ([^']+)'\)/g, "toast.error(i18n.t('messages.error.deleteFailed'))"],
  [/toast\.error\("Failed to delete ([^"]+)"\)/g, 'toast.error(i18n.t("messages.error.deleteFailed"))'],
  [
    /const message = error\?\.(response\?\.data\?\.message) \|\| 'Failed to create ([^']+)';/g,
    "const message = error?.$1 || i18n.t('messages.error.createFailed');",
  ],
  [
    /const message = error\?\.(response\?\.data\?\.message) \|\| 'Failed to update ([^']+)';/g,
    "const message = error?.$1 || i18n.t('messages.error.updateFailed');",
  ],
  [
    /const message = error\?\.(response\?\.data\?\.message) \|\| 'Failed to delete ([^']+)';/g,
    "const message = error?.$1 || i18n.t('messages.error.deleteFailed');",
  ],
];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (f === 'node_modules' || f === 'i18n') continue;
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(jsx?|tsx?)$/.test(f)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(srcDir)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('toast.')) continue;

  const original = content;
  for (const [re, rep] of replacements) {
    content = content.replace(re, rep);
  }

  if (content !== original) {
    if (!content.includes("import i18n from '@/i18n'") && !content.includes('import i18n from "@/i18n"')) {
      const importLine = "import i18n from '@/i18n';\n";
      if (content.startsWith('import ')) {
        content = content.replace(/^(import .+\n)(?!import )/m, `$1${importLine}`);
      } else {
        content = importLine + content;
      }
    }
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
}

console.log(`Updated ${changed} files with i18n toast messages.`);

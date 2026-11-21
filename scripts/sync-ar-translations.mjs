/**
 * Sync missing keys from en.json into ar.json with Arabic translations.
 * Run: node scripts/sync-ar-translations.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const enPath = path.join(root, 'src/i18n/locales/en.json');
const arPath = path.join(root, 'src/i18n/locales/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function setNested(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function getNested(obj, dotPath) {
  return dotPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

/** Flat key -> Arabic value */
const translations = {
  'common.exportDialog.pdf': 'PDF',
  'common.exportDialog.excel': 'Excel',

  'employees.profile.details.work.department': 'القسم',
  'employees.profile.details.work.selectDepartment': 'اختر القسم',
  'employees.profile.details.work.searchDepartment': 'البحث عن قسم...',
  'employees.profile.details.work.noDepartmentFound': 'لم يتم العثور على قسم',
  'employees.profile.details.work.employmentType': 'نوع التوظيف',

  'attendance.overviewTable.day': 'اليوم',
  'attendance.overviewTable.type': 'النوع',
  'attendance.overviewTable.source': 'المصدر',
  'attendance.overviewTable.exception': 'الاستثناء',
  'attendance.overviewTable.addException': 'إضافة استثناء',
  'attendance.overviewTable.present': 'حاضر',
  'attendance.overviewTable.attend': 'حاضر',
  'attendance.overviewTable.absent': 'غائب',
  'attendance.overviewTable.weekend': 'نهاية الأسبوع',
  'attendance.overviewTable.officialHoliday': 'عطلة رسمية',
  'attendance.overviewTable.future': 'مستقبلي',
  'attendance.overviewTable.leaveApproved': 'إذن موافق ✓',
  'attendance.overviewTable.leavePending': 'إذن في الانتظار',
  'attendance.overviewTable.permissionApproved': 'إذن موافق',
  'attendance.overviewTable.permissionPending': 'إذن في الانتظار',
  'attendance.overviewTable.missingPunch': 'تسجيل الحضور مفقود',
  'attendance.overviewTable.leave': 'إذن',

  'lateSheet.filters.salaries.searchPlaceholder': 'بحث...',
  'lateSheet.filters.salaries.searchEmployees': 'البحث عن الموظفين',
  'lateSheet.filters.salaries.addNew': 'إضافة جديد',

  'rewards.noDataToExport': 'لا توجد بيانات للتصدير',
  'rewards.exportSuccess': 'تم تصدير المكافآت بنجاح',
  'rewards.pdfExportSuccess': 'تم تصدير PDF بنجاح',
  'rewards.printSuccess': 'تم إرسال أمر الطباعة بنجاح',

  'penalties.noDataToExport': 'لا توجد بيانات للتصدير',
  'penalties.exportSuccess': 'تم تصدير الجزاءات بنجاح',
  'penalties.pdfExportSuccess': 'تم تصدير PDF بنجاح',
  'penalties.printSuccess': 'تم إرسال أمر الطباعة بنجاح',

  'freelancers.title': 'المستقلون',
  'freelancers.subtitle': 'اختر واضبط الساعات للموظف المختار',
  'freelancers.search': 'بحث',
  'freelancers.showEntries': 'عرض الإدخالات',
  'freelancers.showing': 'عرض',
  'freelancers.noEmployeesFound': 'لم يتم العثور على موظفين',
  'freelancers.tryChangingCriteria': 'جرّب تغيير معايير البحث.',
  'freelancers.workedHours': 'الساعات المنجزة',
  'freelancers.requiredHours': 'الساعات المطلوبة',
  'freelancers.save': 'حفظ',
  'freelancers.saving': 'جاري الحفظ...',
  'freelancers.hoursUpdated': 'تم تحديث ساعات المستقل(ين) بنجاح',

  'forms.fields.firstName': 'الاسم الأول',
  'forms.fields.lastName': 'اسم العائلة',
  'forms.fields.fullName': 'الاسم الكامل',
  'forms.fields.email': 'البريد الإلكتروني',
  'forms.fields.password': 'كلمة المرور',
  'forms.fields.newPassword': 'كلمة المرور الجديدة',
  'forms.fields.confirmPassword': 'تأكيد كلمة المرور',
  'forms.fields.currentPassword': 'كلمة المرور الحالية',
  'forms.fields.phone': 'الهاتف',
  'forms.fields.address': 'العنوان',
  'forms.fields.birthDate': 'تاريخ الميلاد',
  'forms.fields.gender': 'الجنس',
  'forms.fields.nationality': 'الجنسية',
  'forms.fields.maritalStatus': 'الحالة الاجتماعية',
  'forms.fields.department': 'القسم',
  'forms.fields.position': 'الوظيفة',
  'forms.fields.salary': 'الراتب',
  'forms.fields.hireDate': 'تاريخ التعيين',
  'forms.fields.workType': 'نوع العمل',
  'forms.fields.contractType': 'نوع العقد',
  'forms.fields.shift': 'الوردية',
  'forms.fields.bankAccount': 'الحساب البنكي',
  'forms.fields.socialSecurity': 'التأمينات الاجتماعية',
  'forms.fields.taxId': 'الرقم الضريبي',
  'forms.fields.emergencyContact': 'جهة الاتصال للطوارئ',
  'forms.fields.emergencyPhone': 'هاتف الطوارئ',
  'forms.fields.notes': 'ملاحظات',
  'forms.fields.description': 'الوصف',
  'forms.fields.reason': 'السبب',
  'forms.fields.type': 'النوع',
  'forms.fields.status': 'الحالة',
  'forms.fields.amount': 'المبلغ',
  'forms.fields.date': 'التاريخ',
  'forms.fields.from': 'من',
  'forms.fields.to': 'إلى',
  'forms.fields.duration': 'المدة',
  'forms.fields.approvedBy': 'تمت الموافقة بواسطة',
  'forms.fields.replacement': 'البديل',
  'forms.fields.leaveType': 'نوع الإجازة',
  'forms.fields.leaveBalance': 'رصيد الإجازات',
  'forms.fields.overtimeHours': 'ساعات العمل الإضافي',
  'forms.fields.lateDays': 'أيام التأخير',
  'forms.fields.absentDays': 'أيام الغياب',
  'forms.fields.performanceScore': 'درجة الأداء',
  'forms.fields.kpi': 'مؤشر الأداء',
  'forms.fields.commission': 'العمولة',
  'forms.fields.bonus': 'المكافأة',
  'forms.fields.deductions': 'الخصومات',
  'forms.fields.allowances': 'البدلات',
  'forms.fields.basicSalary': 'الراتب الأساسي',
  'forms.fields.housingAllowance': 'بدل السكن',
  'forms.fields.transportAllowance': 'بدل المواصلات',
  'forms.fields.foodAllowance': 'بدل الطعام',
  'forms.fields.medicalAllowance': 'بدل طبي',
  'forms.fields.otherAllowances': 'بدلات أخرى',
  'forms.fields.penalties': 'الجزاءات',
  'forms.fields.loans': 'القروض',
  'forms.fields.advances': 'السلف',
  'forms.fields.tax': 'الضريبة',
  'forms.fields.socialInsurance': 'التأمين الاجتماعي',
  'forms.fields.pension': 'المعاش',
  'forms.fields.otherDeductions': 'خصومات أخرى',

  'messages.success.created': 'تم الإنشاء بنجاح',
  'messages.success.updated': 'تم التحديث بنجاح',
  'messages.success.deleted': 'تم الحذف بنجاح',
  'messages.success.saved': 'تم الحفظ بنجاح',
  'messages.success.uploaded': 'تم الرفع بنجاح',
  'messages.success.exported': 'تم التصدير بنجاح',
  'messages.success.imported': 'تم الاستيراد بنجاح',
  'messages.success.activated': 'تم التفعيل بنجاح',
  'messages.success.deactivated': 'تم إلغاء التفعيل بنجاح',
  'messages.success.approved': 'تمت الموافقة بنجاح',
  'messages.success.rejected': 'تم الرفض بنجاح',
  'messages.success.sent': 'تم الإرسال بنجاح',
  'messages.success.emailSent': 'تم إرسال البريد الإلكتروني بنجاح',
  'messages.success.passwordChanged': 'تم تغيير كلمة المرور بنجاح',
  'messages.success.profileUpdated': 'تم تحديث الملف الشخصي بنجاح',
  'messages.success.settingsUpdated': 'تم تحديث الإعدادات بنجاح',
  'messages.success.attendanceUpdated': 'تم تحديث الحضور بنجاح',
  'messages.success.attendanceDeleted': 'تم حذف الحضور بنجاح',
  'messages.success.lateTimeUpdated': 'تم تحديث وقت التأخير بنجاح',
  'messages.success.lateTimeDeleted': 'تم حذف وقت التأخير بنجاح',
  'messages.success.overtimeUpdated': 'تم تحديث العمل الإضافي بنجاح',
  'messages.success.overtimeDeleted': 'تم حذف العمل الإضافي بنجاح',
  'messages.success.shiftCreated': 'تم إنشاء الوردية بنجاح',
  'messages.success.shiftUpdated': 'تم تحديث الوردية بنجاح',
  'messages.success.shiftDeleted': 'تم حذف الوردية بنجاح',

  'messages.error.required': 'هذا الحقل مطلوب',
  'messages.error.invalidEmail': 'عنوان بريد إلكتروني غير صالح',
  'messages.error.invalidPhone': 'رقم هاتف غير صالح',
  'messages.error.passwordMismatch': 'كلمات المرور غير متطابقة',
  'messages.error.weakPassword': 'كلمة المرور ضعيفة',
  'messages.error.emailExists': 'البريد الإلكتروني موجود بالفعل',
  'messages.error.phoneExists': 'رقم الهاتف موجود بالفعل',
  'messages.error.notFound': 'غير موجود',
  'messages.error.unauthorized': 'غير مصرح',
  'messages.error.forbidden': 'محظور',
  'messages.error.serverError': 'خطأ في الخادم',
  'messages.error.networkError': 'خطأ في الشبكة',
  'messages.error.unknownError': 'خطأ غير معروف',
  'messages.error.createFailed': 'فشل في الإنشاء',
  'messages.error.updateFailed': 'فشل في التحديث',
  'messages.error.deleteFailed': 'فشل في الحذف',
  'messages.error.saveFailed': 'فشل في الحفظ',
  'messages.error.uploadFailed': 'فشل في الرفع',
  'messages.error.exportFailed': 'فشل في التصدير',
  'messages.error.importFailed': 'فشل في الاستيراد',
  'messages.error.activateFailed': 'فشل في التفعيل',
  'messages.error.deactivateFailed': 'فشل في إلغاء التفعيل',
  'messages.error.approveFailed': 'فشل في الموافقة',
  'messages.error.rejectFailed': 'فشل في الرفض',
  'messages.error.sendFailed': 'فشل في الإرسال',
  'messages.error.emailSendFailed': 'فشل في إرسال البريد الإلكتروني',
  'messages.error.passwordChangeFailed': 'فشل في تغيير كلمة المرور',
  'messages.error.profileUpdateFailed': 'فشل في تحديث الملف الشخصي',
  'messages.error.settingsUpdateFailed': 'فشل في تحديث الإعدادات',
  'messages.error.loadAttendanceSheetFailed': 'فشل في تحميل كشف الحضور',
  'messages.error.exportAttendanceSheetFailed': 'فشل في تصدير كشف الحضور',
  'messages.error.updateAttendanceFailed': 'فشل في تحديث الحضور',
  'messages.error.deleteAttendanceFailed': 'فشل في حذف الحضور',
  'messages.error.loadAbsentSheetFailed': 'فشل في تحميل كشف الغياب',
  'messages.error.exportAbsentSheetFailed': 'فشل في تصدير كشف الغياب',
  'messages.error.loadLateTimeFailed': 'فشل في جلب وقت التأخير',
  'messages.error.exportLateTimeFailed': 'فشل في تصدير تقرير التأخير',
  'messages.error.updateLateTimeFailed': 'فشل في تحديث وقت التأخير',
  'messages.error.deleteLateTimeFailed': 'فشل في حذف وقت التأخير',
  'messages.error.loadOvertimeFailed': 'فشل في تحميل بيانات العمل الإضافي',
  'messages.error.exportOvertimeFailed': 'فشل في تصدير PDF العمل الإضافي',
  'messages.error.updateOvertimeFailed': 'فشل في تحديث العمل الإضافي',
  'messages.error.deleteOvertimeFailed': 'فشل في حذف العمل الإضافي',
  'messages.error.createShiftFailed': 'فشل في إنشاء الوردية',
  'messages.error.updateShiftFailed': 'فشل في تحديث الوردية',
  'messages.error.deleteShiftFailed': 'فشل في حذف الوردية',
  'messages.error.updateEmployeeStatusFailed': 'فشل في تحديث حالة الموظف',

  'requests.table.noPartTimeOvertimeData': 'لا توجد بيانات عمل إضافي لدوام جزئي',

  'positions.errors.failedToLoad': 'فشل في تحميل الوظائف',
  'positions.errors.failedToLoadHeader': 'فشل في تحميل بيانات الوظيفة',
  'positions.errors.failedToLoadTurnover': 'فشل في تحميل معدل الدوران',
  'positions.errors.failedToLoadEmployees': 'فشل في تحميل موظفي الوظيفة',

  'salaries.salaryManualUpdateModal.title': 'تحديث الراتب يدوياً',
  'salaries.salaryManualUpdateModal.month': 'الشهر',
  'salaries.salaryManualUpdateModal.bonus': 'مكافأة',
  'salaries.salaryManualUpdateModal.deduction': 'خصم',
  'salaries.salaryManualUpdateModal.note': 'ملاحظة',
  'salaries.salaryManualUpdateModal.notePlaceholder': 'ملاحظة اختيارية',
  'salaries.salaryManualUpdateModal.cancel': 'إلغاء',
  'salaries.salaryManualUpdateModal.save': 'حفظ',
  'salaries.salaryManualUpdateModal.saving': 'جاري الحفظ...',
  'salaries.salaryManualUpdateModal.successTitle': 'تم تحديث الراتب',
  'salaries.salaryManualUpdateModal.successDescription': 'تمت إضافة تعديل الراتب اليدوي بنجاح',
  'salaries.salaryManualUpdateModal.updateFailed': 'فشل في تحديث الراتب',

  'salaries.payrollActions.viewDeductionsSheet': 'عرض كشف الخصومات',
  'salaries.payrollActions.editDeduction': 'تعديل الخصم',
  'salaries.payrollActions.deleteDeduction': 'حذف الخصم',

  'salaries.lateDeductionSheet.title': 'الكشف',
  'salaries.lateDeductionSheet.export': 'تصدير',
  'salaries.lateDeductionSheet.loadFailed': 'فشل في تحميل كشف خصومات التأخير',
  'salaries.lateDeductionSheet.exportSuccess': 'تم تصدير الكشف بنجاح',

  'salaries.kpiSheetDialog.title': 'كشف مؤشرات الأداء',
  'salaries.kpiSheetDialog.item': 'العنصر',
  'salaries.kpiSheetDialog.score': 'الدرجة',
  'salaries.kpiSheetDialog.maxScore': 'الدرجة القصوى',

  'salaries.overtimeSheetDialog.title': 'كشف العمل الإضافي',
};

/** Try alternate paths already present in ar.json */
const aliases = {
  'attendance.overviewTable.day': 'attendance.overviewTable.attendanceSheet.day',
  'attendance.overviewTable.type': 'attendance.overviewTable.attendanceSheet.type',
  'attendance.overviewTable.source': 'attendance.overviewTable.attendanceSheet.source',
  'attendance.overviewTable.exception': 'attendance.overviewTable.attendanceSheet.exception',
  'attendance.overviewTable.addException': 'attendance.overviewTable.attendanceSheet.addException',
  'attendance.overviewTable.present': 'attendance.overviewTable.attendanceSheet.present',
  'attendance.overviewTable.attend': 'attendance.overviewTable.attendanceSheet.attend',
  'attendance.overviewTable.absent': 'attendance.overviewTable.attendanceSheet.absent',
  'attendance.overviewTable.weekend': 'attendance.overviewTable.attendanceSheet.weekend',
  'attendance.overviewTable.officialHoliday': 'attendance.overviewTable.attendanceSheet.officialHoliday',
  'attendance.overviewTable.future': 'attendance.overviewTable.attendanceSheet.future',
  'attendance.overviewTable.leaveApproved': 'attendance.overviewTable.attendanceSheet.leaveApproved',
  'attendance.overviewTable.leavePending': 'attendance.overviewTable.attendanceSheet.leavePending',
  'attendance.overviewTable.permissionApproved': 'attendance.overviewTable.attendanceSheet.permissionApproved',
  'attendance.overviewTable.permissionPending': 'attendance.overviewTable.attendanceSheet.permissionPending',
  'attendance.overviewTable.missingPunch': 'attendance.overviewTable.attendanceSheet.missingPunch',
  'attendance.overviewTable.leave': 'attendance.overviewTable.attendanceSheet.leave',
};

const enFlat = flatten(en);
const arFlat = flatten(ar);
let added = 0;
let warned = [];

for (const key of Object.keys(enFlat)) {
  if (key in arFlat) continue;

  let value =
    translations[key] ??
    (aliases[key] ? getNested(ar, aliases[key]) : undefined);

  if (value === undefined) {
    warned.push(key);
    continue;
  }

  setNested(ar, key, value);
  added++;
}

fs.writeFileSync(arPath, `${JSON.stringify(ar, null, 2)}\n`, 'utf8');

const arFlatAfter = flatten(ar);
const stillMissing = Object.keys(enFlat).filter((k) => !(k in arFlatAfter));

console.log(`Added ${added} Arabic translation keys.`);
if (warned.length) {
  console.log(`Skipped ${warned.length} keys (no translation yet):`);
  console.log(warned.slice(0, 20).join('\n'));
}
console.log(`Still missing vs en: ${stillMissing.length}`);

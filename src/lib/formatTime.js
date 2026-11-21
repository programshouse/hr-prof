import { formatRequestTime } from '@/utils/requestLabels';
import { format } from 'date-fns';

// src/lib/utils/formatTime.js
export function formatTimeAMPMFromAPI(time, language = 'en') {
  if (!time) return '-';

  return formatRequestTime(time, language);
}

export function formatTimeWithLanguage(date, language = 'en') {
  if (!date) return '--:--';
  let timeStr = format(date, 'hh:mm a');
  const isAr = String(language).startsWith('ar');
  if (isAr) {
    return timeStr.replace('AM', 'ص').replace('PM', 'م');
  }
  return timeStr.toLowerCase();
}

export function formatDateTimeWithLanguage(date, language = 'en') {
  if (!date) return '—';
  let dateStr = format(date, 'MM/dd/yyyy, hh:mm:ss a');
  const isAr = String(language).startsWith('ar');
  if (isAr) {
    return dateStr.replace('AM', 'ص').replace('PM', 'م');
  }
  return dateStr.replace('AM', 'am').replace('PM', 'pm');
}

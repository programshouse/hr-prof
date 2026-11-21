export function formatInsuranceMoney(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) return 'EGP0';

  return `EGP${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number)}`;
}

export function formatInsurancePercent(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return '0%';
  return `${number}%`;
}

export function getEmployeeInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'EM';

  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : parts[0]?.charAt(1) || '';

  return `${first}${last}`.toUpperCase();
}

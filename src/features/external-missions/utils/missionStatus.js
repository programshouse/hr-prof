export function getMissionStatusKey(status) {
  const s = String(status || '').toLowerCase();

  if (s === 'finished' || s === 'completed') return 'finished';
  if (s === 'cancelled') return 'canceled';
  if (['upcoming', 'ongoing', 'canceled'].includes(s)) return s;

  return null;
}

export function getMissionStatusLabel(status, t) {
  const key = getMissionStatusKey(status);

  if (key) return t(`externalMissions.status.${key}`);

  return status || '--';
}

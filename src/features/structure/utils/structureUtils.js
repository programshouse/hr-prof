export function getEmployeeDisplayName(person) {
  if (!person) return '';
  const name = person?.name ?? person?.full_name ?? person?.formatted_name ?? '';
  if (typeof name === 'string' && name.trim()) return name.trim();
  if (person?.id != null) return `#${person.id}`;
  return '—';
}

export function getEmployeePosition(person) {
  const position = person?.position ?? person?.position_name ?? person?.job_title ?? '';
  if (typeof position === 'string' && position.trim()) return position.trim();
  return '';
}

export function getEmployeeInitials(person) {
  const name = getEmployeeDisplayName(person);
  if (!name || name.startsWith('#')) return 'EM';

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function getManagerRoleKey(person) {
  if (!person) return null;
  if (person.is_ceo) return 'ceo';
  if (person.manager_for_all_branches) return 'manager_for_all_branches';
  if (person.is_branch_manager) return 'branch_manager';
  if (person.is_department_manager) return 'department_manager';
  return 'manager';
}

export function sortManagers(managers = []) {
  const roleWeight = (person) => {
    if (person?.is_ceo) return 0;
    if (person?.manager_for_all_branches) return 1;
    if (person?.is_branch_manager) return 2;
    if (person?.is_department_manager) return 3;
    return 4;
  };

  return [...managers].sort((a, b) => {
    const weightDiff = roleWeight(a) - roleWeight(b);
    if (weightDiff !== 0) return weightDiff;

    const countDiff = (b?.employees?.length ?? 0) - (a?.employees?.length ?? 0);
    if (countDiff !== 0) return countDiff;

    return getEmployeeDisplayName(a).localeCompare(getEmployeeDisplayName(b));
  });
}

export function partitionManagers(managers = []) {
  const sorted = sortManagers(managers);
  const ceos = sorted.filter((manager) => manager?.is_ceo);
  const others = sorted.filter((manager) => !manager?.is_ceo);

  return { ceos, others, sorted };
}

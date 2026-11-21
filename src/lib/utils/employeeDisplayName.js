/**
 * Resolve a display name from employee / applicant payloads (string or object).
 */
const normalizeNameValue = (value) => {
  if (typeof value === 'string') return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();

        if (item && typeof item === 'object') {
          return (
            normalizeNameValue(item.name) ||
            normalizeNameValue(item.employee_name) ||
            normalizeNameValue(item.full_name)
          );
        }

        return '';
      })
      .filter(Boolean)
      .join(', ')
      .trim();
  }

  return '';
};

const ARABIC_SCRIPT_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

const hasArabicScript = (value) => {
  const text = normalizeNameValue(value);
  return text ? ARABIC_SCRIPT_RE.test(text) : false;
};

const firstMatchingName = (
  values,
  { requireArabic = false } = {}
) => {
  if (requireArabic) {
    for (const value of values) {
      const text = normalizeNameValue(value);

      if (text && hasArabicScript(text)) {
        return text;
      }
    }
  }

  for (const value of values) {
    const text = normalizeNameValue(value);

    if (text) {
      return text;
    }
  }

  return '';
};

export function resolveEmployeeDisplayName(
  source,
  { preferArabic = false } = {}
) {
  if (!source) return '';

  if (typeof source === 'string') {
    return source.trim();
  }

  if (Array.isArray(source)) {
    return normalizeNameValue(source);
  }

  const applicant = source.applicant ?? source;

  if (typeof applicant === 'string') {
    return applicant.trim();
  }

  if (Array.isArray(applicant)) {
    return normalizeNameValue(applicant);
  }

  if (!applicant || typeof applicant !== 'object') {
    return (
      normalizeNameValue(source.name) ||
      normalizeNameValue(source.full_name) ||
      normalizeNameValue(source.employee_name)
    );
  }

  if (preferArabic) {
    const arabicName = firstMatchingName(
      [
        applicant.full_name_ar,
        source.full_name_ar,
        source.full_name,
        applicant.full_name,
        source.name_ar,
        source.employee_name_ar,
        applicant.name_ar,
        source.name,
        applicant.name,
      ],
      { requireArabic: true }
    );

    if (arabicName) {
      return arabicName;
    }

    const parts = [
      applicant.first_name,
      applicant.middle_name,
      applicant.last_name,
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);

    const joinedParts = parts.join(' ');

    if (
      joinedParts &&
      hasArabicScript(joinedParts)
    ) {
      return joinedParts;
    }

    return firstMatchingName(
      [
        applicant.full_name_ar,
        source.full_name_ar,
        source.full_name,
        applicant.full_name,
        source.name_ar,
        source.employee_name_ar,
        applicant.name_ar,
        source.name,
        applicant.name,
        applicant.employee_name,
        source.employee_name,
        joinedParts,
      ],
      { requireArabic: false }
    );
  }

  const employeeName =
    normalizeNameValue(applicant.employee_name) ||
    normalizeNameValue(source.employee_name);

  if (employeeName) {
    return employeeName;
  }

  const nameEn =
    normalizeNameValue(source.name_en) ||
    normalizeNameValue(applicant.name_en);

  if (nameEn) {
    return nameEn;
  }

  const parts = [
    applicant.first_name,
    applicant.middle_name,
    applicant.last_name,
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  if (parts.length) {
    return parts.join(' ');
  }

  const name =
    normalizeNameValue(applicant.name) ||
    normalizeNameValue(source.name);

  if (name) {
    return name;
  }

  return (
    normalizeNameValue(applicant.full_name) ||
    normalizeNameValue(source.full_name) ||
    normalizeNameValue(applicant.full_name_ar) ||
    ''
  );
}

export function formatEmployeeSelectLabel(
  employee,
  { preferArabic = false } = {}
) {
  const source = employee?.employee ?? employee;

  const code =
    source?.employee_code ??
    source?.code ??
    employee?.employee_code ??
    employee?.code ??
    '';

  const name = resolveEmployeeDisplayName(
    source,
    { preferArabic }
  );

  if (!name) {
    return code ? String(code) : '';
  }

  return code
    ? `${code} - ${name}`
    : name;
}

export function normalizeEmployeesForSelect(
  raw = [],
  { preferArabic = false } = {}
) {
  const list = Array.isArray(raw)
    ? raw
    : [];

  return list
    .map((employee) => {
      const id =
        employee?.employee_id ??
        employee?.id ??
        employee?.employeeId;

      if (id == null) {
        return null;
      }

      const code =
        employee?.employee_code ??
        employee?.code ??
        employee?.employeeCode ??
        '';

      const displayName =
        resolveEmployeeDisplayName(
          employee,
          { preferArabic }
        ) || 'Unknown';

      return {
        ...employee,
        employee_id: String(id),
        id: String(id),
        employee_code: String(code),
        code: String(code),
        employee_name: displayName,
        name: displayName,
      };
    })
    .filter(Boolean);
}

export function resolvePositionLabelById(
  positionId,
  positions = [],
  { preferArabic = false } = {}
) {
  if (
    positionId == null ||
    !Array.isArray(positions) ||
    positions.length === 0
  ) {
    return '';
  }

  const found = positions.find(
    (item) =>
      String(
        item.id ??
          item.position_id
      ) === String(positionId)
  );

  if (!found) {
    return '';
  }

  return preferArabic
    ? found.title_ar ||
        found.name_ar ||
        found.title_en ||
        found.name_en ||
        found.name ||
        ''
    : found.title_en ||
        found.name_en ||
        found.title_ar ||
        found.name_ar ||
        found.name ||
        '';
}

export function resolvePositionDisplayName(
  source,
  {
    preferArabic = false,
    positions = [],
  } = {}
) {
  if (!source) return '';

  const positionValue =
    typeof source === 'object' &&
    source.position != null
      ? source.position
      : source;

  const positionId =
    source.position_id ??
    source.id ??
    (typeof positionValue === 'object'
      ? positionValue?.id
      : null) ??
    source.employee?.position_id;

  const catalogLabel =
    resolvePositionLabelById(
      positionId,
      positions,
      { preferArabic }
    );

  if (catalogLabel) {
    return String(catalogLabel).trim();
  }

  if (typeof positionValue === 'string') {
    const direct =
      positionValue.trim();

    if (direct && !preferArabic) {
      return direct;
    }
  }

  if (
    positionValue &&
    typeof positionValue === 'object'
  ) {
    const localized = preferArabic
      ? positionValue.title_ar ||
        positionValue.name_ar ||
        positionValue.position_name_ar ||
        positionValue.position_title_ar
      : positionValue.title_en ||
        positionValue.name_en ||
        positionValue.position_name ||
        positionValue.position_title_en;

    if (localized) {
      return String(localized).trim();
    }

    const fallback = preferArabic
      ? positionValue.title_en ||
        positionValue.name_en ||
        positionValue.name ||
        positionValue.title
      : positionValue.title_ar ||
        positionValue.name_ar ||
        positionValue.name ||
        positionValue.title;

    if (fallback) {
      return String(fallback).trim();
    }
  }

  const directName = preferArabic
    ? source.position_name_ar || ''
    : source.position_name ||
      source.position_name_ar ||
      '';

  if (directName) {
    return String(directName).trim();
  }

  if (
    preferArabic &&
    source.position_name
  ) {
    return String(
      source.position_name
    ).trim();
  }

  if (typeof positionValue === 'string') {
    return positionValue.trim();
  }

  return '';
}

function normalizeEmployeeActiveStatus(value) {
  return (
    value === 1 ||
    value === '1' ||
    value === true ||
    value === 'true'
  );
}

export function resolveLocalizedPayrollEmployee(
  employee,
  {
    preferArabic = false,
    listRow = null,
    positions = [],
  } = {}
) {
  if (!employee) return null;

  const name =
    listRow?.name ||
    listRow?.full_name ||
    resolveEmployeeDisplayName(
      employee,
      { preferArabic }
    ) ||
    employee.name ||
    employee.full_name ||
    employee.employee_name ||
    '';

  const position =
    listRow?.position ||
    resolvePositionDisplayName(
      employee,
      {
        preferArabic,
        positions,
      }
    ) ||
    (typeof employee.position === 'string'
      ? employee.position
      : '') ||
    '';

  const activeValue =
    employee.is_active ??
    listRow?.is_active ??
    employee.active ??
    listRow?.active ??
    0;

  return {
    ...employee,

    id:
      employee.id ??
      listRow?.id ??
      null,

    applicant_id:
      employee.applicant_id ??
      listRow?.applicant_id ??
      null,

    code:
      employee.code ??
      employee.employee_code ??
      listRow?.code ??
      listRow?.employee_code ??
      '',

    name,

    full_name:
      employee.full_name ??
      listRow?.full_name ??
      name,

    avatar:
      employee.avatar ??
      employee.image ??
      listRow?.avatar ??
      listRow?.image ??
      null,

    image:
      employee.image ??
      employee.avatar ??
      listRow?.image ??
      listRow?.avatar ??
      null,

    phone:
      employee.phone ??
      listRow?.phone ??
      '',

    position,

    department:
      employee.department ??
      listRow?.department ??
      '',

    shift:
      employee.shift ??
      listRow?.shift ??
      '',

    join_date:
      employee.join_date ??
      listRow?.join_date ??
      null,

    is_active:
      normalizeEmployeeActiveStatus(
        activeValue
      ),
  };
}

export function resolveDepartmentDisplayName(
  department,
  { preferArabic = false } = {}
) {
  if (!department) return '';

  if (typeof department === 'string') {
    return department;
  }

  if (preferArabic) {
    return (
      department.name_ar ||
      department.name_en ||
      department.name ||
      ''
    );
  }

  return (
    department.name_en ||
    department.name_ar ||
    department.name ||
    ''
  );
}

export function resolveEntityDisplayName(
  entity,
  { preferArabic = false } = {}
) {
  if (!entity) return '';

  if (typeof entity === 'string') {
    return entity;
  }

  if (preferArabic) {
    return (
      entity.name_ar ||
      entity.name_en ||
      entity.name ||
      entity.title_ar ||
      entity.title_en ||
      entity.title ||
      ''
    );
  }

  return (
    entity.name_en ||
    entity.name_ar ||
    entity.name ||
    entity.title_en ||
    entity.title_ar ||
    entity.title ||
    ''
  );
}

export function resolveShiftDisplayName(
  shift,
  { preferArabic = false } = {}
) {
  if (!shift) return '';

  if (typeof shift === 'string') {
    return shift;
  }

  if (preferArabic) {
    return (
      shift.name_ar ||
      shift.name_en ||
      shift.name ||
      ''
    );
  }

  return (
    shift.name_en ||
    shift.name_ar ||
    shift.name ||
    ''
  );
}

import {
  translateHolidayType,
} from '@/utils/requestLabels';

const HOLIDAY_TYPE_PLACEHOLDERS =
  new Set([
    'type',
    'holiday_type',
  ]);

function sanitizeHolidayTypeValue(value) {
  if (value == null) return '';

  const normalized =
    String(value).trim();

  if (!normalized) return '';

  if (
    HOLIDAY_TYPE_PLACEHOLDERS.has(
      normalized.toLowerCase()
    )
  ) {
    return '';
  }

  return normalized;
}

export function resolveHolidayTypeValue(
  source
) {
  const candidates = [
    source?.type,
    source?.holiday_type,
    source?.leave_type,
    source?.leave_category,
    source?.holiday?.type,
    source?.holiday?.holiday_type,
    source?.holiday?.leave_type,
    source?.holiday?.leave_category,
  ];

  for (const candidate of candidates) {
    const resolved =
      sanitizeHolidayTypeValue(
        candidate
      );

    if (resolved) {
      return resolved;
    }
  }

  return '';
}

export function resolveHolidayTypeLabel(
  type,
  t
) {
  const resolvedType =
    sanitizeHolidayTypeValue(type);

  if (!resolvedType) {
    return '—';
  }

  return translateHolidayType(
    t,
    resolvedType
  );
}
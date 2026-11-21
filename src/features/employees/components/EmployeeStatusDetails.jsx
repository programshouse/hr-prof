export default function EmployeeStatusDetails({ employee, labels }) {
  if (!employee) return null;

  const displayName = employee.full_name || employee.name || '—';
  const code = employee.code || employee.employeeId || '—';

  const rows = [
    { label: labels.position, value: employee.position || employee.role || '—' },
    { label: labels.department, value: employee.department || '—' },
    { label: labels.phone, value: employee.phone || '—' },
  ];

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <img
          src={
            employee.avatarUrl ||
            employee.image ||
            'https://ui-avatars.com/api/?name=Employee'
          }
          alt={displayName}
          className="size-12 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-600">{code}</p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-2 gap-3 text-sm">
            <span className="font-medium text-gray-700">{row.label}</span>
            <span className="text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

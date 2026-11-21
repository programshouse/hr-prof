import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import i18n from '@/i18n';

function formatTimeTo12h(timeStr) {
  if (!timeStr) return '--:--';
  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);
  if (Number.isNaN(h)) return timeStr;
  const isAr = i18n.language.startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12 = h % 12 || 12;
  return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
}

export const getFingerprintIssuesColumns = (onEdit, onDelete, allPositions, t) => {
  // ✅ Build lookup once (fast + fixes id type mismatch)
  const positionMap = new Map(
    (allPositions || []).map((p) => [
      String(p.id),
      p.title_en || p.title || p.name_en || p.name || p.description_en || '—'
    ])
  );

  // Helper function to get initials from first two words
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const firstTwo = parts.slice(0, 2);
    const initials = firstTwo.map((p) => p[0]).join("").toUpperCase();
    return initials || "U";
  };

  return [
  {
    header: t('fingerprintIssues.headers.employeeId'),
    accessorKey: 'employee_code',
    cell: ({ row }) => <div className="font-medium">{row.original.employee_code}</div>,
  },
  {
    header: t('fingerprintIssues.headers.name'),
    accessorKey: 'employee_name',
    cell: ({ row }) => {
      const positionName =
        positionMap.get(String(row.original.position_id)) || 'No Position';

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              {getInitials(row.original.employee_name)}
            </span>
          </div>

          <div>
            <div className="font-medium">{row.original.employee_name}</div>
            <div className="text-sm text-primary">{positionName}</div>
          </div>
        </div>
      );
    },
  },
  {
    header: t('fingerprintIssues.headers.joinDate'),
    accessorKey: 'date',
    cell: ({ row }) => <div className="font-medium">{row.original.date}</div>,
  },
  {
    header: t('fingerprintIssues.headers.checkIn'),
    accessorKey: 'first_in_at',
    cell: ({ row }) => (
      <div className={`font-medium ${row.original.missing_in ? 'text-red-600' : ''}`}>
        {formatTimeTo12h(row.original.first_in_at)}
      </div>
    ),
  },
  {
    header: t('fingerprintIssues.headers.checkOut'),
    accessorKey: 'last_out_at',
    cell: ({ row }) => (
      <div className={`font-medium ${row.original.missing_out ? 'text-red-600' : ''}`}>
        {formatTimeTo12h(row.original.last_out_at)}
      </div>
    ),
  },
  // {
  //   header: 'Phone',
  //   accessorKey: 'phone',
  //   cell: ({ row }) => <div className="font-medium">{row.original.phone}</div>,
  // },
  {
    header: t('fingerprintIssues.headers.action'),
    id: 'action',
    cell: ({ row }) => (
      <div className="border-default text-gray flex w-fit items-center rounded-[10px] border-[0.5px]">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-e-none hover:bg-slate-200"
          onClick={() => onEdit(row.original)}
        >
          <Edit className="size-4 transition-colors" />
        </Button>
        <div className="border-light-default h-5 w-[0.5px] border-[0.5px]"></div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-s-none hover:bg-red-100"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="size-4 transition-colors" />
        </Button>
      </div>
    ),
  },
];
};

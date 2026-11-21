import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function PermissionAdminSelect({
  admins = [],
  selectedAdminId = '',
  onChange,
}) {
  const { t } = useTranslation();
  const selectedAdmin =
    admins.find((admin) => String(admin.id) === String(selectedAdminId)) || null;

  return (
    <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center">
      <label className="text-3xl font-bold text-primary md:min-w-fit">
        {t('permissions.selectAdmin')}
      </label>

      <div className="relative w-full max-w-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-600 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
              {selectedAdmin
                ? `${selectedAdmin.name} (${selectedAdmin.email})`
                : t('permissions.chooseAdmin')}
              <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {admins.map((admin) => (
              <DropdownMenuItem
                key={admin.id}
                onClick={() => onChange?.(String(admin.id))}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span>{admin.name}</span>
                  <span className="text-xs text-slate-500">{admin.email}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
import { MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getEmployeeDisplayName,
  getEmployeeInitials,
  getEmployeePosition,
  getManagerRoleKey,
} from '../utils/structureUtils';

function PersonAvatar({ person, variant = 'default', size = 'md' }) {
  const isCeo = variant === 'ceo';
  const image = person?.image || person?.avatar || person?.photo || person?.profile_image;

  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 text-[10px]'
      : size === 'lg'
        ? 'h-14 w-14 text-sm'
        : 'h-11 w-11 text-xs';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white font-semibold shadow-md',
        sizeClass,
        isCeo ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
      )}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        getEmployeeInitials(person)
      )}
    </div>
  );
}

export default function StructurePersonCard({ person, variant = 'employee', className }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isManager = variant === 'manager' || variant === 'ceo';
  const isCeo = variant === 'ceo';
  const roleKey = isManager ? getManagerRoleKey(person) : null;
  const name = getEmployeeDisplayName(person);
  const position = getEmployeePosition(person);

  const handleViewProfile = () => {
    if (person?.id != null) navigate(`/employees/${person.id}`);
  };

  return (
    <div
      className={cn(
        'group relative bg-white text-center transition hover:shadow-md',
        isCeo &&
          'min-w-[260px] rounded-2xl border-2 border-violet-500 px-7 pb-6 pt-12 mt-6 shadow-[0_10px_30px_rgba(79,70,229,0.18)]',
        variant === 'manager' &&
          'min-w-[230px] rounded-xl border border-slate-200 px-6 pb-5 pt-8 shadow-sm',
        variant === 'employee' &&
          'w-full max-w-[112px] rounded-xl border border-slate-200 px-3 pb-4 pt-6 mb-4 shadow-sm',
        className
      )}
    >
      {person?.id != null && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-7 w-7 p-0"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewProfile}>
              {t('structure.viewProfile')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2',
          isCeo ? '-top-7' : '-top-5'
        )}
      >
        <PersonAvatar
          person={person}
          variant={isCeo ? 'ceo' : 'default'}
          size={isManager ? 'lg' : 'sm'}
        />
      </div>

      <p
        className={cn(
          'truncate font-bold text-slate-900',
          isManager ? 'text-sm' : 'text-[11px]'
        )}
      >
        {name}
      </p>

      {roleKey ? (
        <p className="mt-1 truncate text-sm font-bold text-violet-600">
          {t(`structure.roles.${roleKey}`)}
        </p>
      ) : position ? (
        <p className="mt-1 truncate text-[11px] text-slate-500">{position}</p>
      ) : null}

      {isManager && position && roleKey ? (
        <p className="mt-1 truncate text-xs text-slate-500">{position}</p>
      ) : null}
    </div>
  );
}
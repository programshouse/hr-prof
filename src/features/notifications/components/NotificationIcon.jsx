import {
  Bell,
  CalendarClock,
  Palmtree,
  CreditCard,
  Home,
  Clock,
  GitBranch,
  LogOut,
  CircleAlert,
  Fingerprint,
  Medal,
  Scale,
  FileClock,
  ShieldAlert,
} from 'lucide-react';
import { getNotificationIconKey } from '../utils/notificationConfig';

const ICONS = {
  leave: { Icon: CalendarClock, className: 'text-blue-600' },
  holiday: { Icon: Palmtree, className: 'text-emerald-600' },
  loan: { Icon: CreditCard, className: 'text-violet-600' },
  remotely: { Icon: Home, className: 'text-sky-600' },
  overtime: { Icon: Clock, className: 'text-orange-600' },
  branch_transfer: { Icon: GitBranch, className: 'text-indigo-600' },
  resignation: { Icon: LogOut, className: 'text-rose-600' },
  exception: { Icon: CircleAlert, className: 'text-amber-600' },
  fingerprint_issue: { Icon: Fingerprint, className: 'text-slate-600' },
  penalty: { Icon: Scale, className: 'text-red-600' },
  reward: { Icon: Medal, className: 'text-yellow-600' },
  contract: { Icon: FileClock, className: 'text-teal-600' },
  national_id: { Icon: ShieldAlert, className: 'text-pink-600' },
  default: { Icon: Bell, className: 'text-slate-600' },
};

export default function NotificationIcon({ notification }) {
  const iconKey = getNotificationIconKey(notification);
  const { Icon, className } = ICONS[iconKey] || ICONS.default;

  return <Icon className={`h-4 w-4 ${className}`} />;
}

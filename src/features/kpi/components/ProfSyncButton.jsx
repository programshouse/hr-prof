import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import axiosClient from '@/services/http/axiosClient';
import { useAuthStore } from '@/services/auth/auth.store';

export default function ProfSyncButton({ type, year, month, disabled = false, onBusyChange }) {
  const { i18n } = useTranslation();
  const ar = i18n.language?.startsWith('ar');
  const qc = useQueryClient();
  const admin = useAuthStore((state) => state.user?.is_super_admin);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  // The HR API remains responsible for authorizing the sync request.
  // Do not hide the hours action when the persisted admin flag is absent.
  if (type !== 'hours' && ![true, 1, '1', 'true'].includes(admin)) return null;

  const sync = async () => {
    if (lock.current || disabled) return;
    if (!window.confirm(ar ? `مزامنة بيانات ${month}/${year} من PROF؟ قد يتم تحديث البيانات الحالية.` : `Sync PROF data for ${month}/${year}? Existing values may be updated.`)) return;
    lock.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try {
      const base = String(axiosClient.defaults.baseURL || '').replace(/\/+$/, '').replace(/\/v1$/, '');
      const suffix = { kpi: '/medical-writer-kpi/sync', hours: '/worked-hours/sync', tasks: '/sync' }[type];
      const { data } = await axiosClient.post(`${base}/integrations/prof${suffix}`, { year, month, dry_run: false });
      if (data?.status === false) throw new Error(data.message || 'Sync failed');
      await qc.invalidateQueries();
      const stats = data?.stats;
      toast.success(ar ? 'تمت المزامنة بنجاح' : 'PROF sync completed', {
        description: stats ? Object.entries(stats).filter(([, value]) => typeof value === 'number').map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`).join(' · ') : data?.message,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || (ar ? 'فشلت المزامنة' : 'Sync failed'));
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  return (
    <Button type="button" onClick={sync} disabled={busy || disabled} className="gap-2">
      <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
      {busy ? (ar ? 'جارٍ المزامنة...' : 'Syncing...') : (ar ? 'مزامنة من PROF' : 'Sync from PROF')}
    </Button>
  );
}

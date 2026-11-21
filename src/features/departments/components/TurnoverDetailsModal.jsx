// src/features/departments/components/TurnoverDetailsModal.jsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function OptionCard({ title, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-visible:ring-primary w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'rounded-2xl'
      )}
    >
      <Card
        className={cn(
          'rounded-2xl border bg-white p-6 shadow-sm transition',
          selected ? 'border-primary' : 'border-slate-200 hover:border-slate-300'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <Icon className="size-7 text-slate-700" />
          </div>

          <div className="text-base font-semibold text-slate-700">{title}</div>

          {/* radio dot */}
          <div
            className={cn(
              'mt-1 size-5 rounded-full border-2',
              selected ? 'border-primary' : 'border-slate-300'
            )}
          >
            {selected && <div className="bg-primary m-1 size-2.5 rounded-full" />}
          </div>
        </div>
      </Card>
    </button>
  );
}

/**
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean)=>void
 * - value: 'active' | 'inactive'
 * - onChange: (value)=>void
 */
export default function TurnoverDetailsModal({ open, onOpenChange, value, onChange }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border max-w-[560px] rounded-2xl border bg-[#F5F7FF] p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OptionCard
            title={t('navigation.active')}
            icon={UserCheck}
            selected={value === 'active'}
            onClick={() => onChange?.('active')}
          />

          <OptionCard
            title={t('navigation.inactive')}
            icon={UserX}
            selected={value === 'inactive'}
            onClick={() => onChange?.('inactive')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

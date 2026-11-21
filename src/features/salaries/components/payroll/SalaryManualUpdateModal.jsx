import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { salariesApi } from '../../api/salariesApi';
import DatePickerInput from '@/components/ui/date-picker-input';

// helper: accept ISO/date/datetime and return YYYY-MM-DD
function toDateInputValue(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function SalaryManualUpdateModal({
  open,
  onOpenChange,
  employeeId,
  onSuccess,

  // ✅ pass the month already in the sheet (string or Date)
  // examples: "2026-02-01", "2026-02-11T00:00:00Z", Date()
  initialMonth = '',
  initialBonus = '',
  initialDeduction = '',
  initialNote = '',
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    month: '',
    bonus: '',
    deduction: '',
    note: '',
  });

  // ✅ when modal opens, fill form with sheet values or current date
  useEffect(() => {
    if (!open) return;

    setForm({
      month: toDateInputValue(initialMonth) || toDateInputValue(new Date()),
      bonus: initialBonus?.toString?.() ?? (initialBonus || ''),
      deduction: initialDeduction?.toString?.() ?? (initialDeduction || ''),
      note: initialNote || '',
    });
  }, [open, initialMonth, initialBonus, initialDeduction, initialNote]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await salariesApi.postSalaryAdjustment(employeeId, {
        month: form.month, // already YYYY-MM-DD
        bonus: Number(form.bonus || 0),
        deduction: Number(form.deduction || 0),
        note: form.note || null,
      });

      toast.success('Salary updated', {
        description: 'Manual salary adjustment added successfully',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to update salary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Salary Update</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Month</Label>
            <DatePickerInput
              value={form.month}
              onChange={(v) => handleChange('month', v)}
            />
          </div>

          <div>
            <Label>Bonus</Label>
            <Input
              type="number"
              placeholder="0"
              value={form.bonus}
              onChange={(e) => handleChange('bonus', e.target.value)}
            />
          </div>

          <div>
            <Label>Deduction</Label>
            <Input
              type="number"
              placeholder="0"
              value={form.deduction}
              onChange={(e) => handleChange('deduction', e.target.value)}
            />
          </div>

          <div>
            <Label>Note</Label>
            <Input
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

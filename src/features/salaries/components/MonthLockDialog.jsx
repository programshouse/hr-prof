import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function MonthLockDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  monthLabel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lock Month</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Are you sure you want to lock:
            <span className="ml-1 font-semibold text-gray-900">{monthLabel}</span> ?
          </p>

          <p className="text-xs text-red-500">
            ⚠️ After locking, this month will no longer be editable.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Locking...' : 'Confirm Lock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
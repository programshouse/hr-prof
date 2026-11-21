import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteSalaryUpdateDialog({ open, onOpenChange, salaryUpdate, onConfirm, isDeleting }) {
  const getEmployeeName = () => {
    const employee = salaryUpdate?.employee;
    const applicant = employee?.applicant;
    
    if (applicant?.first_name && applicant?.last_name) {
      return `${applicant.first_name} ${applicant.last_name}`;
    }
    
    if (salaryUpdate?.applicant?.first_name && salaryUpdate?.applicant?.last_name) {
      return `${salaryUpdate.applicant.first_name} ${salaryUpdate.applicant.last_name}`;
    }
    
    return salaryUpdate?.employee?.name || salaryUpdate?.name || `Employee ID: ${salaryUpdate?.employee_id || salaryUpdate?.id}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Icon */}
          <div className="bg-red-50 border-red-200 text-red-600 flex size-12 items-center justify-center rounded-full border-2">
            <Trash2 />
          </div>

          {/* Title */}
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">
              Are you sure you want to delete salary update for {getEmployeeName()}?
            </DialogTitle>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex w-full gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

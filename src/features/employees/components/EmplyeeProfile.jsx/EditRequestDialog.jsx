// EditRequestDialog.jsx — DEPRECATED
//
// This dialog built every request type from one generic field list, which is
// why creating a leave failed with "The from field is required.": the leave
// endpoint needs `from` and `to` and the form never collected them.
//
// It has been replaced by RequestFormDialog, which handles create AND edit for
// all six types and takes its fields from requestTypes.config.js, so each type
// sends exactly the keys its endpoint expects.
//
// Kept only so older imports keep resolving. Import RequestFormDialog directly
// in new code; this file can be deleted once nothing references it.

import RequestFormDialog from './RequestFormDialog';

export default function EditRequestDialog({
  open,
  onOpenChange,
  request,
  requestType,
  employeeId,
  employeeName,
  onUpdate,
}) {
  return (
    <RequestFormDialog
      open={open}
      onOpenChange={onOpenChange}
      request={request}
      requestType={requestType}
      employeeId={employeeId ?? request?.employee_id}
      employeeName={employeeName}
      onSubmit={({ payload }) => onUpdate(request?.id, payload)}
    />
  );
}

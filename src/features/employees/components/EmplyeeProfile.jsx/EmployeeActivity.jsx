import EmployeeAttendanceTable from "./EmployeeAttendanceTable.jsx";

export default function EmployeeActivity({ attendances = [] }) {
  return (
    <div className="space-y-6">
      <EmployeeAttendanceTable attendances={attendances} />
    </div>
  );
}

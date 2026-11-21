// src/features/overtime/components/OvertimeSheetTable.jsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function OvertimeSheetTable({ data = [], loading }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>ID</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Overtime</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length ? (
            data.map((row) => (
              <TableRow key={row.employee_id}>
                <TableCell>{row.employee_code}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {row.employee_name.slice(0, 2).toUpperCase()}
                    </div>
                    {row.employee_name}
                  </div>
                </TableCell>

                <TableCell>{row.employee_department}</TableCell>
                <TableCell>{row.employee_position}</TableCell>

                <TableCell>
                  {row.total_overtime_minutes} min
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
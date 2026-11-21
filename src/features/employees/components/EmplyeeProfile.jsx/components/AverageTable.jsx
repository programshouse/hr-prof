import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function AverageTable({ details }) {
  return (
    <Card className="bg-background rounded-xl border flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Average Details</CardTitle>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 text-gray-800">
              <TableHead>Department</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Salary</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {details.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.department}</TableCell>
                <TableCell>{`${row.amount}%`}</TableCell>
                <TableCell>{row.salary * row.amount / 100}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

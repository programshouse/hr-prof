import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function KpiTable({ employee }) {
  const kpiItems = employee?.kpi_items || [];

  if (!kpiItems || kpiItems.length === 0) {
    return null;
  }

  return (
    <Card className="bg-background rounded-xl border flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">KPI Items</CardTitle>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow className="bg-gray-100 text-gray-800">
              <TableHead>Name</TableHead>
              <TableHead>Max Score</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {kpiItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.kpi_item?.item || item.custom_item}</TableCell>
                <TableCell>{item.max_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatValueWithUnitSuffix } from '@/utils/durationLabels';

export default function SalaryCalculationSheet({ open, onOpenChange, employeeData }) {
  const { t } = useTranslation();

  const formatItemValue = (item) => {
    if (item.type === 'amount') return `EGP ${item.value}`;
    if (item.type === 'hours') return formatValueWithUnitSuffix(t, item.value, 'hour');
    return formatValueWithUnitSuffix(t, item.value, 'day');
  };

  const handleExport = () => {
    const employeeName = employeeData?.employee_name || 'Employee';
    const employeeCode = employeeData?.employee_code || 'EMP001';
    const currentDate = new Date().toLocaleDateString();
    
    // Create CSV content
    const csvContent = [
      `Salary Calculation Report - ${currentDate}`,
      `Employee: ${employeeName} (${employeeCode})`,
      `Position: ${employeeData?.position || 'Position'}`,
      `Department: ${employeeData?.department || 'Department'}`,
      '',
      'Item,Value,Type',
      ...salaryItems.map(item =>
        `"${item.label}","${formatItemValue(item)}","${item.type}"`
      ),
      '',
      `"Total Salary","EGP ${salaryData.netSalary}","Final Amount"`
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salary_calculation_${employeeCode}_${currentDate.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salaryData = {
    salary: 7500,
    attendanceDays: 22,
    sickDeduction: 200,
    lateDeduction: 150,
    excusedAbsenceDays: 1,
    deduction: 350,
    netSalary: 7150,
    workedOnDayOff: 2,
    extraTime: 5,
    kpi: 500,
    employeeFund: 100,
    remainingBalance: 6800,
    leaveBalance: 15,
    systemVsAttendanceDifference: 2,
  };

  const salaryItems = [
    { label: 'Salary', value: salaryData.salary, type: 'amount' },
    { label: 'Attendance Days', value: salaryData.attendanceDays, type: 'days' },
    { label: 'Sick Deduction', value: salaryData.sickDeduction, type: 'amount' },
    { label: 'Late Deduction', value: salaryData.lateDeduction, type: 'amount' },
    { label: 'Excused Absence Days', value: salaryData.excusedAbsenceDays, type: 'days' },
    { label: 'Deduction', value: salaryData.deduction, type: 'amount' },
    { label: 'Net Salary', value: salaryData.netSalary, type: 'amount', highlight: true },
    { label: 'Worked On Day Off', value: salaryData.workedOnDayOff, type: 'days' },
    { label: 'Extra Time', value: salaryData.extraTime, type: 'hours' },
    { label: 'KPI', value: salaryData.kpi, type: 'amount' },
    { label: 'Employee Fund', value: salaryData.employeeFund, type: 'amount' },
    { label: 'Remaining Balance', value: salaryData.remainingBalance, type: 'amount' },
    { label: 'Leave Balance', value: salaryData.leaveBalance, type: 'days' },
    { label: 'System Vs Attendance Difference', value: salaryData.systemVsAttendanceDifference, type: 'days' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Salary Calculation</DialogTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              className="h-6 w-6"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">
              {employeeData?.employee_name || 'Employee Name'} - {employeeData?.employee_code || 'EMP001'}
            </h3>
            <p className="text-sm text-gray-600">
              {employeeData?.position || 'Position'} - {employeeData?.department || 'Department'}
            </p>
          </div>

          {/* Salary Calculation Sheet */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="grid grid-cols-1 gap-1">
              {salaryItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 ${
                    item.highlight ? 'bg-blue-50 font-semibold' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className={`text-sm font-medium ${
                    item.highlight ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {formatItemValue(item)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Salary */}
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              Total Salary: EGP {salaryData.netSalary}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

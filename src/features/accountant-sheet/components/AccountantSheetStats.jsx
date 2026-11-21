
function formatMoney(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

export default function AccountantSheetStats({ totalSalaries = 0 }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-muted-foreground">Total Salaries</div>
      <div className="mt-2 text-2xl font-semibold text-foreground">
        {formatMoney(totalSalaries)}
      </div>
    </div>
  );
}
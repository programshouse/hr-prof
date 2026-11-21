export const parseMoneyValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isNaN(numeric) ? 0 : numeric;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

export const formatMoney = (value) => {
  const safeValue = parseMoneyValue(value);
  return safeValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const displayAmount = (value, showZero = false) => {
  const num = parseMoneyValue(value);
  if (!showZero && num === 0) return '--';
  return formatMoney(num);
};

export function SummaryMetricsBar({ items }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#EBF0FE] px-6 py-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="text-center sm:text-start">
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p className="text-base font-bold text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CalcCard({ title, children, footer }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
        {title}
      </h3>
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

export function CalcDataTable({
  columns,
  rows,
  emptyMessage,
  valueClassName = 'font-semibold text-slate-800',
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-50">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-2.5 text-xs font-semibold text-slate-500 ${
                col.align === 'end' ? 'text-end' : 'text-start'
              }`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-6 text-center text-sm text-slate-400"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={row.id ?? idx} className="border-t border-slate-100">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2.5 text-sm text-slate-600 ${
                    col.align === 'end'
                      ? `text-end ${valueClassName}`
                      : 'text-start'
                  }`}
                >
                  {row[col.key] ?? '--'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function CalcCardFooter({ label, value, variant = 'green' }) {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-[#EBF0FE] text-blue-700',
    yellow: 'bg-amber-50 text-amber-800',
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 text-sm font-bold ${
        variants[variant] ?? variants.green
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

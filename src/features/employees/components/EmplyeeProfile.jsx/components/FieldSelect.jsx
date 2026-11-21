export default function FieldSelect({ label, isEditing, value, options, onChange, displayValue }) {
  if (isEditing) {
    return (
      <div>
        <label className="text-sm text-muted-foreground block">{label}</label>
        <select
          className="w-full border rounded-md px-2 py-1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // SHOW MODE — match design
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-primary truncate">
        {displayValue || "--"}
      </span>
    </div>
  );
}

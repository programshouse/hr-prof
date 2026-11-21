export default function Field({ label, value, onChange, isEditing, textarea = false, displayValue }) {
  if (isEditing) {
    return (
      <div>
        <label className="text-sm text-muted-foreground block">{label}</label>

        {textarea ? (
          <textarea
            className="w-full border rounded-md px-2 py-1"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="w-full border rounded-md px-2 py-1"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  }

  // SHOW MODE — match design
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-primary truncate">
        {displayValue || value || "--"}
      </span>
    </div>
  );
}

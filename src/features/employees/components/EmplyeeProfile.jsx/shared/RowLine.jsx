// Simple read-only row display component
export default function RowLine({ label, value }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 px-2 py-1 text-sm rounded-lg hover:bg-gray-100">
      <span className="font-medium whitespace-nowrap">{label}</span>
      <span className="text-primary font-semibold whitespace-nowrap">{value || '--'}</span>
    </div>
  );
}

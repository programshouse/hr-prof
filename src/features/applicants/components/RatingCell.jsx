// src/features/applicants/components/RatingCell.jsx
export default function RatingCell({ value }) {
  const v = Number(value);

  if (!Number.isFinite(v)) {
    return <span className="text-xs font-medium text-slate-400">--</span>;
  }

  return (
    <span className="text-xs font-medium text-slate-700">
      {v}
    </span>
  );
}
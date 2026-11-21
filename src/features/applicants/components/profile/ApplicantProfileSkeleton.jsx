export default function ApplicantProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-72 rounded-xl bg-slate-200" />
        <div className="h-72 rounded-xl bg-slate-200" />
        <div className="h-72 rounded-xl bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-200 md:col-span-2 xl:col-span-3" />
      </div>
    </div>
  );
}
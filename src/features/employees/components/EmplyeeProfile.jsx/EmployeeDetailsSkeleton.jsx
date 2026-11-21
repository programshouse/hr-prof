import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function EmployeeDetailsSkeleton() {
  // helper لصفوف label / value زي EmployeeInfoCard
  const renderLabelValueRows = (rows = 4) => (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-2"
        >
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
      ))}
    </>
  );

  // helper لصفوف full-width (زي documents / average details)
  const renderFullWidthRows = (rows = 3) => (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-9 w-full rounded bg-slate-200"
        />
      ))}
    </>
  );

  return (
    <div className="grid gap-6 md:gap-10 xl:gap-14 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 my-10">
      {/* Basic Information skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderLabelValueRows(5)}
        </CardContent>
      </Card>

      {/* Contact Information skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderLabelValueRows(5)}
        </CardContent>
      </Card>

      {/* Documents skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderFullWidthRows(3)}
        </CardContent>
      </Card>

      {/* Work Related Details skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderLabelValueRows(4)}
        </CardContent>
      </Card>

      {/* Contract Details skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderLabelValueRows(4)}
        </CardContent>
      </Card>

      {/* Salary / Average skeleton */}
      <Card className="rounded-xl border bg-background animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-2">
          {renderFullWidthRows(4)}
        </CardContent>
      </Card>
    </div>
  );
}

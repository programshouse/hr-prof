import StructurePersonCard from './StructurePersonCard';

const SCROLL_THRESHOLD = 9;

export default function StructureTeamColumn({
  manager,
  variant = 'manager',
  hideEmployees = false,
}) {
  const employees = Array.isArray(manager?.employees) ? manager.employees : [];
  const useScroll = employees.length > SCROLL_THRESHOLD;
  const isCeo = variant === 'ceo';

  return (
    <div className="flex w-full flex-col items-center">
      <StructurePersonCard person={manager} variant={variant} />

      {!hideEmployees && (
        <>
          <div className="flex h-12 w-px flex-col items-center">
            <div className="h-full w-px bg-slate-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          </div>

          {employees.length > 0 ? (
            <div
              className={
                useScroll
                  ? 'max-h-[330px] w-full overflow-y-auto rounded-2xl bg-white p-4 shadow-sm'
                  : 'w-full rounded-2xl bg-transparent p-0'
              }
            >
              <div
                className={
                  isCeo
                    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
                    : 'grid grid-cols-2 justify-items-center gap-4'
                }
              >
                {employees.map((employee) => (
                  <StructurePersonCard
                    key={String(employee?.id ?? getEmployeeKey(employee))}
                    person={employee}
                    variant="employee"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">
              —
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getEmployeeKey(employee) {
  return `${employee?.name ?? 'employee'}-${employee?.position ?? ''}`;
}
import { useMemo } from 'react';

import { partitionManagers } from '../utils/structureUtils';
import StructureTeamColumn from './StructureTeamColumn';

export default function StructureOrgChart({ managers = [] }) {
  const { ceos, others } = useMemo(() => partitionManagers(managers), [managers]);

  if (!managers.length) return null;

  return (
    <div className="w-full overflow-hidden pb-10">
      <div className="mx-auto flex  flex-col items-center px-4">
        {ceos.length > 0 && (
          <div className="relative flex w-full flex-col items-center">
            <div className="flex justify-center">
              {ceos.map((ceo) => (
                <StructureTeamColumn key={ceo.id} manager={ceo} variant="ceo" hideEmployees />
              ))}
            </div>

            {others.length > 0 && (
              <>
                <div className="mt-8 h-10 w-px bg-slate-300" />
                <div className="relative h-10 w-[78%] max-w-5xl border-t border-slate-300">
                  {others.map((manager, index) => {
                    const left =
                      others.length === 1
                        ? '50%'
                        : `${(index / (others.length - 1)) * 100}%`;

                    return (
                      <span
                        key={manager.id}
                        className="absolute top-0 h-10 w-px bg-slate-300"
                        style={{ left }}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {others.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
            {others.map((manager) => (
              <StructureTeamColumn key={manager.id} manager={manager} variant="manager" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
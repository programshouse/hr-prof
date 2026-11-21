import { useTranslation } from 'react-i18next';

export default function PermissionsModuleCard({
  module,
  selectedIds,
  onTogglePermission,
  onSelectAllModule,
}) {
  const { t } = useTranslation();
  const isAllSelected =
    module.actions.length > 0 &&
    module.actions.every((action) => selectedIds.has(action.id));

  const selectedCount = module.actions.filter((action) =>
    selectedIds.has(action.id)
  ).length;

  const isPartiallySelected =
    selectedCount > 0 && selectedCount < module.actions.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#1f2c44] px-4 py-3">
        <h3 className="text-sm font-medium text-white">{module.name}</h3>
      </div>

      <div className="px-4 py-4">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            id={`select-all-${module.id}`}
            checked={isAllSelected}
            ref={(checkbox) => {
              if (checkbox) {
                checkbox.indeterminate = isPartiallySelected;
              }
            }}
            onChange={(e) => onSelectAllModule(module, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor={`select-all-${module.id}`}
            className="cursor-pointer text-sm text-primary underline"
          >
            {t('permissions.selectAll')}
          </label>
        </div>

        <div className="space-y-3">
          {module.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`permission-${action.id}`}
                checked={selectedIds.has(action.id)}
                onChange={() => onTogglePermission(action.id)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`permission-${action.id}`}
                className="cursor-pointer text-sm font-medium text-slate-800"
              >
                {action.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
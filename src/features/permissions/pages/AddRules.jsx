import React, { useMemo, useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACTION_OPTIONS = [
  'View Attendance',
  'Edit Attendance',
  'Delete Attendance',
  'Create Attendance',
  'Approve Attendance',
  'View Leave',
  'Edit Leave',
  'Delete Leave',
  'Create Leave',
  'Approve Leave',
  'View Payroll',
  'Edit Payroll',
  'Delete Payroll',
  'Create Payroll',
  'View Employee',
  'Edit Employee',
  'Delete Employee',
  'Create Employee',
];

const AddRules = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      name: 'Attendance',
      actions: [
        'View Attendance',
        'Edit Attendance',
        'Delete Attendance',
        'Export Attendance',
      ],
    },
    {
      id: 2,
      name: 'Leave Management',
      actions: ['View Leave', 'Edit Leave', 'Delete Leave'],
    },
    {
      id: 3,
      name: 'Payroll',
      actions: ['View Payroll', 'Edit Payroll', 'Delete Payroll'],
    },
    {
      id: 4,
      name: 'Employee Management',
      actions: ['View Employee', 'Edit Employee', 'Delete Employee'],
    },
  ]);

  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleAction, setNewModuleAction] = useState('');

  // add action modal state
  const [addingActionToModule, setAddingActionToModule] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');

  const totalActions = useMemo(
    () => modules.reduce((sum, module) => sum + module.actions.length, 0),
    [modules]
  );

  const resetModal = () => {
    setShowAddModule(false);
    setNewModuleName('');
    setNewModuleAction('');
  };

  const openAddActionModal = (moduleId) => {
    setAddingActionToModule(moduleId);
    setSelectedAction('');
  };

  const closeAddActionModal = () => {
    setAddingActionToModule(null);
    setSelectedAction('');
  };

  const handleAddModule = () => {
    const trimmedName = newModuleName.trim();
    if (!trimmedName) return;

    const exists = modules.some(
      (module) => module.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) return;

    const newModule = {
      id: Date.now(),
      name: trimmedName,
      actions: newModuleAction ? [newModuleAction] : [],
    };

    setModules((prev) => [...prev, newModule]);
    resetModal();
  };

  const handleDeleteModule = (moduleId) => {
    setModules((prev) => prev.filter((module) => module.id !== moduleId));
  };

  const handleSaveNewAction = () => {
    if (!addingActionToModule || !selectedAction) return;

    setModules((prev) =>
      prev.map((module) => {
        if (module.id !== addingActionToModule) return module;

        const alreadyExists = module.actions.some(
          (action) => action.toLowerCase() === selectedAction.toLowerCase()
        );

        if (alreadyExists) return module;

        return {
          ...module,
          actions: [...module.actions, selectedAction],
        };
      })
    );

    closeAddActionModal();
  };

  const handleDeleteAction = (moduleId, actionIndex) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              actions: module.actions.filter((_, index) => index !== actionIndex),
            }
          : module
      )
    );
  };

  const currentModule = modules.find((module) => module.id === addingActionToModule);

  const availableActions = currentModule
    ? ACTION_OPTIONS.filter(
        (option) =>
          !currentModule.actions.some(
            (action) => action.toLowerCase() === option.toLowerCase()
          )
      )
    : [];

  return (
    <div>
      <div>
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[32px] font-semibold tracking-tight text-[#4f46c9]">
                Permission Modules
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create modules and define the actions available in each module.
              </p>
            </div>

            <button
              onClick={() => setShowAddModule(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#4f46c9]"
            >
              <Plus className="h-4 w-4" />
              Add New Module
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="mb-3 hidden rounded-xl border border-slate-200 bg-[#eef0f3] px-6 py-4 md:grid md:grid-cols-[220px_1fr]">
          <div className="text-sm font-semibold text-slate-800">Module Name</div>
          <div className="text-sm font-semibold text-slate-800">Actions</div>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid min-h-[92px] grid-cols-1 md:grid-cols-[4px_220px_1fr]">
                <div className="bg-primary" />

                <div className="px-5 py-5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {module.name}
                  </h3>
                </div>

                <div className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {module.actions.map((action, index) => (
                      <div
                        key={`${module.id}-${action}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <span>{action}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAction(module.id, index)}
                          className="text-slate-500 transition hover:text-slate-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => openAddActionModal(module.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#dcdcff] bg-[#f8f8ff] px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-[#efefff]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Action
                    </button>

                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                      title="Delete Module"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {modules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No modules created yet. Start by adding your first module.
            </p>
          </div>
        )}

        {/* Add Module Modal */}
        {showAddModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
            <div className="w-full max-w-2xl rounded-md bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-[28px] font-semibold text-slate-900">
                    Add New Module
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Quickly add a new module and select its first action.
                  </p>
                </div>

                <button
                  onClick={resetModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="Attendance"
                    autoFocus
                    className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Action
                  </label>

                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 flex items-center justify-between">
                          {newModuleAction || 'Select action'}
                          <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {ACTION_OPTIONS.map((action) => (
                          <DropdownMenuItem
                            key={action}
                            onClick={() => setNewModuleAction(action)}
                            className="cursor-pointer"
                          >
                            {action}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4">
                <button
                  onClick={resetModal}
                  className="min-w-[110px] rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddModule}
                  className="min-w-[110px] rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4f46c9]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Action Modal */}
        {addingActionToModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
            <div className="w-full max-w-2xl rounded-md bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-[28px] font-semibold text-slate-900">
                    Add New Action
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Select an action for{' '}
                    <span className="font-medium text-slate-600">
                      {currentModule?.name}
                    </span>
                    .
                  </p>
                </div>

                <button
                  onClick={closeAddActionModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={currentModule?.name || ''}
                    readOnly
                    className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Action
                  </label>

                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 flex items-center justify-between">
                          {selectedAction || 'Select action'}
                          <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {availableActions.map((action) => (
                          <DropdownMenuItem
                            key={action}
                            onClick={() => setSelectedAction(action)}
                            className="cursor-pointer"
                          >
                            {action}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4">
                <button
                  onClick={closeAddActionModal}
                  className="min-w-[110px] rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveNewAction}
                  className="min-w-[110px] rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4f46c9]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRules;
import React, { useState } from "react";
import { Plus, X, Trash2, ChevronDown } from "lucide-react";

const ACTION_OPTIONS = [
  "View Attendance",
  "Edit Attendance",
  "Delete Attendance",
  "Create Attendance",
  "Approve Attendance",
  "View Leave",
  "Edit Leave",
  "Delete Leave",
  "Create Leave",
  "Approve Leave",
  "View Payroll",
  "Edit Payroll",
  "Delete Payroll",
  "Create Payroll",
  "View Employee",
  "Edit Employee",
  "Delete Employee",
  "Create Employee",
];

const ModuleCard = ({
  module,
  onAddAction,
  onDeleteAction,
  onDeleteModule,
}) => {
  const [showAddAction, setShowAddAction] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const handleAddAction = () => {
    if (!selectedAction) return;
    onAddAction(module.id, selectedAction);
    setSelectedAction("");
    setShowAddAction(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-h-[92px] grid-cols-1 md:grid-cols-[4px_220px_1fr]">
          
          {/* Left accent */}
          <div className="bg-[#6c63ff]" />

          {/* Module name */}
          <div className="px-5 py-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {module.name}
            </h3>
          </div>

          {/* Actions */}
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2 items-center">

              {module.actions.map((action, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {action}

                  <button
                    onClick={() => onDeleteAction(module.id, index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add Action Button */}
              <button
                onClick={() => setShowAddAction(true)}
                className="inline-flex items-center gap-1 rounded-full border border-[#dcdcff] bg-[#f8f8ff] px-3 py-1.5 text-xs font-medium text-[#5b50d6] hover:bg-[#efefff]"
              >
                <Plus size={14} />
                Add Action
              </button>

              {/* Delete Module */}
              <button
                onClick={() => onDeleteModule(module.id)}
                className="ml-auto text-slate-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Add Action Modal */}
      {showAddAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-xl">

            <h3 className="text-lg font-semibold mb-4">
              Add Action
            </h3>

            <label className="text-sm font-medium text-slate-700">
              Action
            </label>

            <div className="relative mt-2">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm appearance-none"
              >
                <option value="">Select Action</option>

                {ACTION_OPTIONS.filter(
                  (action) => !module.actions.includes(action)
                ).map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddAction(false)}
                className="px-4 py-2 text-sm border rounded-md text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={handleAddAction}
                className="px-4 py-2 text-sm rounded-md bg-[#5b50d6] text-white"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ModuleCard;
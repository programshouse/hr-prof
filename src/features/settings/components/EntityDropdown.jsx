// src/features/setting/SystemSettingsEntityDropdown.jsx
import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import SystemSettingsEditDeleteActions from '../../features/settings/components/EditDeleteActions';
import SystemSettingsAddEditEntityModal from '../../features/settings/components/AddEditEntityModal';

export default function SystemSettingsEntityDropdown({
  label,
  placeholder,
  items,
  value,
  onChange,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const [editTarget, setEditTarget] = useState(null); // old name

  const filtered = items.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setModalValue('');
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalValue(item);
    setEditTarget(item);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    const trimmed = modalValue.trim();
    if (!trimmed) return;

    if (editTarget == null) {
      // add
      onAdd(trimmed);
      onChange(trimmed);
    } else {
      // edit
      onEdit(editTarget, trimmed);
      if (value === editTarget) onChange(trimmed);
    }
    setModalOpen(false);
  };

  return (
    <div className="relative w-full">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 focus:outline-none"
      >
        <span className={value ? '' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {/* Panel – full width of input */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          {/* Search + Add New */}
          <div className="mb-3 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            />
            <button
              type="button"
              className="text-primary inline-flex items-center gap-1 self-start text-xs font-medium"
              onClick={openAddModal}
            >
              <Plus className="h-3 w-3" />
              Add New
            </button>
          </div>

          {/* List */}
          <div className="max-h-64 space-y-1 overflow-y-auto text-xs">
            {filtered.map((item) => (
              <div
                key={item}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  {item}
                </button>

                <SystemSettingsEditDeleteActions
                  onEdit={() => openEditModal(item)}
                  onDelete={() => onDelete(item)}
                />
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="px-1 py-2 text-xs text-slate-400">No results found.</p>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <SystemSettingsAddEditEntityModal
        open={modalOpen}
        label={label}
        value={modalValue}
        onChange={setModalValue}
        onCancel={() => setModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
}

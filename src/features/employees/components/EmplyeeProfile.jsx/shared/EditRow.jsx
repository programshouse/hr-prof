// Edit mode row wrapper showing label, current value, and edit control
export default function EditRow({ label, value, children }) {
  return (
    <div className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-gray-100">
      <div className="flex flex-col">
        <span className="font-medium whitespace-nowrap">{label}</span>
        <span className="text-xs whitespace-nowrap text-slate-500">{value || '--'}</span>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}

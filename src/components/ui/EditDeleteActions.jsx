import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

export default function SystemSettingsEditDeleteActions({ onEdit, onDelete }) {
  return (
    <div className="border-default text-gray flex w-fit items-center rounded-[10px] border-[0.5px]">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-e-none hover:bg-slate-200"
        onClick={onEdit}
      >
        <Edit className="size-4 transition-colors" />
      </Button>
      <div className="border-light-default h-5 w-[0.5px] border-[0.5px]" />
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-s-none hover:bg-red-100"
        onClick={onDelete}
      >
        <Trash2 className="size-4 transition-colors" />
      </Button>
    </div>
  );
}

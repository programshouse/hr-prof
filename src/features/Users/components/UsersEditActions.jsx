import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function UsersEditActions({ onEdit }) {
  return (
    <div className="border-default text-gray flex w-fit items-center rounded-[10px] border-[0.5px]">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 hover:bg-slate-200"
        onClick={onEdit}
      >
        <Edit className="size-4 transition-colors" />
      </Button>
    </div>
  );
}

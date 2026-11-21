import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ViewToggle({ view, onViewChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('board')}
        className="h-8 w-8 p-0"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

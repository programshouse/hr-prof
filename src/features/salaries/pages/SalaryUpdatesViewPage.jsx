import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SalaryUpdatesViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/salary-updates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salary Updates
        </Button>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Salary Update Details #{id}</h1>
        <p className="text-slate-600">View salary update details functionality will be implemented here.</p>
      </div>
    </div>
  );
}

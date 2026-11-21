import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EditSalaryUpdateModal from '../components/EditSalaryUpdateModal';
import { useQueryClient } from '@tanstack/react-query';

export default function SalaryUpdatesEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(true);

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['salaryUpdatesAll'] });
    navigate('/salary-updates');
  };

  const handleModalClose = () => {
    navigate('/salary-updates');
  };

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
      
      {/* Edit Modal */}
      <EditSalaryUpdateModal
        open={isEditModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleModalSuccess}
        salaryUpdateId={id}
      />
    </div>
  );
}

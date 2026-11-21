import { Card, CardContent } from '@/components/ui/card';
import { Calculator, TrendingUp } from 'lucide-react';

export default function CommissionPreviewCard({ previewData, isLoading }) {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previewData) {
    return null;
  }

  const { commission_percent, base_amount, computed_amount } = previewData;

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Commission Preview</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-blue-700">Commission Rate</p>
            <p className="text-xl font-bold text-blue-900">{commission_percent}%</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-blue-700">Base Amount</p>
            <p className="text-xl font-bold text-blue-900">${base_amount.toLocaleString()}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-blue-700">Commission Amount</p>
            </div>
            <p className="text-xl font-bold text-green-600">${computed_amount.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

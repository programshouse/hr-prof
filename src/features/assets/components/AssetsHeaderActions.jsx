import { Button } from "@/components/ui/button";
import { Plus} from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function AssetsHeaderActions({ 
  onAddAsset,  
  table,
  allRows = []
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      {/* Add Asset Button */}
      {onAddAsset && (
        <Button variant="reset1" onClick={onAddAsset}>
          <Plus className="mr-2 h-4 w-4" />
          {t('assets.addAsset')}
        </Button>
      )}

    </div>
  );
}

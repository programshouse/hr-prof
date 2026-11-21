// src/components/shared/AssetStatsCards.jsx
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const StatCard = ({ title, count = 0, icon: Icon, iconClassName }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center">
            <Icon className={`h-6 w-6 ${iconClassName}`} />
          </span>
          <p className="text-xl font-semibold text-slate-900">{title}</p>
        </div>

        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {Number(count || 0).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default function AssetStatsCards({ stats = null }) {
  const { t } = useTranslation();
  // Default stats data - can be overridden by props
  const defaultStats = {
    totalAssets: { count: 0, changePercent: 0 },
    returnedAssets: { count: 0, changePercent: 0 },
    lostAssets: { count: 0, changePercent: 0 },
  };

  const assetStats = stats || defaultStats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title={t('assets.summaryCards.totalAssets')}
        count={assetStats.totalAssets?.count || 0}
        icon={Package}
        iconClassName="text-primary"
      />
      <StatCard
        title={t('assets.summaryCards.returnedAssets')}
        count={assetStats.returnedAssets?.count || 0}
        icon={RotateCcw}
        iconClassName="text-primary"
      />
      <StatCard
        title={t('assets.summaryCards.lostAssets')}
        count={assetStats.lostAssets?.count || 0}
        icon={AlertTriangle}
        iconClassName="text-primary"
      />
    </div>
  );
}

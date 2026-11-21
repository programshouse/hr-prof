import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash2, Monitor, Smartphone, Laptop } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "In Use":
      return "bg-green-100 text-green-800";
    case "Returned":
      return "bg-blue-100 text-blue-800";
    case "Lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const assetIcons = {
  laptop: Laptop,
  mobile: Smartphone,
  computer: Monitor,
};

export default function AssetCard({ asset, onEdit, onDelete }) {
  const Icon = assetIcons[asset.type?.toLowerCase()] || Monitor;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Asset Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2  rounded-lg">
              <Icon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{asset.id}</h3>
              <p className="text-sm text-gray-500">{asset.type}</p>
            </div>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
            {asset.status}
          </span>
        </div>

        {/* Asset Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Assigned to:</span>
            <span className="text-gray-900 font-medium">{asset.assignedEmployee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start Date:</span>
            <span className="text-gray-900">{asset.startDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">End Date:</span>
            <span className="text-gray-900">{asset.endDate || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Value:</span>
            <span className="text-gray-900 font-semibold">${(asset.assetValue || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

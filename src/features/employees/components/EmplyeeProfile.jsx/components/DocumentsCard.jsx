import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function DocumentsCard({ documents }) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border bg-background col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t('employees.profile.details.documents')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {Array.isArray(documents) && documents.length > 0 ? (
          documents.map((doc, idx) => {
            //  guard null/undefined
            if (!doc) return null;

            // Handle both string and object formats
            const docUrl = typeof doc === "string" ? doc : doc?.url || "";
            if (!docUrl) return null; //  skip items without url

            const docName =
              typeof doc === "string"
                ? doc.split("/").pop()
                : doc?.name || docUrl.split("/").pop() || "Document";

            return (
              <a
                key={idx}
                href={docUrl.startsWith("http") ? docUrl : `/${docUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-gray" />
                  <span className="truncate text-gray">{docName}</span>
                </div>
              </a>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-sm text-gray">
            <FileText className="h-8 w-8" />
            <span className="text-base">{t('employees.profile.details.noDocuments')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

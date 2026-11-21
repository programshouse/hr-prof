import { List, Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function MeetingsHeaderActions({ onAdd, viewMode, setViewMode }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center gap-2">
      {/* Add Meeting Button */}
      <Button onClick={onAdd}
      variant="reset1" >
        <Plus className=" size-4" />
        {t('meetings.addMeetingButton')}
      </Button>

      {/* View Mode Toggle */}
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">


        <button
          type="button"
          onClick={() => setViewMode("calendar")}
          className={[
            "grid h-10 w-10 place-items-center border-l border-slate-200",
            viewMode === "calendar"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-slate-50",
          ].join(" ")}
          title="Calendar"
        >
          <CalendarDays className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={[
            "grid h-10 w-10 place-items-center border-l border-slate-200",
            viewMode === "table"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-slate-50",
          ].join(" ")}
          title="Table"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

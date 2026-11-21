"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function FieldDate({ label, value, isEditing, onChange }) {
  const { t } = useTranslation();
  const selected = value ? new Date(value) : null;

  if (!isEditing) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "--"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected ? format(selected, "dd/MM/yyyy") : t("common.datePlaceholder")}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) =>
              onChange(date?.toISOString()?.slice(0, 10))
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

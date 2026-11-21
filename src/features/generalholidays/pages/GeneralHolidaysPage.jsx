// src/features/generalholidays/pages/GeneralHolidaysPage.jsx
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useGeneralHolidaysQuery } from '../hooks/useGeneralHolidaysQuery';
import { useCreateGeneralHoliday } from '../hooks/useCreateGeneralHoliday';
import { useUpdateGeneralHoliday } from '../hooks/useUpdateGeneralHoliday';
import GeneralHolidaysCalendar from '../components/GeneralHolidaysCalendar';
import AddHolidayModal from '../components/AddHolidayModal';
import DeleteHolidayModal from '../components/DeleteHolidayModal';

export default function GeneralHolidaysPage() {
  const [year, setYear] = useState(String(dayjs().year()));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  const { data, isLoading } = useGeneralHolidaysQuery(year);
  const holidays = useMemo(() => data?.holidays || [], [data]);

  const createMutation = useCreateGeneralHoliday(year);
  const updateMutation = useUpdateGeneralHoliday(year);

  const handleAddHoliday = () => {
    setEditingHoliday(null);
    setIsAddOpen(true);
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setIsAddOpen(true);
  };

  const handleSubmitAdd = (data) => {
    if (editingHoliday?.id) {
      updateMutation.mutate(
        { id: editingHoliday.id, ...data },
        {
          onSuccess: () => {
            setIsAddOpen(false);
            setEditingHoliday(null);
          },
        }
      );
      return;
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        setIsAddOpen(false);
        setEditingHoliday(null);
      },
    });
  };

  const handleDeleteHoliday = (holiday) => {
    if (!holiday?.deletable) return;
    setHolidayToDelete(holiday);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6">
      <GeneralHolidaysCalendar
        holidays={holidays}
        loading={isLoading}
        onAddHoliday={handleAddHoliday}
        onEditHoliday={handleEditHoliday}
        onDeleteHoliday={handleDeleteHoliday}
        onYearChange={(newYear) => {
          if (newYear !== year) setYear(newYear);
        }}
      />

      <AddHolidayModal
        open={isAddOpen}
        onOpenChange={(value) => {
          setIsAddOpen(value);
          if (!value) setEditingHoliday(null);
        }}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmitAdd}
        holiday={editingHoliday}
        defaultCountryCode="EG"
        year={year}
      />

      <DeleteHolidayModal
        open={isDeleteOpen}
        onOpenChange={(v) => {
          setIsDeleteOpen(v);
          if (!v) setHolidayToDelete(null);
        }}
        holiday={holidayToDelete}
        year={year}
      />
    </div>
  );
}

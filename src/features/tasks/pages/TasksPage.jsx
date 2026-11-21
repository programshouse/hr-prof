import { useMemo, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TasksTable } from '../components/TasksTable';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { DeleteTaskDialog } from '../components/DeleteTaskDialog';
import { useFreelanceEmployeeTasks, useDeleteFreelanceEmployeeTask, useCreateFreelanceEmployeeTask, useUpdateFreelanceEmployeeTask } from '../hooks/useFreelanceEmployeeTasks';
import TasksFilters from '@/components/ui/TasksFilters';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useTranslation } from 'react-i18next';

export default function TasksPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Update filters to include pagination
  const updatedFilters = useMemo(() => ({
    ...filters,
    page: currentPage,
    per_page: parseInt(pageSize),
  }), [filters, currentPage, pageSize]);

  // Fetch tasks from API
  const { data: tasksData } = useFreelanceEmployeeTasks(updatedFilters);

  // Debug: Log tasksData structure
  useEffect(() => {
    console.log('TasksPage - tasksData:', tasksData);
    console.log('TasksPage - currentPage:', currentPage);
    console.log('TasksPage - totalPages:', tasksData?.meta?.last_page);
  }, [tasksData, currentPage]);
  const deleteTaskMutation = useDeleteFreelanceEmployeeTask();
  const createTaskMutation = useCreateFreelanceEmployeeTask();
  const updateTaskMutation = useUpdateFreelanceEmployeeTask();

  const filteredTasks = useMemo(() => {
    if (!tasksData?.data) return [];
    return tasksData.data;
  }, [tasksData]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    if (selectedTask) {
      // Update existing task
      await updateTaskMutation.mutateAsync({ 
        id: selectedTask.id, 
        payload: taskData 
      });
      setTaskModalOpen(false);
      setSelectedTask(null);
    } else {
      // Create new task
      await createTaskMutation.mutateAsync(taskData);
      setTaskModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedTask?.id) {
      await deleteTaskMutation.mutateAsync(selectedTask.id);
      setDeleteModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-7">


      <div className="flex items-center justify-between gap-4">
        <TasksFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder={t('tasks.searchPlaceholder')}
          showStatus={false}
          className="flex-1"
          departmentKey="department_id"
          positionKey="position_id"
        />

        <Button
          onClick={handleCreateTask}
          variant="outline"

        >
          <Plus className="mr-2 h-4 w-4" />
          {t('tasks.addNew')}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-slate-500">{t('tasks.showEntries')}</span>
        <PageSizeSelect
          value={parseInt(pageSize)}
          onChange={handlePageSizeChange}
   
        />
      </div>

      <TasksTable tasks={filteredTasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />

 
      
      <Pagination
        currentPage={currentPage}
        totalPages={tasksData?.meta?.last_page || 1}
        onPageChange={setCurrentPage}
      />

      <TaskFormDialog
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <DeleteTaskDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        task={selectedTask}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteTaskMutation.isPending}
      />
    </div>
  );
}
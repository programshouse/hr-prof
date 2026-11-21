import { useState, useEffect, useMemo } from 'react';
import { Calendar, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEmployeeTasks, useDeleteEmployeeTask, useUpdateEmployeeTask } from '../hooks/useEmployeeTasks';
import { employeeTasksApi } from '../api/employeeTasksApi';
import { toast } from 'sonner';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { ViewTaskDialog } from '../components/ViewTaskDialog';
import { DeleteTaskDialog } from '../components/DeleteTaskDialog';
import {
  buildEmployeeTaskUpdatePayload,
  getEmployeeTaskErrorMessage,
} from '../utils/employeeTaskPayload';

const TB = 'employees.tasksBoard';

// API values match TaskFormDialog / EmployeeTasksTable (e.g. "in progress", not in_progress)
const STATUS_MAP = {
  todo: 'pending',
  inProgress: 'in progress',
  review: 'review',
  done: 'done',
};

const STATUS_TO_COLUMN = {
  pending: 'todo',
  'in progress': 'inProgress',
  in_progress: 'inProgress',
  review: 'review',
  done: 'done',
};

function normalizeStatus(status) {
  return status?.toLowerCase()?.trim();
}

function statusToColumnKey(status) {
  const key = normalizeStatus(status);
  return STATUS_TO_COLUMN[key] || 'todo';
}

const getColumns = (t) => [
  { key: 'todo', title: t(`${TB}.todo`) },
  { key: 'inProgress', title: t(`${TB}.inProgress`) },
  { key: 'review', title: t(`${TB}.review`) },
  { key: 'done', title: t(`${TB}.done`) },
];

function getPriorityStyle(priority) {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return {
        line: 'bg-[#A50545]',
        badge: 'border-[#A50545] text-[#A50545]',
      };
    case 'critical':
      return {
        line: 'bg-[#FF4747]',
        badge: 'border-[#FF4747] text-[#FF4747]',
      };
    case 'medium':
      return {
        line: 'bg-[#7B79E8]',
        badge: 'border-[#7B79E8] text-[#7B79E8]',
      };
    default:
      return {
        line: 'bg-slate-400',
        badge: 'border-slate-300 text-slate-500',
      };
  }
}

function PriorityBadge({ priority, t }) {
  const style = getPriorityStyle(priority);
  
  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return t(`${TB}.urgent`);
      case 'critical':
        return t(`${TB}.critical`);
      case 'medium':
        return t(`${TB}.medium`);
      case 'low':
        return t(`${TB}.low`);
      case 'high':
        return t(`${TB}.high`);
      default:
        return priority;
    }
  };

  return (
    <span
      className={`inline-flex h-[18px] items-center rounded-full border bg-white px-[7px] text-[10px] font-semibold leading-none ${style.badge}`}
    >
      <span className="mr-[4px] h-[5px] w-[5px] rounded-full bg-current" />
      {getPriorityLabel(priority)}
    </span>
  );
}

function TaskCard({ task, onView, onEdit, onDelete, onDragStart, t }) {
  const style = getPriorityStyle(task.priority);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="relative min-h-[126px] cursor-grab overflow-hidden rounded-[15px] border border-[#d7d7d7] bg-white px-[12px] py-[11px] shadow-[0_2px_5px_rgba(0,0,0,0.13)] active:cursor-grabbing"
    >
      <span className={`absolute left-0 top-0 h-full w-[4px] ${style.line}`} />

      <div className=" flex items-start justify-between gap-2 pl-[2px]">
        <h4 className="pt-[2px] text-[12px] font-bold leading-none text-black">
          {task.taskNumber}-{task.taskName}
        </h4>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-[24px] w-[24px] rounded-[6px] bg-[#eef0f2] p-0 text-[#6b7280] hover:bg-[#e2e5e8]"
            >
              <MoreHorizontal className="h-[15px] w-[15px]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36 rounded-xl">
            <DropdownMenuItem onClick={() => onView?.(task)}>
              <Eye className="mr-2 h-4 w-4" />
              {t(`${TB}.viewTask`)}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Edit className="mr-2 h-4 w-4" />
              {t(`${TB}.editTask`)}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete?.(task)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t(`${TB}.deleteTask`)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-[17px] pl-[2px] text-[12px] font-medium leading-[15px] text-[#536b91]">
        {task.project || '—'}
      </div>

      {task.description && (
        <div className="mb-[17px] pl-[2px] text-[12px] leading-[15px] text-[#536b91]">
          <span className="font-semibold">{t(`${TB}.description`)}:</span> {task.description}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pl-[2px]">
        <div className="flex items-center gap-[4px] whitespace-nowrap text-[10px] font-bold text-black">
          <Calendar className="h-[14px] w-[14px]" />
          <span>{t(`${TB}.dueDate`)} : {task.dueDate || task.due_date || '—'}</span>
        </div>

        <PriorityBadge priority={task.priority} t={t} />
      </div>
    </div>
  );
}

function TaskColumn({
  columnKey,
  title,
  tasks,
  onView,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  t,
}) {
  const taskList = tasks || [];
  
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, columnKey)}
      className="min-h-[560px] w-[360px] flex-none rounded-[7px] bg-[#f1f1f1] px-[18px] py-[16px]"
    >
      <div className="mb-[18px] flex items-center gap-[9px]">
        <h3 className="text-[20px] font-bold leading-none text-black">{title}</h3>

        <span className="inline-flex h-[28px] min-w-[28px] items-center justify-center rounded-[5px] border border-[#cbd5e1] bg-[#eeeeee] px-[7px] text-[14px] text-[#6b7280]">
          {taskList.length}
        </span>
      </div>

      <div className="space-y-[17px]">
        {taskList.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
            t={t}
          />
        ))}
        
        {taskList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium">
              {t(`${TB}.noTasks`)} {t(`${TB}.${columnKey}`)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksBoardPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    review: [],
    done: []
  });
  const [draggedTask, setDraggedTask] = useState(null);
  
  // Dialog states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks from API
  const { data: tasksData } = useEmployeeTasks();
  const deleteTaskMutation = useDeleteEmployeeTask();
  const updateTaskMutation = useUpdateEmployeeTask();

  // Process API data to organize by status
  const organizedTasks = useMemo(() => {
    if (tasksData?.data) {
      const tasks = {
        todo: [],
        inProgress: [],
        review: [],
        done: []
      };

      tasksData.data.forEach(task => {
        const taskCard = {
          ...task,

          id: task.id,

          task_number: task.task_number,
          taskNumber: task.task_number,

          name: task.name,
          taskName: task.name,
          title: task.title || task.name,

          project:
            task.project ||
            `${task.position?.name || ''} ${task.department?.name ? `(${task.department?.name})` : ''}`.trim() ||
            task.name ||
            '—',

          employee_id: task.employee_id || task.employee?.id,
          employee_ids: task.employee_ids || (task.employee_id ? [task.employee_id] : []),
          employee: task.employee,
          employees: task.employees || [],

          employee_name:
            task.employee_name ||
            task.employee?.name ||
            task.employee?.employee_name ||
            '—',

          start_date: task.start_date,
          startDate: task.start_date,

          due_date: task.due_date,
          dueDate: task.due_date,

          created_at: task.created_at,
          updated_at: task.updated_at,

          priority: task.priority,
          status: task.status,
          description: task.description,
          attachment: task.attachment,
        };

        const columnKey = statusToColumnKey(task.status);
        tasks[columnKey].push(taskCard);
      });

      return tasks;
    } else {
      // Return empty tasks when no API data
      return {
        todo: [],
        inProgress: [],
        review: [],
        done: []
      };
    }
  }, [tasksData]);

  // Update tasks when organizedTasks changes
  useEffect(() => {
    setTasks(organizedTasks);
  }, [organizedTasks]);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnKey) => {
    e.preventDefault();

    if (!draggedTask) return;

    const sourceColumnKey = Object.keys(tasks).find((key) =>
      tasks[key].some((task) => task.id === draggedTask.id)
    );

    if (!sourceColumnKey || sourceColumnKey === targetColumnKey) {
      setDraggedTask(null);
      return;
    }

    const newStatus = STATUS_MAP[targetColumnKey];

    let taskRecord = draggedTask;

    try {
      const response = await employeeTasksApi.getEmployeeTaskById(draggedTask.id);
      const detail = response?.data ?? response;
      if (detail && typeof detail === 'object') {
        taskRecord = detail;
      }
    } catch (fetchError) {
      console.error('Failed to load task before status update:', fetchError);
      toast.error(t('employeeTasks.failedToLoadTask') || 'Failed to load task');
      setDraggedTask(null);
      return;
    }

    const payload = buildEmployeeTaskUpdatePayload(taskRecord, { status: newStatus });

    if (!payload.name || !payload.employee_ids?.length) {
      toast.error(t(`${TB}.statusUpdateFailed`) || 'Failed to update status');
      setDraggedTask(null);
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: draggedTask.id,
        payload,
      });

      toast.success(t(`${TB}.statusUpdated`) || 'Status updated successfully');
    } catch (error) {
      console.error('Failed to update task status:', error);
      const apiMessage = getEmployeeTaskErrorMessage(error);
      toast.error(
        apiMessage || t(`${TB}.statusUpdateFailed`) || 'Failed to update status'
      );
      setDraggedTask(null);
      return;
    }

    setDraggedTask(null);
  };

  const handleEditTask = async (task) => {
    if (!task?.id) return;

    try {
      const response = await employeeTasksApi.getEmployeeTaskById(task.id);
      const detail = response?.data ?? response;
      setSelectedTask(detail && typeof detail === 'object' ? detail : task);
      setTaskModalOpen(true);
    } catch (error) {
      console.error('Failed to load task for editing:', error);
      toast.error(t('employeeTasks.failedToLoadTask') || 'Failed to load task');
    }
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTask?.id) {
      await deleteTaskMutation.mutateAsync(selectedTask.id);
      setDeleteModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    if (selectedTask) {
      await updateTaskMutation.mutateAsync({ 
        id: selectedTask.id, 
        payload: taskData 
      });
      setTaskModalOpen(false);
      setSelectedTask(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white px-[20px] py-[12px]">
        <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex w-max gap-[42px]">
            {getColumns(t).map((column) => (
              <TaskColumn
                key={column.key}
                columnKey={column.key}
                title={column.title}
                tasks={tasks[column.key] || []}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>

      <TaskFormDialog
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        isSubmitting={updateTaskMutation.isPending}
      />

      <ViewTaskDialog
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        task={selectedTask}
      />

      <DeleteTaskDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        task={selectedTask}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteTaskMutation.isPending}
      />
    </>
  );
}
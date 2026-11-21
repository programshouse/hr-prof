import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { EmployeeTasksTable } from '../components/EmployeeTasksTable';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { DeleteTaskDialog } from '../components/DeleteTaskDialog';
import { ViewTaskDialog } from '../components/ViewTaskDialog';
import { ViewToggle } from '../components/ViewToggle';

import TasksBoardPage from './TasksBoardPage';

import {
  useEmployeeTasks,
  useDeleteEmployeeTask,
  useCreateEmployeeTask,
  useUpdateEmployeeTask,
} from '../hooks/useEmployeeTasks';

import { employeeTasksApi } from '../api/employeeTasksApi';

import TasksFilters from '@/components/ui/TasksFilters';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';

import { toast } from 'sonner';

import {
  getEmployeeTaskErrorMessage,
} from '../utils/employeeTaskPayload';


/* =========================================================
   HELPERS
========================================================= */

const flagEnabled = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  );
};


const isPlainObject = (value) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value);


const taskShapeScore = (value) => {
  if (!isPlainObject(value)) {
    return -1;
  }

  const keys = [
    'id',
    'task_number',
    'taskNumber',
    'name',
    'task_name',
    'task_title',
    'title',
    'description',
    'start_date',
    'due_date',
    'employee_id',
    'employee_ids',
    'employees',
    'priority',
    'status',
  ];

  return keys.reduce(
    (score, key) =>
      score +
      (
        value[key] !== undefined &&
        value[key] !== null
          ? 1
          : 0
      ),
    0
  );
};


const findTaskObject = (
  value,
  taskId = null,
  depth = 0
) => {
  if (
    depth > 6 ||
    value == null
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    const exact = value.find(
      (item) =>
        isPlainObject(item) &&
        taskId != null &&
        String(
          item?.id ??
          item?.task_id ??
          ''
        ) === String(taskId)
    );

    if (exact) {
      return exact;
    }

    let best = null;
    let bestScore = -1;

    value.forEach((item) => {
      const found =
        findTaskObject(
          item,
          taskId,
          depth + 1
        );

      const score =
        taskShapeScore(found);

      if (score > bestScore) {
        best = found;
        bestScore = score;
      }
    });

    return best;
  }

  if (!isPlainObject(value)) {
    return null;
  }

  const ownId =
    value?.id ??
    value?.task_id ??
    value?.employee_task_id;

  if (
    taskId != null &&
    ownId != null &&
    String(ownId) === String(taskId)
  ) {
    return value;
  }

  const preferredKeys = [
    'task',
    'employee_task',
    'employeeTask',
    'item',
    'record',
    'result',
    'data',
  ];

  let best =
    taskShapeScore(value) >= 3
      ? value
      : null;

  let bestScore =
    taskShapeScore(best);

  for (const key of preferredKeys) {
    if (value[key] == null) {
      continue;
    }

    const found =
      findTaskObject(
        value[key],
        taskId,
        depth + 1
      );

    const score =
      taskShapeScore(found);

    if (score > bestScore) {
      best = found;
      bestScore = score;
    }
  }

  if (bestScore < 3) {
    for (
      const child
      of Object.values(value)
    ) {
      if (
        !isPlainObject(child) &&
        !Array.isArray(child)
      ) {
        continue;
      }

      const found =
        findTaskObject(
          child,
          taskId,
          depth + 1
        );

      const score =
        taskShapeScore(found);

      if (score > bestScore) {
        best = found;
        bestScore = score;
      }
    }
  }

  return best;
};


const normalizeTaskDetail = (
  response,
  fallback = null
) => {
  const detail =
    findTaskObject(
      response,
      fallback?.id
    );

  if (!detail) {
    return fallback;
  }

  if (!fallback) {
    return detail;
  }

  return {
    ...fallback,
    ...detail,

    employees:
      detail?.employees ??
      detail?.assigned_employees ??
      detail?.assignedEmployees ??
      fallback?.employees ??
      fallback?.assigned_employees ??
      fallback?.assignedEmployees,

    employee_ids:
      detail?.employee_ids ??
      fallback?.employee_ids,
  };
};


/* =========================================================
   COMPONENT
========================================================= */

export default function EmployeeTasksPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isAr =
    i18n.language?.startsWith('ar');

  const {
    user,
    role,
    isManager,
  } = useAuthStore();


  /* =======================================================
     ROLE
  ======================================================= */

  const isEmployeePortal =
    role === 'employee';

  const ownEmployeeId =
    String(
      user?.id ??
      user?.employee_id ??
      ''
    );

  /*
   * Employee manager can create/edit/delete tasks
   * only if can_assign_tasks is enabled.
   *
   * HR/Admin always can manage.
   */
  const canAssignTasks =
    isEmployeePortal
      ? (
          isManager &&
          flagEnabled(
            user?.can_assign_tasks,
            true
          )
        )
      : true;


  /* =======================================================
     FILTER / PAGINATION STATE
  ======================================================= */

  /*
   * filters is ONLY used by HR/Admin.
   *
   * Employee doesn't get any filter UI.
   */
  const [
    filters,
    setFilters,
  ] = useState({});

  const [
    pageSize,
    setPageSize,
  ] = useState('10');

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  /* =======================================================
     MODAL STATE
  ======================================================= */

  const [
    taskModalOpen,
    setTaskModalOpen,
  ] = useState(false);

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    viewModalOpen,
    setViewModalOpen,
  ] = useState(false);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  const [
    currentView,
    setCurrentView,
  ] = useState('table');

  const [
    isLoadingTask,
    setIsLoadingTask,
  ] = useState(false);


  /* =======================================================
     API FILTERS
  ======================================================= */

  const updatedFilters =
    useMemo(() => {
      /*
       * EMPLOYEE LOGIN
       *
       * No search
       * No department
       * No position
       * No shift
       * No branch
       * No team-member filter
       *
       * Employee is automatically scoped
       * to his own employee ID.
       */
      if (isEmployeePortal) {
        return {
          ...(ownEmployeeId
            ? {
                employee_id:
                  ownEmployeeId,
              }
            : {}),

          page:
            currentPage,

          per_page:
            Number(pageSize),
        };
      }

      /*
       * HR / ADMIN
       *
       * Keep normal filters.
       */
      return {
        ...filters,

        page:
          currentPage,

        per_page:
          Number(pageSize),
      };
    }, [
      isEmployeePortal,
      ownEmployeeId,
      filters,
      currentPage,
      pageSize,
    ]);


  /* =======================================================
     TASKS QUERY
  ======================================================= */

  const {
    data: tasksData,
    isLoading,
    isFetching,
  } = useEmployeeTasks(
    updatedFilters
  );


  /* =======================================================
     MUTATIONS
  ======================================================= */

  const deleteTaskMutation =
    useDeleteEmployeeTask();

  const createTaskMutation =
    useCreateEmployeeTask();

  const updateTaskMutation =
    useUpdateEmployeeTask();


  /* =======================================================
     NORMALIZE TASK LIST
  ======================================================= */

  const filteredTasks =
    useMemo(() => {
      if (
        Array.isArray(
          tasksData?.data
        )
      ) {
        return tasksData.data;
      }

      if (
        Array.isArray(
          tasksData?.data?.data
        )
      ) {
        return tasksData.data.data;
      }

      if (
        Array.isArray(
          tasksData?.tasks
        )
      ) {
        return tasksData.tasks;
      }

      if (
        Array.isArray(tasksData)
      ) {
        return tasksData;
      }

      return [];
    }, [tasksData]);


  /* =======================================================
     TOTAL PAGES
  ======================================================= */

  const totalPages =
    tasksData?.meta?.last_page ||
    tasksData?.data?.last_page ||
    tasksData?.pagination?.last_page ||
    1;


  /* =======================================================
     CREATE TASK
  ======================================================= */

  const handleCreateTask = () => {
    if (!canAssignTasks) {
      return;
    }

    setSelectedTask(null);

    setTaskModalOpen(true);
  };


  /* =======================================================
     EDIT TASK
  ======================================================= */

  const handleEditTask =
    async (task) => {
      if (
        !canAssignTasks ||
        !task?.id
      ) {
        return;
      }

      /*
       * Open immediately using row data.
       */
      setSelectedTask(task);

      setTaskModalOpen(true);

      try {
        const response =
          await employeeTasksApi
            .getEmployeeTaskById(
              task.id
            );

        setSelectedTask(
          (current) =>
            normalizeTaskDetail(
              response,
              current || task
            )
        );
      } catch (error) {
        /*
         * Some employee portal APIs may not
         * authorize SHOW endpoint.
         *
         * Keep row values instead.
         */
        console.error(
          'Failed to load full task detail; using row data:',
          error
        );
      }
    };


  /* =======================================================
     DELETE TASK
  ======================================================= */

  const handleDeleteTask =
    (task) => {
      if (!canAssignTasks) {
        return;
      }

      setSelectedTask(task);

      setDeleteModalOpen(true);
    };


  /* =======================================================
     VIEW TASK
  ======================================================= */

  const handleViewTask =
    async (task) => {
      setIsLoadingTask(true);

      try {
        const response =
          await employeeTasksApi
            .getEmployeeTaskById(
              task.id
            );

        setSelectedTask(
          normalizeTaskDetail(
            response,
            task
          )
        );
      } catch (error) {
        console.error(
          'Failed to load full task detail; using row data:',
          error
        );

        setSelectedTask(task);
      } finally {
        setIsLoadingTask(false);

        setViewModalOpen(true);
      }
    };


  /* =======================================================
     CREATE / UPDATE SUBMIT
  ======================================================= */

  const handleTaskSubmit =
    async (taskData) => {
      if (!canAssignTasks) {
        return;
      }

      try {
        if (selectedTask) {
          await updateTaskMutation
            .mutateAsync({
              id:
                selectedTask.id,

              payload:
                taskData,
            });

          toast.success(
            t(
              'employeeTasks.taskUpdatedSuccessfully'
            )
          );
        } else {
          await createTaskMutation
            .mutateAsync(
              taskData
            );

          toast.success(
            t(
              'employeeTasks.taskCreatedSuccessfully'
            )
          );
        }

        setTaskModalOpen(false);

        setSelectedTask(null);
      } catch (error) {
        toast.error(
          getEmployeeTaskErrorMessage(
            error
          ) ||
          (
            selectedTask
              ? t(
                  'employeeTasks.taskUpdateFailed'
                )
              : t(
                  'employeeTasks.taskCreationFailed'
                )
          )
        );
      }
    };


  /* =======================================================
     DELETE CONFIRM
  ======================================================= */

  const handleDeleteConfirm =
    async () => {
      if (!canAssignTasks) {
        return;
      }

      try {
        if (!selectedTask?.id) {
          return;
        }

        await deleteTaskMutation
          .mutateAsync(
            selectedTask.id
          );

        toast.success(
          t(
            'employeeTasks.taskDeletedSuccessfully'
          )
        );

        setDeleteModalOpen(false);

        setSelectedTask(null);
      } catch (error) {
        toast.error(
          getEmployeeTaskErrorMessage(
            error
          ) ||
          t(
            'employeeTasks.taskDeletionFailed'
          )
        );
      }
    };


  /* =======================================================
     HR FILTER CHANGE
  ======================================================= */

  const handleFiltersChange =
    (newFilters) => {
      /*
       * Extra guard:
       * employee cannot change HR filters.
       */
      if (isEmployeePortal) {
        return;
      }

      setFilters(newFilters);

      setCurrentPage(1);
    };


  /* =======================================================
     PAGE SIZE
  ======================================================= */

  const handlePageSizeChange =
    (newPageSize) => {
      setPageSize(
        String(newPageSize)
      );

      setCurrentPage(1);
    };


  /* =======================================================
     VIEW
  ======================================================= */

  return (
    <div
      dir={
        isAr
          ? 'rtl'
          : 'ltr'
      }
      className="space-y-8"
    >

      {/* ===================================================
          TOP AREA
          
          HR/Admin:
          Filters + Add New
          
          Employee:
          No filters
          Add button only if allowed
      =================================================== */}

      {(
        !isEmployeePortal ||
        canAssignTasks
      ) && (
        <div
          className={`flex items-start gap-5 ${
            isEmployeePortal
              ? 'justify-end'
              : 'justify-between'
          }`}
        >

          {/* HR / ADMIN FILTERS ONLY */}

          {!isEmployeePortal && (
            <div className="min-w-0 flex-1">

              <TasksFilters
                filters={
                  filters
                }

                onFiltersChange={
                  handleFiltersChange
                }

                searchPlaceholder={
                  t(
                    'employeeTasks.searchPlaceholder'
                  )
                }

                showStatus={
                  false
                }

                showShift

                showBranch

                className="w-full"

                departmentKey="department_id"

                positionKey="position_id"

                shiftKey="shift_id"

                branchKey="branch_id"
              />

            </div>
          )}


          {/* ADD NEW */}

          {canAssignTasks && (
            <Button
              onClick={
                handleCreateTask
              }

              variant="outline"

              className="h-10 shrink-0 rounded-lg border-[#6155d8] px-5 text-[#6155d8] hover:bg-[#f4f2ff] hover:text-[#6155d8]"
            >

              <Plus
                className={
                  isAr
                    ? 'ml-2 h-4 w-4'
                    : 'mr-2 h-4 w-4'
                }
              />

              {t(
                'employeeTasks.addNew'
              )}

            </Button>
          )}

        </div>
      )}


      {/* ===================================================
          PAGE SIZE / VIEW TOGGLE
      =================================================== */}

      <div className="flex items-end justify-between gap-4">

        <div className="flex items-center gap-4">

          <span className="text-[15px] font-semibold leading-5 text-slate-500">

            {t(
              'employeeTasks.showEntries'
            )}

          </span>

          <PageSizeSelect
            value={
              Number(pageSize)
            }

            onChange={
              handlePageSizeChange
            }
          />

        </div>


        {/* BOARD/TABLE SWITCH - HR/ADMIN ONLY */}

        {!isEmployeePortal && (
          <ViewToggle
            view={
              currentView
            }

            onViewChange={
              setCurrentView
            }
          />
        )}

      </div>


      {/* ===================================================
          TASK LIST / BOARD
      =================================================== */}

      {!isEmployeePortal &&
      currentView === 'board' ? (

        <TasksBoardPage
          filters={
            filters
          }
        />

      ) : (

        <>

          <EmployeeTasksTable
            tasks={
              filteredTasks
            }

            isLoading={
              isLoading ||
              isFetching
            }

            onEdit={
              handleEditTask
            }

            onDelete={
              handleDeleteTask
            }

            onView={
              handleViewTask
            }

            canEdit={
              canAssignTasks
            }

            canDelete={
              canAssignTasks
            }
          />


          <Pagination
            currentPage={
              currentPage
            }

            totalPages={
              totalPages
            }

            onPageChange={
              setCurrentPage
            }
          />

        </>

      )}


      {/* ===================================================
          CREATE / EDIT TASK
      =================================================== */}

      {canAssignTasks && (
        <TaskFormDialog
          open={
            taskModalOpen
          }

          onOpenChange={
            setTaskModalOpen
          }

          task={
            selectedTask
          }

          onSubmit={
            handleTaskSubmit
          }

          isSubmitting={
            createTaskMutation.isPending ||
            updateTaskMutation.isPending
          }

          /*
           * Always use /list/employees
           * inside create/edit form.
           */
          employees={
            null
          }

          loadEmployeesFromApi
        />
      )}


      {/* ===================================================
          VIEW TASK
      =================================================== */}

      <ViewTaskDialog
        open={
          viewModalOpen
        }

        onOpenChange={
          setViewModalOpen
        }

        task={
          selectedTask
        }

        isLoading={
          isLoadingTask
        }
      />


      {/* ===================================================
          DELETE TASK
      =================================================== */}

      {canAssignTasks && (
        <DeleteTaskDialog
          open={
            deleteModalOpen
          }

          onOpenChange={
            setDeleteModalOpen
          }

          task={
            selectedTask
          }

          onConfirm={
            handleDeleteConfirm
          }

          isDeleting={
            deleteTaskMutation.isPending
          }
        />
      )}

    </div>
  );
}
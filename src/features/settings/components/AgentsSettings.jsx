// src/features/settings/components/AgentsSettings.jsx

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  Plus,
  Trash2,
  Search,
  Edit,
  ArrowRightLeft,
} from 'lucide-react';

import { useManagerStore } from '@/stores/useManagerStore';

import {
  useManagers,
  useReplaceManager,
} from '@/features/settings/hooks/useManagers';

import {
  useAllDepartments,
  useAllBranches,
  useAllEmployees,
} from '@/shared/hooks';

import { DeleteSettingsDialog } from './DeleteSettingsDialog';


/* =========================================================
   CONSTANTS
========================================================= */

const MANAGER_TYPE_VALUES = [
  'ceo',
  'department_manager',
  'branch_manager',
  'manager_for_all_branches',
];


/* =========================================================
   HELPERS
========================================================= */

function normalizeType(value) {
  if (!value) return '';

  return String(value)
    .trim()
    .toLowerCase();
}


function resolveManagedLabel(
  entity,
  isArabic
) {
  if (!entity) {
    return '';
  }

  if (typeof entity === 'string') {
    return entity;
  }

  return (
    (
      isArabic
        ? entity.name_ar
        : entity.name_en
    ) ||
    entity.name_en ||
    entity.name_ar ||
    ''
  );
}


function getManagerDisplayName(manager) {
  if (!manager) {
    return '';
  }

  const applicantName = [
    manager.applicant?.first_name,
    manager.applicant?.middle_name,
    manager.applicant?.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    manager.full_name ||
    manager.employee_name ||
    manager.formatted_name ||
    applicantName ||
    ''
  );
}


function getEmployeeDisplayName(employee) {
  if (!employee) {
    return '';
  }

  return (
    employee.employee_name ||
    employee.full_name ||
    employee.name ||
    ''
  );
}


function getEmployeeId(employee) {
  return (
    employee?.employee_id ??
    employee?.id ??
    ''
  );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function AgentsSettings() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isArabic =
    i18n.language?.startsWith('ar');


  /* =======================================================
     STORES / QUERIES
  ======================================================= */

  const {
    addManager,
    removeManager,
    updateManager,
  } = useManagerStore();

  const {
    data: managers = [],
    isLoading: isLoadingManagers,
  } = useManagers();

  const {
    data: employees = [],
  } = useAllEmployees();

  const {
    data: departments = [],
  } = useAllDepartments();

  const {
    data: branches = [],
  } = useAllBranches();


  /* =======================================================
     REPLACE MANAGER MUTATION
  ======================================================= */

  const replaceManagerMutation =
    useReplaceManager();


  /* =======================================================
     ADD MANAGER STATE
  ======================================================= */

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState('');

  const [
    selectedType,
    setSelectedType,
  ] = useState('');

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState('');

  const [
    selectedBranch,
    setSelectedBranch,
  ] = useState('');

  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  /* =======================================================
     DELETE MANAGER STATE
  ======================================================= */

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleteManagerId,
    setDeleteManagerId,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);


  /* =======================================================
     EDIT MANAGER STATE
  ======================================================= */

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    editingManager,
    setEditingManager,
  ] = useState(null);

  const [
    editSelectedType,
    setEditSelectedType,
  ] = useState('');

  const [
    editSelectedDepartment,
    setEditSelectedDepartment,
  ] = useState('');

  const [
    editSelectedBranch,
    setEditSelectedBranch,
  ] = useState('');


  /* =======================================================
     REPLACE MANAGER STATE
  ======================================================= */

  const [
    isReplaceModalOpen,
    setIsReplaceModalOpen,
  ] = useState(false);

  const [
    replaceOldManagerId,
    setReplaceOldManagerId,
  ] = useState('');

  const [
    replaceNewManagerId,
    setReplaceNewManagerId,
  ] = useState('');

  const [
    replaceEmployeeSearch,
    setReplaceEmployeeSearch,
  ] = useState('');


  /* =======================================================
     RESET ADD FORM
  ======================================================= */

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedType('');
    setSelectedDepartment('');
    setSelectedBranch('');
    setEmployeeSearch('');
  };


  /* =======================================================
     RESET EDIT FORM
  ======================================================= */

  const resetEditForm = () => {
    setEditingManager(null);
    setEditSelectedType('');
    setEditSelectedDepartment('');
    setEditSelectedBranch('');
  };


  /* =======================================================
     RESET REPLACE FORM
  ======================================================= */

  const resetReplaceForm = () => {
    setReplaceOldManagerId('');
    setReplaceNewManagerId('');
    setReplaceEmployeeSearch('');
  };


  /* =======================================================
     MODAL HANDLERS
  ======================================================= */

  const handleModalOpenChange = (
    open
  ) => {
    setIsModalOpen(open);

    if (!open) {
      resetForm();
    }
  };


  const handleEditModalOpenChange = (
    open
  ) => {
    setIsEditModalOpen(open);

    if (!open) {
      resetEditForm();
    }
  };


  const handleReplaceModalOpenChange = (
    open
  ) => {
    setIsReplaceModalOpen(open);

    if (!open) {
      resetReplaceForm();
    }
  };


  /* =======================================================
     LABEL HELPERS
  ======================================================= */

  const getTypeLabel = (value) => {
    if (!value) {
      return '';
    }

    return t(
      `settings.agents.managerTypes.${value}`,
      {
        defaultValue: '',
      }
    );
  };


  const getDepartmentLabel = (
    department
  ) =>
    (
      isArabic
        ? department.name_ar
        : department.name_en
    ) ||
    department.name_en ||
    department.name_ar ||
    '';


  const getBranchLabel = (
    branch
  ) =>
    (
      isArabic
        ? branch.name_ar
        : branch.name_en
    ) ||
    branch.name_en ||
    branch.name_ar ||
    '';


  /* =======================================================
     FILTER EMPLOYEES - ADD MANAGER
  ======================================================= */

  const filteredEmployees =
    useMemo(() => {
      if (
        !employeeSearch.trim()
      ) {
        return employees;
      }

      const searchLower =
        employeeSearch
          .toLowerCase();

      return employees.filter(
        (employee) => {
          const name =
            getEmployeeDisplayName(
              employee
            ).toLowerCase();

          const code =
            String(
              employee.employee_code ??
              employee.code ??
              ''
            ).toLowerCase();

          return (
            name.includes(
              searchLower
            ) ||
            code.includes(
              searchLower
            )
          );
        }
      );
    }, [
      employees,
      employeeSearch,
    ]);


  /* =======================================================
     FILTER EMPLOYEES - REPLACE MANAGER
  ======================================================= */

  const filteredReplacementEmployees =
    useMemo(() => {
      let list =
        Array.isArray(employees)
          ? employees
          : [];

      /*
       * Do not allow selecting
       * the same employee as old manager.
       */
      if (replaceOldManagerId) {
        list = list.filter(
          (employee) =>
            String(
              getEmployeeId(
                employee
              )
            ) !==
            String(
              replaceOldManagerId
            )
        );
      }

      if (
        !replaceEmployeeSearch.trim()
      ) {
        return list;
      }

      const searchLower =
        replaceEmployeeSearch
          .trim()
          .toLowerCase();

      return list.filter(
        (employee) => {
          const name =
            getEmployeeDisplayName(
              employee
            ).toLowerCase();

          const code =
            String(
              employee.employee_code ??
              employee.code ??
              ''
            ).toLowerCase();

          return (
            name.includes(
              searchLower
            ) ||
            code.includes(
              searchLower
            )
          );
        }
      );
    }, [
      employees,
      replaceEmployeeSearch,
      replaceOldManagerId,
    ]);


  /* =======================================================
     RESOLVE MANAGER TYPE
  ======================================================= */

  const resolveManagerType = (
    manager
  ) => {
    const fromApi =
      normalizeType(
        manager.manager_type ||
        manager.type ||
        manager.role
      );

    if (fromApi) {
      return fromApi;
    }

    if (
      Number(
        manager.is_department_manager
      ) === 1
    ) {
      return 'department_manager';
    }

    if (
      Number(
        manager.is_branch_manager
      ) === 1
    ) {
      return 'branch_manager';
    }

    if (
      Number(
        manager.manager_for_all_branches
      ) === 1
    ) {
      return 'manager_for_all_branches';
    }

    return 'ceo';
  };


  /* =======================================================
     ADD MANAGER
  ======================================================= */

  const handleAddManager =
    async () => {
      if (
        !selectedEmployee ||
        !selectedType
      ) {
        return;
      }

      if (
        selectedType ===
          'department_manager' &&
        !selectedDepartment
      ) {
        return;
      }

      if (
        selectedType ===
          'branch_manager' &&
        !selectedBranch
      ) {
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          manager_type:
            selectedType,
        };

        if (
          selectedType ===
          'department_manager'
        ) {
          payload.department_id =
            Number(
              selectedDepartment
            );
        } else if (
          selectedType ===
          'branch_manager'
        ) {
          payload.branch_id =
            Number(
              selectedBranch
            );
        }

        await addManager(
          selectedEmployee,
          payload
        );

        setIsModalOpen(false);

        resetForm();
      } catch {
        // handled in store
      } finally {
        setIsSubmitting(false);
      }
    };


  /* =======================================================
     REMOVE MANAGER
  ======================================================= */

  const handleRemoveManager = (
    managerId
  ) => {
    setDeleteManagerId(
      managerId
    );

    setDeleteDialogOpen(
      true
    );
  };


  const handleDeleteConfirm =
    async () => {
      if (!deleteManagerId) {
        return;
      }

      setIsDeleting(true);

      try {
        await removeManager(
          deleteManagerId
        );

        setDeleteDialogOpen(
          false
        );
      } catch {
        // handled in store
      } finally {
        setIsDeleting(false);
      }
    };


  /* =======================================================
     EDIT MANAGER
  ======================================================= */

  const handleEditManager = (
    manager
  ) => {
    setEditingManager(
      manager
    );

    const typeResolved =
      resolveManagerType(
        manager
      );

    setEditSelectedType(
      typeResolved
    );

    if (
      typeResolved ===
      'department_manager'
    ) {
      setEditSelectedDepartment(
        String(
          manager
            .managed_department
            ?.id ??
          manager
            .department_id ??
          ''
        )
      );

      setEditSelectedBranch('');
    } else if (
      typeResolved ===
      'branch_manager'
    ) {
      setEditSelectedBranch(
        String(
          manager
            .managed_branch
            ?.id ??
          manager.branch_id ??
          ''
        )
      );

      setEditSelectedDepartment('');
    } else {
      setEditSelectedDepartment('');
      setEditSelectedBranch('');
    }

    setIsEditModalOpen(true);
  };


  const handleUpdateManager =
    async () => {
      if (
        !editingManager ||
        !editSelectedType
      ) {
        return;
      }

      if (
        editSelectedType ===
          'department_manager' &&
        !editSelectedDepartment
      ) {
        return;
      }

      if (
        editSelectedType ===
          'branch_manager' &&
        !editSelectedBranch
      ) {
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          manager_type:
            editSelectedType,
        };

        if (
          editSelectedType ===
          'department_manager'
        ) {
          payload.department_id =
            Number(
              editSelectedDepartment
            );
        } else if (
          editSelectedType ===
          'branch_manager'
        ) {
          payload.branch_id =
            Number(
              editSelectedBranch
            );
        }

        await updateManager(
          editingManager.id,
          payload
        );

        setIsEditModalOpen(false);

        resetEditForm();
      } catch {
        // handled in store
      } finally {
        setIsSubmitting(false);
      }
    };


  /* =======================================================
     OPEN REPLACE FROM MANAGER CARD
  ======================================================= */

  const handleOpenReplaceManager = (
    manager
  ) => {
    setReplaceOldManagerId(
      String(
        manager.id
      )
    );

    setReplaceNewManagerId('');

    setReplaceEmployeeSearch('');

    setIsReplaceModalOpen(
      true
    );
  };


  /* =======================================================
     REPLACE MANAGER
  ======================================================= */

  const handleReplaceManager =
    async () => {
      if (
        !replaceOldManagerId ||
        !replaceNewManagerId
      ) {
        toast.error(
          t(
            'settings.agents.replaceRequired',
            {
              defaultValue:
                'Please select old and new manager',
            }
          )
        );

        return;
      }

      if (
        String(
          replaceOldManagerId
        ) ===
        String(
          replaceNewManagerId
        )
      ) {
        toast.error(
          t(
            'settings.agents.sameManagerError',
            {
              defaultValue:
                'Old manager and new manager cannot be the same',
            }
          )
        );

        return;
      }

      try {
        const result =
          await replaceManagerMutation
            .mutateAsync({
              oldManagerId:
                replaceOldManagerId,

              newManagerId:
                replaceNewManagerId,
            });

        toast.success(
          result?.message ||
          t(
            'settings.agents.replaceSuccess',
            {
              defaultValue:
                'Manager replaced successfully',
            }
          )
        );

        setIsReplaceModalOpen(
          false
        );

        resetReplaceForm();
      } catch (error) {
        console.error(
          'Replace manager error:',
          error
        );

        toast.error(
          error?.response
            ?.data?.message ||
          t(
            'settings.agents.replaceFailed',
            {
              defaultValue:
                'Failed to replace manager',
            }
          )
        );
      }
    };


  /* =======================================================
     VIEW
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <h2 className="text-lg font-medium text-slate-900">
          {t(
            'settings.agents.title'
          )}
        </h2>

        <div className="flex flex-wrap items-center gap-2">

          {/* REPLACE MANAGER */}

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() =>
              setIsReplaceModalOpen(
                true
              )
            }
          >
            <ArrowRightLeft className="h-4 w-4" />

            {t(
              'settings.agents.replaceManager',
              {
                defaultValue:
                  'Replace Manager',
              }
            )}
          </Button>


          {/* ADD MANAGER */}

          <Button
            type="button"
            onClick={() =>
              setIsModalOpen(
                true
              )
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />

            {t(
              'settings.agents.addAgent'
            )}
          </Button>

        </div>

      </div>


      {/* ===================================================
          MANAGERS GRID
      =================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {isLoadingManagers ? (

          <div className="col-span-full py-8 text-center text-slate-500">
            {t(
              'settings.agents.loading'
            )}
          </div>

        ) : managers.length === 0 ? (

          <div className="col-span-full py-8 text-center text-slate-500">
            {t(
              'settings.agents.noAgents'
            )}
          </div>

        ) : (

          managers.map(
            (manager) => {
              const typeResolved =
                resolveManagerType(
                  manager
                );

              const managerName =
                getManagerDisplayName(
                  manager
                );

              return (
                <Card
                  key={
                    manager.id
                  }
                  className="group relative"
                >

                  <CardContent className="p-6">

                    {/* ACTION BUTTONS */}

                    <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">

                      {/* REPLACE */}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title={t(
                          'settings.agents.replaceManager',
                          {
                            defaultValue:
                              'Replace Manager',
                          }
                        )}
                        className="h-8 w-8 text-violet-500 hover:bg-violet-50 hover:text-violet-600"
                        onClick={() =>
                          handleOpenReplaceManager(
                            manager
                          )
                        }
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>


                      {/* EDIT */}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() =>
                          handleEditManager(
                            manager
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>


                      {/* DELETE */}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() =>
                          handleRemoveManager(
                            manager.id
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>


                    <div className="grid gap-6">

                      {/* MANAGER NAME */}

                      <div className="space-y-1.5">

                        <Label className="text-muted-foreground text-xs font-normal tracking-wider uppercase">
                          {t(
                            'settings.agents.manager'
                          )}
                        </Label>

                        <div className="font-medium text-slate-900">

                          {manager.code
                            ? `${manager.code} - `
                            : ''}

                          {managerName ||
                            '-'}

                        </div>

                      </div>


                      {/* POSITION */}

                      <div className="space-y-1.5">

                        <Label className="text-muted-foreground text-xs font-normal tracking-wider uppercase">
                          {t(
                            'settings.agents.position'
                          )}
                        </Label>

                        <div className="font-medium text-slate-900">
                          {getTypeLabel(
                            typeResolved
                          ) || '-'}
                        </div>


                        {(
                          typeResolved ===
                            'department_manager' ||
                          typeResolved ===
                            'branch_manager'
                        ) && (

                          <div className="text-sm text-slate-500">

                            {typeResolved ===
                            'department_manager'
                              ? resolveManagedLabel(
                                  manager
                                    .managed_department,
                                  isArabic
                                )
                              : resolveManagedLabel(
                                  manager
                                    .managed_branch,
                                  isArabic
                                )}

                          </div>

                        )}

                      </div>

                    </div>

                  </CardContent>

                </Card>
              );
            }
          )

        )}

      </div>


      {/* ===================================================
          ADD MANAGER MODAL
      =================================================== */}

      <Dialog
        open={
          isModalOpen
        }
        onOpenChange={
          handleModalOpenChange
        }
      >

        <DialogContent className="max-w-3xl">

          <DialogHeader>
            <DialogTitle>
              {t(
                'settings.agents.addNewAgent'
              )}
            </DialogTitle>
          </DialogHeader>


          <div className="grid gap-6 py-4">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* EMPLOYEE */}

              <div className="grid gap-2">

                <Label htmlFor="employee">
                  {t(
                    'settings.agents.manager'
                  )}
                </Label>


                <Select
                  value={
                    selectedEmployee
                  }
                  onValueChange={
                    setSelectedEmployee
                  }
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectEmployee'
                      )}
                    />
                  </SelectTrigger>


                  <SelectContent>

                    <div className="p-2">
                      <div className="relative">

                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                        <Input
                          placeholder={t(
                            'settings.agents.searchEmployee'
                          )}
                          value={
                            employeeSearch
                          }
                          onChange={(e) =>
                            setEmployeeSearch(
                              e.target.value
                            )
                          }
                          className="pl-8"
                        />

                      </div>
                    </div>


                    {Array.isArray(
                      filteredEmployees
                    ) &&
                      filteredEmployees.map(
                        (employee) => {
                          const employeeId =
                            getEmployeeId(
                              employee
                            );

                          return (
                            <SelectItem
                              key={
                                employeeId
                              }
                              value={String(
                                employeeId
                              )}
                            >
                              {employee.employee_code ||
                                employee.code ||
                                employeeId}{' '}
                              -{' '}
                              {getEmployeeDisplayName(
                                employee
                              )}
                            </SelectItem>
                          );
                        }
                      )}

                  </SelectContent>

                </Select>

              </div>


              {/* MANAGER TYPE */}

              <div className="grid gap-2">

                <Label htmlFor="type">
                  {t(
                    'settings.agents.position'
                  )}
                </Label>


                <Select
                  value={
                    selectedType
                  }
                  onValueChange={(
                    value
                  ) => {
                    setSelectedType(
                      value
                    );

                    if (
                      value !==
                      'department_manager'
                    ) {
                      setSelectedDepartment(
                        ''
                      );
                    }

                    if (
                      value !==
                      'branch_manager'
                    ) {
                      setSelectedBranch(
                        ''
                      );
                    }
                  }}
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectPosition'
                      )}
                    />
                  </SelectTrigger>


                  <SelectContent>

                    {MANAGER_TYPE_VALUES.map(
                      (typeValue) => (
                        <SelectItem
                          key={
                            typeValue
                          }
                          value={
                            typeValue
                          }
                        >
                          {getTypeLabel(
                            typeValue
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            </div>


            {/* DEPARTMENT */}

            {selectedType ===
              'department_manager' && (

              <div className="grid gap-2">

                <Label htmlFor="department">
                  {t(
                    'settings.agents.department'
                  )}
                </Label>

                <Select
                  value={
                    selectedDepartment
                  }
                  onValueChange={
                    setSelectedDepartment
                  }
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectDepartment'
                      )}
                    />
                  </SelectTrigger>

                  <SelectContent>

                    {departments.map(
                      (
                        department
                      ) => (
                        <SelectItem
                          key={
                            department.id
                          }
                          value={String(
                            department.id
                          )}
                        >
                          {getDepartmentLabel(
                            department
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            )}


            {/* BRANCH */}

            {selectedType ===
              'branch_manager' && (

              <div className="grid gap-2">

                <Label htmlFor="branch">
                  {t(
                    'settings.agents.branch'
                  )}
                </Label>

                <Select
                  value={
                    selectedBranch
                  }
                  onValueChange={
                    setSelectedBranch
                  }
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectBranch'
                      )}
                    />
                  </SelectTrigger>

                  <SelectContent>

                    {branches.map(
                      (branch) => (
                        <SelectItem
                          key={
                            branch.id
                          }
                          value={String(
                            branch.id
                          )}
                        >
                          {getBranchLabel(
                            branch
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            )}

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              type="button"
              onClick={() =>
                handleModalOpenChange(
                  false
                )
              }
            >
              {t(
                'common.cancel'
              )}
            </Button>


            <Button
              type="button"
              onClick={
                handleAddManager
              }
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? t(
                    'settings.agents.adding'
                  )
                : t(
                    'settings.agents.addAgent'
                  )}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* ===================================================
          EDIT MANAGER MODAL
      =================================================== */}

      <Dialog
        open={
          isEditModalOpen
        }
        onOpenChange={
          handleEditModalOpenChange
        }
      >

        <DialogContent className="max-w-3xl">

          <DialogHeader>
            <DialogTitle>
              {t(
                'settings.agents.editAgent'
              )}
            </DialogTitle>
          </DialogHeader>


          <div className="grid gap-6 py-4">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* EMPLOYEE */}

              <div className="grid gap-2">

                <Label>
                  {t(
                    'settings.agents.manager'
                  )}
                </Label>

                <Input
                  value={
                    editingManager
                      ? [
                          editingManager.code,
                          getManagerDisplayName(
                            editingManager
                          ),
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ' - '
                          )
                      : ''
                  }
                  readOnly
                  className="bg-muted"
                />

              </div>


              {/* TYPE */}

              <div className="grid gap-2">

                <Label>
                  {t(
                    'settings.agents.position'
                  )}
                </Label>


                <Select
                  value={
                    editSelectedType
                  }
                  onValueChange={(
                    value
                  ) => {
                    setEditSelectedType(
                      value
                    );

                    if (
                      value !==
                      'department_manager'
                    ) {
                      setEditSelectedDepartment(
                        ''
                      );
                    }

                    if (
                      value !==
                      'branch_manager'
                    ) {
                      setEditSelectedBranch(
                        ''
                      );
                    }
                  }}
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectPosition'
                      )}
                    />
                  </SelectTrigger>

                  <SelectContent>

                    {MANAGER_TYPE_VALUES.map(
                      (typeValue) => (
                        <SelectItem
                          key={
                            typeValue
                          }
                          value={
                            typeValue
                          }
                        >
                          {getTypeLabel(
                            typeValue
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            </div>


            {/* EDIT DEPARTMENT */}

            {editSelectedType ===
              'department_manager' && (

              <div className="grid gap-2">

                <Label>
                  {t(
                    'settings.agents.department'
                  )}
                </Label>

                <Select
                  value={
                    editSelectedDepartment
                  }
                  onValueChange={
                    setEditSelectedDepartment
                  }
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectDepartment'
                      )}
                    />
                  </SelectTrigger>

                  <SelectContent>

                    {departments.map(
                      (
                        department
                      ) => (
                        <SelectItem
                          key={
                            department.id
                          }
                          value={String(
                            department.id
                          )}
                        >
                          {getDepartmentLabel(
                            department
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            )}


            {/* EDIT BRANCH */}

            {editSelectedType ===
              'branch_manager' && (

              <div className="grid gap-2">

                <Label>
                  {t(
                    'settings.agents.branch'
                  )}
                </Label>

                <Select
                  value={
                    editSelectedBranch
                  }
                  onValueChange={
                    setEditSelectedBranch
                  }
                >

                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'settings.agents.selectBranch'
                      )}
                    />
                  </SelectTrigger>

                  <SelectContent>

                    {branches.map(
                      (branch) => (
                        <SelectItem
                          key={
                            branch.id
                          }
                          value={String(
                            branch.id
                          )}
                        >
                          {getBranchLabel(
                            branch
                          )}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            )}

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              type="button"
              onClick={() =>
                handleEditModalOpenChange(
                  false
                )
              }
            >
              {t(
                'common.cancel'
              )}
            </Button>


            <Button
              type="button"
              onClick={
                handleUpdateManager
              }
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? t(
                    'settings.agents.updating'
                  )
                : t(
                    'settings.agents.updateAgent'
                  )}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* ===================================================
          REPLACE MANAGER MODAL
      =================================================== */}

      <Dialog
        open={
          isReplaceModalOpen
        }
        onOpenChange={
          handleReplaceModalOpenChange
        }
      >

        <DialogContent className="max-w-2xl">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-2">

              <ArrowRightLeft className="h-5 w-5" />

              {t(
                'settings.agents.replaceManager',
                {
                  defaultValue:
                    'Replace Manager',
                }
              )}

            </DialogTitle>

          </DialogHeader>


          <div className="grid gap-6 py-4">

            {/* OLD MANAGER */}

            <div className="grid gap-2">

              <Label>
                {t(
                  'settings.agents.oldManager',
                  {
                    defaultValue:
                      'Old Manager',
                  }
                )}
              </Label>


              <Select
                value={
                  replaceOldManagerId
                }
                onValueChange={(
                  value
                ) => {
                  setReplaceOldManagerId(
                    value
                  );

                  /*
                   * Reset new manager if
                   * same one was previously selected.
                   */
                  if (
                    String(
                      replaceNewManagerId
                    ) ===
                    String(
                      value
                    )
                  ) {
                    setReplaceNewManagerId(
                      ''
                    );
                  }
                }}
              >

                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'settings.agents.selectOldManager',
                      {
                        defaultValue:
                          'Select old manager',
                      }
                    )}
                  />
                </SelectTrigger>


                <SelectContent>

                  {managers.map(
                    (manager) => {

                      const name =
                        getManagerDisplayName(
                          manager
                        );

                      return (
                        <SelectItem
                          key={
                            manager.id
                          }
                          value={String(
                            manager.id
                          )}
                        >

                          {manager.code
                            ? `${manager.code} - `
                            : ''}

                          {name ||
                            `#${manager.id}`}

                        </SelectItem>
                      );
                    }
                  )}

                </SelectContent>

              </Select>

            </div>


            {/* NEW MANAGER */}

            <div className="grid gap-2">

              <Label>
                {t(
                  'settings.agents.newManager',
                  {
                    defaultValue:
                      'New Manager',
                  }
                )}
              </Label>


              <Select
                value={
                  replaceNewManagerId
                }
                onValueChange={
                  setReplaceNewManagerId
                }
                disabled={
                  !replaceOldManagerId
                }
              >

                <SelectTrigger>

                  <SelectValue
                    placeholder={t(
                      'settings.agents.selectNewManager',
                      {
                        defaultValue:
                          'Select new manager',
                      }
                    )}
                  />

                </SelectTrigger>


                <SelectContent>

                  {/* SEARCH */}

                  <div className="p-2">

                    <div className="relative">

                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                      <Input
                        placeholder={t(
                          'settings.agents.searchEmployee'
                        )}
                        value={
                          replaceEmployeeSearch
                        }
                        onChange={(e) =>
                          setReplaceEmployeeSearch(
                            e.target.value
                          )
                        }
                        className="pl-8"
                      />

                    </div>

                  </div>


                  {/* EMPLOYEES */}

                  {filteredReplacementEmployees
                    .map(
                      (employee) => {
                        const employeeId =
                          getEmployeeId(
                            employee
                          );

                        if (
                          !employeeId
                        ) {
                          return null;
                        }

                        return (
                          <SelectItem
                            key={
                              employeeId
                            }
                            value={String(
                              employeeId
                            )}
                          >

                            {employee.employee_code ||
                              employee.code ||
                              employeeId}{' '}
                            -{' '}
                            {getEmployeeDisplayName(
                              employee
                            )}

                          </SelectItem>
                        );
                      }
                    )}

                </SelectContent>

              </Select>


              <p className="text-xs text-muted-foreground">
                {t(
                  'settings.agents.replaceDescription',
                  {
                    defaultValue:
                      'All employees assigned to the old manager will be transferred to the new manager.',
                  }
                )}
              </p>

            </div>

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              type="button"
              disabled={
                replaceManagerMutation
                  .isPending
              }
              onClick={() =>
                handleReplaceModalOpenChange(
                  false
                )
              }
            >
              {t(
                'common.cancel'
              )}
            </Button>


            <Button
              type="button"
              onClick={
                handleReplaceManager
              }
              disabled={
                !replaceOldManagerId ||
                !replaceNewManagerId ||
                replaceManagerMutation
                  .isPending
              }
              className="gap-2"
            >

              <ArrowRightLeft className="h-4 w-4" />

              {replaceManagerMutation
                .isPending
                ? t(
                    'settings.agents.replacing',
                    {
                      defaultValue:
                        'Replacing...',
                    }
                  )
                : t(
                    'settings.agents.replaceManager',
                    {
                      defaultValue:
                        'Replace Manager',
                    }
                  )}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* ===================================================
          DELETE MANAGER MODAL
      =================================================== */}

      <DeleteSettingsDialog
        open={
          deleteDialogOpen
        }
        onOpenChange={
          setDeleteDialogOpen
        }
        itemName="agent"
        onConfirm={
          handleDeleteConfirm
        }
        isDeleting={
          isDeleting
        }
      />

    </div>
  );
}
const ACTION_LABELS = {
  index: 'View',
  show: 'Show',
  store: 'Create',
  create: 'Create',
  update: 'Update',
  destroy: 'Delete',
  delete: 'Delete',
  save: 'Save',
  reset: 'Reset',
  hire: 'Hire',
  activate: 'Activate',
  inactivate: 'Inactivate',
  upload_image: 'Upload Image',
  assign: 'Assign',
  sheet: 'Sheet',
  fingerprint_issues: 'Fingerprint Issues',
  adjust_leave: 'Adjust Leave',
  delete_adjustment: 'Delete Adjustment',
  remove: 'Remove',
  month_lock: 'Month Lock',
  permissions: 'Permissions',
};

function toTitleCase(value = '') {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatModuleName(moduleKey = '') {
  return toTitleCase(moduleKey);
}

export function formatActionName(actionKey = '') {
  return ACTION_LABELS[actionKey] || toTitleCase(actionKey);
}

export function groupPermissionsByModule(permissions = []) {
  const modulesMap = new Map();

  permissions.forEach((permission) => {
    const rawName = permission?.name || '';

    let moduleKey = 'general';
    let actionKey = rawName;

    if (rawName.includes('.')) {
      const parts = rawName.split('.');
      moduleKey = parts[0];
      actionKey = parts.slice(1).join('.');
    }

    if (!modulesMap.has(moduleKey)) {
      modulesMap.set(moduleKey, {
        id: moduleKey,
        name: formatModuleName(moduleKey),
        actions: [],
      });
    }

    modulesMap.get(moduleKey).actions.push({
      id: permission.id,
      name: permission.name,
      actionKey,
      label: formatActionName(actionKey),
    });
  });

  return Array.from(modulesMap.values());
}

export function mapPermissionIds(permissionItems = []) {
  return new Set((permissionItems || []).map((item) => item.id));
}
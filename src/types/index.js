/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string[]} permissions
 */

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} department
 * @property {string} position
 * @property {number} salary
 * @property {string} hireDate
 * @property {'active'|'inactive'|'terminated'} status
 * @property {string} [address]
 * @property {string} [dateOfBirth]
 * @property {string} [emergencyContact]
 * @property {string} [emergencyPhone]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {Object} meta
 * @property {number} meta.total
 * @property {number} meta.page
 * @property {number} meta.limit
 * @property {number} meta.totalPages
 */

export {};

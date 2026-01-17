/**
 * Global admin constants for RBAC checks
 * These users have full permissions (create/update/delete) across the application
 */

export const ADMIN_USERNAMES = ['hien.than', 'triet.bui'] as const
export const ADMIN_IDS = [1490, 29] as const

export type AdminUsername = typeof ADMIN_USERNAMES[number]
export type AdminId = typeof ADMIN_IDS[number]

/**
 * Check if user is admin by username
 */
export function isAdminByUsername(username?: string | null): boolean {
  if (!username) return false
  return ADMIN_USERNAMES.includes(username as AdminUsername)
}

/**
 * Check if user is admin by ID
 */
export function isAdminById(id?: number | null): boolean {
  if (!id) return false
  return ADMIN_IDS.includes(id as AdminId)
}

/**
 * Check if user is admin (by username or ID)
 */
export function isAdmin(user: { username?: string | null; id?: number | null } | null): boolean {
  if (!user) return false
  return isAdminByUsername(user.username) || isAdminById(user.id)
}

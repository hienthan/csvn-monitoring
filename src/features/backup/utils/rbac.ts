import type { UserProfile } from '@/features/auth/types'
import { isAdmin } from '@/constants/admin'

/**
 * Check if user has backup admin permissions
 */
export function hasBackupAdmin(user: UserProfile | null): boolean {
  if (!user) return false
  return isAdmin(user) || user.syno_username === 'hien.than'
}

import type { TicketLinks } from './types'
import type PocketBase from 'pocketbase'
import { copyToClipboard } from '@/lib/utils/clipboard'

/**
 * Parse links field - supports JSON object/array or string (newline-separated URLs)
 */
export function parseLinks(links?: TicketLinks): Array<{ label?: string; url: string }> {
  if (!links) return []

  // If already an array of objects
  if (Array.isArray(links)) {
    return links.map((item) => {
      if (typeof item === 'string') {
        return { url: item }
      }
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        return {
          label: typeof obj.label === 'string' ? obj.label : undefined,
          url: typeof obj.url === 'string' ? obj.url : String(obj.url || ''),
        }
      }
      return { url: String(item) }
    })
  }

  // If it's an object (not array)
  if (typeof links === 'object' && links !== null) {
    const obj = links as Record<string, unknown>
    // If it has a single url property
    if (typeof obj.url === 'string') {
      return [{ label: typeof obj.label === 'string' ? obj.label : undefined, url: obj.url }]
    }
    // If it's a key-value object
    return Object.entries(obj).map(([key, value]) => ({
      label: key,
      url: typeof value === 'string' ? value : String(value || ''),
    }))
  }

  // If it's a string
  if (typeof links === 'string') {
    const str = links.trim()
    if (!str) return []

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(str)
      return parseLinks(parsed)
    } catch {
      // If not JSON, treat as newline-separated URLs
      return str
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // Try to parse as "label: url" format
          const colonIndex = line.indexOf(':')
          if (colonIndex > 0 && colonIndex < line.length - 1) {
            return {
              label: line.substring(0, colonIndex).trim(),
              url: line.substring(colonIndex + 1).trim(),
            }
          }
          return { url: line }
        })
    }
  }

  return []
}

/**
 * Normalize PocketBase errors to a consistent format
 */
export function normalizePbError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) {
    // Check if it's a PocketBase error with response data
    const pbError = error as Error & { response?: { data?: { message?: string } } }
    if (pbError.response?.data?.message) {
      return {
        message: pbError.response.data.message,
        details: pbError.response.data,
      }
    }
    return {
      message: error.message,
      details: error,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    if (typeof obj.message === 'string') {
      return {
        message: obj.message,
        details: obj,
      }
    }
  }

  return {
    message: String(error),
    details: error,
  }
}

/**
 * Generate ticket code in format: TCK-YYYY-######
 * @param year - Year (e.g., 2026)
 * @param seq - Sequence number (e.g., 123)
 * @returns Formatted code (e.g., "TCK-2026-000123")
 */
export function generateTicketCode(year: number, seq: number): string {
  const yearStr = String(year)
  const seqStr = String(seq).padStart(6, '0')
  return `TCK-${yearStr}-${seqStr}`
}

/**
 * Parse ticket code to extract year and sequence
 * @param code - Ticket code (e.g., "TCK-2026-000123")
 * @returns Object with year and seq, or null if invalid format
 */
export function parseTicketCode(code: string): { year: number; seq: number } | null {
  const match = code.match(/^TCK-(\d{4})-(\d{6})$/)
  if (!match) return null

  const year = parseInt(match[1], 10)
  const seq = parseInt(match[2], 10)

  if (isNaN(year) || isNaN(seq)) return null

  return { year, seq }
}

/**
 * Find an available ticket code for a given year
 * Checks uniqueness by querying PocketBase and increments sequence if needed
 * @param pb - PocketBase instance
 * @param year - Year to generate code for (defaults to current year)
 * @param startFromCode - Optional code to start checking from (will parse and continue from there)
 * @param maxRetries - Maximum number of retries (default: 20)
 * @returns Available ticket code
 */
export async function findAvailableTicketCode(
  pb: PocketBase,
  year?: number,
  startFromCode?: string,
  maxRetries: number = 20
): Promise<string> {
  const targetYear = year || new Date().getFullYear()
  
  // If startFromCode is provided, try to parse it and start from there
  let seq = 1
  if (startFromCode) {
    const parsed = parseTicketCode(startFromCode)
    if (parsed && parsed.year === targetYear) {
      seq = parsed.seq
    }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateTicketCode(targetYear, seq)

    try {
      // Check if code exists
      const existing = await pb.collection('ma_tickets').getList(1, 1, {
        filter: `code = "${code}"`,
      })

      if (existing.totalItems === 0) {
        // Code is available
        return code
      }

      // Code exists, try next sequence
      seq++
    } catch (error) {
      // If error is "not found" or similar, code is available
      // Otherwise, throw the error
      const normalized = normalizePbError(error)
      if (normalized.message.includes('404') || normalized.message.includes('not found')) {
        return code
      }
      throw error
    }
  }

  // If we've exhausted retries, throw an error
  throw new Error(
    `Unable to find available ticket code after ${maxRetries} attempts for year ${targetYear}`
  )
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) {
      return 'just now'
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    }
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
    if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
    }
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
    }
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`
  } catch {
    return 'N/A'
  }
}

/**
 * Copy ticket code to clipboard
 */
export async function copyTicketCode(code: string): Promise<boolean> {
  return copyToClipboard(code)
}

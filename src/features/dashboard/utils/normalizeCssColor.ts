/**
 * Normalizes CSS color values to valid SVG color strings
 * Handles cases where CSS variables return values like "0 0% 6.67%" without hsl() wrapper
 */
export function normalizeCssColor(value: string): string {
  if (!value || typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  // If already a valid color format, return as-is
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('rgb(') ||
    trimmed.startsWith('rgba(') ||
    trimmed.startsWith('hsl(') ||
    trimmed.startsWith('hsla(') ||
    trimmed.startsWith('oklch(') ||
    trimmed.startsWith('oklab(')
  ) {
    return trimmed
  }

  // Check if it matches the pattern: "0 0% 6.67%" or similar (HSL values without hsl() wrapper)
  // Pattern: number, number%, number% (with optional decimals)
  const hslPattern = /^\s*(\d+(\.\d+)?)\s+(\d+(\.\d+)?)%\s+(\d+(\.\d+)?)%\s*$/
  const match = trimmed.match(hslPattern)
  
  if (match) {
    // Wrap in hsl() function
    return `hsl(${trimmed})`
  }

  // Return original value if no pattern matches
  return trimmed
}

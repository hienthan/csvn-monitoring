import { useState, useEffect } from 'react'
import { normalizeCssColor } from '../utils/normalizeCssColor'

interface ChartTheme {
  text: string
  muted: string
  grid: string
  border: string
  surface: string
}

// Fallback colors (from previous debug values)
const FALLBACK_THEME: ChartTheme = {
  text: '#E5E7EB',
  muted: '#E5E7EB',
  grid: '#334155',
  border: '#94A3B8',
  surface: '#0B1220',
}

function getComputedCSSVar(varName: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return ''
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim()
    // Return value only if it's not empty and not just whitespace
    return value && value.length > 0 ? value : ''
  } catch (error) {
    console.warn(`Failed to get CSS variable ${varName}:`, error)
    return ''
  }
}

function getNormalizedTheme(): ChartTheme {
  const rawText = getComputedCSSVar('--heroui-foreground') || FALLBACK_THEME.text
  const rawMuted = getComputedCSSVar('--heroui-foreground-400') || FALLBACK_THEME.muted
  const rawGrid = getComputedCSSVar('--heroui-divider') || FALLBACK_THEME.grid
  const rawBorder = getComputedCSSVar('--heroui-divider') || FALLBACK_THEME.border
  const rawSurface = getComputedCSSVar('--heroui-content1') || FALLBACK_THEME.surface

  return {
    text: normalizeCssColor(rawText),
    muted: normalizeCssColor(rawMuted),
    grid: normalizeCssColor(rawGrid),
    border: normalizeCssColor(rawBorder),
    surface: normalizeCssColor(rawSurface),
  }
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() => getNormalizedTheme())

  useEffect(() => {
    // Watch for theme changes via MutationObserver
    const observer = new MutationObserver(() => {
      setTheme(getNormalizedTheme())
    })

    // Observe class changes on documentElement (for dark mode toggle)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}

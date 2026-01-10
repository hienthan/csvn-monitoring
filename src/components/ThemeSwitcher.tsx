import { useTheme } from 'next-themes'
import { Button } from '@heroui/react'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Button
            isIconOnly
            variant="light"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
    )
}

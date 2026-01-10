import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import { SearchProvider } from './lib/contexts/SearchContext'
import App from './app/App'
import './styles/globals.css'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <SearchProvider>
            <App />
          </SearchProvider>
        </BrowserRouter>
      </NextThemesProvider>
    </HeroUIProvider>
  </React.StrictMode>,
)


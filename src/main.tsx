import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'
import { SearchProvider } from './lib/contexts/SearchContext'
import App from './app/App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <SearchProvider>
          <App />
        </SearchProvider>
      </BrowserRouter>
    </HeroUIProvider>
  </React.StrictMode>,
)


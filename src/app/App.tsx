import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { Spinner } from '@heroui/react'

function App() {
  const element = useRoutes(routes)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }
    >
      {element}
    </Suspense>
  )
}

export default App


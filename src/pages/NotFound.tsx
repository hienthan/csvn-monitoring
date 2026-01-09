import { Card, CardBody } from '@heroui/react'
import { Link } from 'react-router-dom'
import { Button } from '@heroui/react'
import { Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardBody className="text-center space-y-4 py-8">
          <h1 className="text-6xl font-bold text-default-400">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-default-600">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button
              color="primary"
              startContent={<Home className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}

export default NotFound


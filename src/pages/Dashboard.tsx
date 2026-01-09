import { Card, CardBody, CardHeader } from '@heroui/react'

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Welcome to CSVN Monitoring</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-600">
            This is the dashboard page. The routing is working correctly!
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

export default Dashboard


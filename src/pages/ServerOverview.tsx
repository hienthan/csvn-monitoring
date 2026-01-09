import { Card, CardBody, CardHeader, Button } from '@heroui/react'
import { Ticket, Database } from 'lucide-react'

function ServerOverview() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-default-500">CPU Usage</p>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-semibold">--</p>
            <p className="text-xs text-default-400">Placeholder</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-default-500">RAM Usage</p>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-semibold">--</p>
            <p className="text-xs text-default-400">Placeholder</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-default-500">Disk Usage</p>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-semibold">--</p>
            <p className="text-xs text-default-400">Placeholder</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-default-500">Network</p>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl font-semibold">--</p>
            <p className="text-xs text-default-400">Placeholder</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              variant="flat"
              startContent={<Ticket className="w-4 h-4" />}
            >
              Add Ticket
            </Button>
            <Button
              color="default"
              variant="flat"
              startContent={<Database className="w-4 h-4" />}
            >
              View Backup
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ServerOverview


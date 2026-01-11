import { Card, CardBody, CardHeader, Button } from '@heroui/react'
import { Ticket, Database } from 'lucide-react'

function ServerOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">CPU Usage</p>
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs font-bold text-default-400">%</p>
            </div>
            <p className="text-[10px] text-success font-bold">Stable</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">RAM Usage</p>
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">4.2</p>
              <p className="text-xs font-bold text-default-400">GB</p>
            </div>
            <p className="text-[10px] text-default-400 font-bold">of 16GB</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">Disk Usage</p>
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">158</p>
              <p className="text-xs font-bold text-default-400">GB</p>
            </div>
            <p className="text-[10px] text-warning font-bold">64% full</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">Inbound Traffic</p>
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">1.2</p>
              <p className="text-xs font-bold text-default-400">MB/s</p>
            </div>
            <p className="text-[10px] text-primary font-bold">Normal</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card shadow="none" className="border-divider border bg-content1/50">
        <CardHeader className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2">
          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              variant="flat"
              startContent={<Ticket className="w-4 h-4" />}
              className="font-bold"
            >
              Add Ticket
            </Button>
            <Button
              color="default"
              variant="flat"
              startContent={<Database className="w-4 h-4" />}
              className="font-bold"
            >
              View Backup
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ServerOverviewPage


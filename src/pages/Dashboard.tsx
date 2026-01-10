import { Card, CardBody, Button } from '@heroui/react'
import { PageContainer } from '@/components/PageContainer'

function Dashboard() {
  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1 border-b border-divider pb-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-default-500 font-medium">System Overview & Analytics</p>
      </div>

      <Card shadow="sm" className="border-none bg-gradient-to-br from-content1 to-content2 overflow-hidden">
        <CardBody className="p-12 relative overflow-hidden">
          <div className="absolute top-[-128px] right-[-128px] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-status-pulse" />
          <div className="relative space-y-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">Welcome to CSVN Monitoring</h2>
            <p className="text-default-600 text-lg leading-relaxed">
              Real-time monitoring and management of your server infrastructure.
              Efficiency, reliability, and precision at your fingertips.
            </p>
            <div className="flex gap-4 pt-4">
              <Button color="primary" variant="shadow" size="lg" className="font-bold">
                View Infrastructure
              </Button>
              <Button variant="flat" size="lg" className="font-bold">
                System Logs
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default Dashboard


import { Card, CardBody, Button } from '@heroui/react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/PageContainer'

function Dashboard() {
  return (
    <PageContainer className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Dashboard</h1>
        <p className="text-xs font-bold text-default-400 uppercase tracking-widest">System Overview & Analytics</p>
      </div>

      <Card shadow="none" className="border border-divider bg-content1/50 overflow-hidden">
        <CardBody className="p-12 relative overflow-hidden">
          <div className="absolute top-[-128px] right-[-128px] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative space-y-4 max-w-2xl">
            <h2 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">Welcome to VG DATACENTER</h2>
            <p className="text-default-500 text-lg leading-relaxed">
              Real-time monitoring and management of your server infrastructure.
              Efficiency, reliability, and precision at your fingertips.
            </p>
            <div className="flex gap-4 pt-4">
              <Button 
                color="primary" 
                variant="solid" 
                size="lg" 
                className="font-bold px-8"
                as={Link}
                to="/servers"
              >
                View Infrastructure
              </Button>
              <Button 
                color="default" 
                variant="flat" 
                size="lg" 
                className="font-bold px-8"
                as={Link}
                to="/tickets"
              >
                View Tickets
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default Dashboard


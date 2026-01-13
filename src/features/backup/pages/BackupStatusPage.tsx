import { Card, CardBody, CardHeader } from '@heroui/react'
import { PageContainer } from '@/components/PageContainer'

export default function BackupStatusPage() {
  return (
    <PageContainer className="py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Backup Status</h1>
        <p className="text-sm text-default-500">Monitor and manage backup operations</p>
      </div>
      <Card shadow="none" className="border border-divider bg-content1/50">
        <CardHeader>
          <h2 className="text-xl font-semibold">Backup Monitoring</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-600">
            Backup status and monitoring will be displayed here.
          </p>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

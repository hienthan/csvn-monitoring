import { Card, CardBody, CardHeader } from '@heroui/react'

function BackupStatus() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Backup Status</h1>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Backup Monitoring</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-600">
            Backup status and monitoring will be displayed here.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

export default BackupStatus


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
} from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { appService } from '../services/appService'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'

function AppCreatePage() {
  const navigate = useNavigate()
  const { handleError } = useApiError()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repo_url: '',
    tech_stack: '',
    created_by: '',
    path: '',
    status: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return
    setLoading(true)
    try {
      const app = await appService.create(formData)
      navigate(`/apps/${app.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => navigate('/apps')}
              aria-label="Back to apps"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create New App
            </h1>
          </div>
          <p className="text-default-500 font-medium">Add a new application to monitor</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/apps')}
            isDisabled={loading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="app-create-form"
            color="primary"
            variant="shadow"
            isLoading={loading}
            isDisabled={loading || !formData.name?.trim()}
            className="font-bold px-8"
          >
            Create App
          </Button>
        </div>
      </div>

      <Card shadow="sm" className="border-none bg-content1 p-8">
        <CardBody className="p-0">
          <form id="app-create-form" onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="App Name"
              placeholder="e.g. User Service"
              value={formData.name}
              onValueChange={(v) => handleChange('name', v)}
              isRequired
              variant="flat"
            />

            <Textarea
              label="Description"
              placeholder="Enter app description"
              value={formData.description}
              onValueChange={(v) => handleChange('description', v)}
              minRows={4}
              variant="flat"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Repository URL"
                placeholder="https://github.com/user/repo"
                value={formData.repo_url}
                onValueChange={(v) => handleChange('repo_url', v)}
                variant="flat"
              />
              <Input
                label="Tech Stack"
                placeholder="e.g. React, Node.js, PostgreSQL"
                value={formData.tech_stack}
                onValueChange={(v) => handleChange('tech_stack', v)}
                variant="flat"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Created By"
                placeholder="Your name"
                value={formData.created_by}
                onValueChange={(v) => handleChange('created_by', v)}
                variant="flat"
              />
              <Input
                label="Path"
                placeholder="e.g. /var/www/app"
                value={formData.path}
                onValueChange={(v) => handleChange('path', v)}
                variant="flat"
              />
            </div>

            <Input
              label="Status"
              placeholder="e.g. running, stopped"
              value={formData.status}
              onValueChange={(v) => handleChange('status', v)}
              variant="flat"
            />
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default AppCreatePage


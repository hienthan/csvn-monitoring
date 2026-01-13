import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'
import { PageContainer } from '@/components/PageContainer'

function ThemePreviewPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [forceTheme, setForceTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = forceTheme || theme || 'light'
  const isDark = currentTheme === 'dark'

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setForceTheme(newTheme)
    setTheme(newTheme)
    // Force dark class on document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <PageContainer className="py-6 space-y-6">
      <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                    Theme Preview
                  </h1>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-widest mt-1">
                    Visual QA - Light vs Dark Mode
                  </p>
                </div>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={toggleTheme}
                  className="font-bold"
                >
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topbar Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Topbar</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="border-b border-divider bg-content1/60 backdrop-blur-md p-4 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">VG DATACENTER</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="light" isIconOnly>
                            🔔
                          </Button>
                          <Button size="sm" variant="light" isIconOnly>
                            🌙
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-default-500 mt-2">
                      Token: bg-content1/60, border-divider, text-foreground
                    </p>
                  </CardBody>
                </Card>

                {/* Sidebar Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Sidebar</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="bg-content1 dark:bg-[#0D1218] border-r border-divider p-4 rounded">
                      <div className="space-y-1">
                        <div className="px-3 py-2 rounded-md bg-primary/10 dark:bg-[rgba(76,141,255,0.15)] text-primary font-medium">
                          Active Item
                        </div>
                        <div className="px-3 py-2 rounded-md text-default-500 hover:bg-default-100 dark:hover:bg-content3">
                          Inactive Item
                        </div>
                        <div className="px-3 py-2 rounded-md text-default-400">
                          Muted Item
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-default-500 mt-2">
                      Token: bg-content1, dark:bg-[#0D1218], border-divider, text-primary, text-default-500
                    </p>
                  </CardBody>
                </Card>

                {/* Card Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Card</h3>
                  </CardHeader>
                  <CardBody>
                    <Card shadow="none" className="border border-divider bg-content1">
                      <CardBody className="p-4">
                        <p className="text-foreground">Card content with proper contrast</p>
                        <p className="text-default-500 text-sm mt-2">Muted text for secondary info</p>
                      </CardBody>
                    </Card>
                    <p className="text-xs text-default-500 mt-2">
                      Token: bg-content1, border-divider, text-foreground, text-default-500
                    </p>
                  </CardBody>
                </Card>

                {/* Table Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Table</h3>
                  </CardHeader>
                  <CardBody>
                    <Table
                      aria-label="Preview table"
                      removeWrapper
                      classNames={{
                        base: "min-h-[200px]",
                        th: "bg-content2 text-default-500 font-black text-[10px] uppercase tracking-wider h-10 px-4 border-b border-divider",
                        td: "py-2 px-4 border-b border-divider/50",
                        tr: "hover:bg-content3 transition-colors",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Server 1</TableCell>
                          <TableCell>
                            <Chip size="sm" color="success" variant="flat">
                              Running
                            </Chip>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Server 2</TableCell>
                          <TableCell>
                            <Chip size="sm" color="warning" variant="flat">
                              Pending
                            </Chip>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <p className="text-xs text-default-500 mt-2">
                      Token: bg-content1 (container), bg-content2 (header), bg-content3 (hover), border-divider
                    </p>
                  </CardBody>
                </Card>

                {/* Input Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Input</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <Input
                      label="Search"
                      placeholder="Enter search term"
                      variant="bordered"
                      className="max-w-xs"
                    />
                    <Input
                      label="Disabled"
                      placeholder="Disabled input"
                      variant="bordered"
                      isDisabled
                      className="max-w-xs"
                    />
                    <p className="text-xs text-default-500">
                      Token: Uses theme default input styling
                    </p>
                  </CardBody>
                </Card>

                {/* Select Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Select</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <Select
                      label="Environment"
                      placeholder="Select environment"
                      variant="bordered"
                      className="max-w-xs"
                    >
                      <SelectItem key="dev">Development</SelectItem>
                      <SelectItem key="stg">Staging</SelectItem>
                      <SelectItem key="prd">Production</SelectItem>
                    </Select>
                    <p className="text-xs text-default-500">
                      Token: Uses theme default select styling
                    </p>
                  </CardBody>
                </Card>

                {/* Buttons Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Buttons</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button color="primary" variant="solid">Primary</Button>
                      <Button color="primary" variant="flat">Flat</Button>
                      <Button color="primary" variant="bordered">Bordered</Button>
                      <Button color="primary" variant="light">Light</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button color="success" variant="solid">Success</Button>
                      <Button color="warning" variant="solid">Warning</Button>
                      <Button color="danger" variant="solid">Danger</Button>
                    </div>
                    <p className="text-xs text-default-500">
                      Token: Uses theme primary, success, warning, danger colors
                    </p>
                  </CardBody>
                </Card>

                {/* Chips Preview */}
                <Card className="border border-divider bg-content1">
                  <CardHeader>
                    <h3 className="text-lg font-bold">Chips</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Chip color="primary" variant="flat">Primary</Chip>
                      <Chip color="success" variant="flat">Success</Chip>
                      <Chip color="warning" variant="flat">Warning</Chip>
                      <Chip color="danger" variant="flat">Danger</Chip>
                      <Chip color="default" variant="flat">Default</Chip>
                    </div>
                    <p className="text-xs text-default-500">
                      Token: Uses muted semantic backgrounds (10-18% alpha) with readable text
                    </p>
                  </CardBody>
      </Card>
    </div>

    {/* Token Reference */}
    <Card className="border border-divider bg-content1">
                <CardHeader>
                  <h3 className="text-lg font-bold">Current Theme Tokens</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-bold text-foreground mb-2">Backgrounds</p>
                      <div className="space-y-1 text-default-500">
                        <div>background: {isDark ? '#0F141A' : '#f5f6f8'}</div>
                        <div>content1: {isDark ? '#151B22' : '#ffffff'}</div>
                        <div>content2: {isDark ? '#1C2430' : '#f8f9fa'}</div>
                        <div>content3: {isDark ? '#242F3D' : '#f1f3f5'}</div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-2">Text</p>
                      <div className="space-y-1 text-default-500">
                        <div>foreground: {isDark ? '#E6EDF7' : '#1a1d21'}</div>
                        <div>muted: {isDark ? '#A8B3C7' : '#868e96'}</div>
                        <div>tertiary: {isDark ? '#7F8BA3' : '#adb5bd'}</div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-2">Primary</p>
                      <div className="space-y-1 text-default-500">
                        <div>primary: {isDark ? '#4C8DFF' : '#2a5ba7'}</div>
                        <div>hover: {isDark ? '#3D7EF0' : '#356bb8'}</div>
                        <div>indicator: {isDark ? '#4C8DFF' : '#2a5ba7'}</div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-2">Borders</p>
                      <div className="space-y-1 text-default-500">
                        <div>divider: {isDark ? '#22314A' : 'rgba(0,0,0,0.08)'}</div>
                        <div>sidebar: {isDark ? '#0D1218' : '#ffffff'}</div>
                        <div>hover: {isDark ? '#242F3D' : '#f1f3f5'}</div>
                      </div>
                    </div>
      </div>
    </CardBody>
    </Card>
    </PageContainer>
  )
}

export default ThemePreviewPage


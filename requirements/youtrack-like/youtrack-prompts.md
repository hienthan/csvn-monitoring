1) Scope UI cần “YouTrack-like” tới mức nào

Bạn muốn “YouTrack-like” chủ yếu cho Tickets hay áp dụng luôn cho Servers?

(A) Chỉ Tickets (list + details)

(B) Tickets + Sidebar + Topbar toàn app

(C) Toàn app (Servers cũng đổi density/toolbar giống Issues)

Mục tiêu chính: đẹp & professional hay đúng UX pattern (split view, filters, quick actions, keyboard, saved searches)?

2) Router + hành vi điều hướng hiện tại

Bạn đang dùng router nào? (react-router v6?)

Tickets list và details đang là:

(A) 2 route tách: /tickets và /tickets/:id (như hình 3 breadcrumb “Tickets > …”)

(B) 1 page list, click mở drawer/modal (không đổi route)

(C) Split view đúng nghĩa: list trái + detail phải (có route /tickets/:id)

Bạn có muốn giữ nguyên pattern hiện tại hay muốn chuyển sang split view kiểu YouTrack (list vẫn thấy khi mở ticket)?

3) Component library & styling constraints

App đang dùng HeroUI version nào và đang dùng Tailwind đúng không?

Bạn có design tokens sẵn không (font-size, spacing, border, radius), hay cứ “YouTrack-ish” theo default Tailwind/HeroUI?

Bạn có chấp nhận thêm 1 lib nhẹ cho resizable split pane (vd react-resizable-panels) không?

Nếu không, mình sẽ yêu cầu Cursor tự làm divider drag bằng pointer events.

4) Data model tối thiểu để Cursor map đúng UI

Ticket object hiện có các fields nào (tên field chính xác trong code/types)?

code, title, description, status, priority, type, environment, assignee, requester, app_name, tags, updated, created…?

Status/priority/type/environment đang là enum values gì? (vd status: new, in_process, blocked, … hay “Waiting Dev” như UI?)

Comments/events lấy từ PocketBase collections nào và shape ra sao? (đúng như ma_ticket_comments, ma_ticket_events?)

Server object (cho server list page) fields chính xác: name, ip/host, docker_mode, environment, os, status, updated…?

5) Những vấn đề UI/UX bạn muốn sửa chắc chắn (ưu tiên)

Nhìn hình 2–3 mình thấy các điểm có thể “YouTrack hóa”. Bạn xác nhận giúp:
13. Ticket list: muốn toolbar/filter bar gọn hơn (hiện đang bị “trải ngang” và nhiều khoảng trống), đúng không?
14. Ticket list: muốn row density compact, title + subtitle (app/service) giống issues list, đúng không?
15. Ticket details: bạn muốn:

(A) Giữ layout 2 cột như hình 3 nhưng “tight/modern” hơn

(B) Chuyển sang “main content + fields sidebar có thể hide/show”

(C) Chuyển sang “tabs rõ ràng + activity stream hợp nhất”

Actions (view/edit/delete) trong list: muốn gom vào kebab menu hay giữ icon?

“New Ticket” button: muốn đưa vào top header (global) hay ở page Tickets?

6) Ràng buộc triển khai với Cursor

Bạn muốn Cursor:

(A) Chỉ sửa UI (tsx/css) — tuyệt đối không đụng services/hooks

(B) Được phép chỉnh nhẹ state management nếu cần (để controlled select, optimistic update…)

Bạn muốn output cuối cùng là:

(A) “Prompt cho Cursor” thôi

(B) Prompt + “file map” (nói rõ sửa file nào, tạo file nào)

(C) Prompt + checklist verify (UI acceptance criteria)

7) Chốt: danh sách file/page thực tế

Trong screenshot cây thư mục mình thấy:

features/tickets/pages/TicketListPage.tsx

features/tickets/pages/TicketDetailPage.tsx

features/tickets/pages/TicketCreatePage.tsx

layout/pages/Tickets.tsx (có vẻ wrapper route)

Bạn xác nhận flow hiện tại:

layout/pages/Tickets.tsx đang render cái gì? (tabs/router nested?)

TicketListPage.tsx có được dùng trực tiếp làm route không?

Cách trả lời nhanh (gợi ý format)

Trả lời theo mẫu này:
Scope: A

Router: react-router v6, route /tickets + /tickets/:id, muốn chuyển sang split view: Không

UI: HeroUI v2.0.0 + Tailwind, được thêm lib nhẹ nếu cần

Ticket fields: id, code, title, description, type, priority, status, environment, app_name, service_tags, requester_name, requester_contact, assignee, due_at, started_at, resolved_at, attachments, links, created, updated

Status values: new, triage, in_progress, waiting_dev, blocked, done, rejected

Priority values: low, normal, high, urgent

Type values: deploy_bugfix, deploy_feature, new_app_setup, dockerize, env_test_setup, db_migration, domain_ssl, ci_cd, monitoring_alert, backup_restore, access_permission

Environment values: dev, test, staging, prod

Comments/Events: ma_ticket_comments (ticket, author_name, message, attachments, created, updated), ma_ticket_events (ticket, event_type, from_value, to_value, actor_name, note, created, updated)

Server fields: id, name, host, ip, docker_mode, environment, os, status, created, updated

Ưu tiên sửa: 13/14/15(A)/16(A)/17(page)

Cursor constraint: B

File flow: layout/pages/Tickets.tsx chỉ là wrapper redirect tới TicketListPage, TicketListPage được dùng trực tiếp làm route /tickets

-----
part 2:
Nếu bạn muốn mình "khóa chặt" hơn nữa để Cursor sửa đúng file và không lan sang layout chung, bạn paste thêm vào đây đoạn import + component skeleton của:

TicketListPage.tsx

TicketDetailPage.tsx

Mình sẽ tinh chỉnh prompt để nêu đúng tên component con đang tồn tại (vd TicketOverviewTab, TicketCommentsTab, TicketEventsTab) và yêu cầu Cursor refactor theo hướng "merge Activity" mà vẫn tái sử dụng code cũ tối đa.

---

## Component Skeleton & Imports

### TicketListPage.tsx

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Skeleton,
  Card,
  CardBody,
  Button,
  Pagination,
  Select,
  SelectItem,
  Input,
  Tooltip,
} from '@heroui/react'
import { Plus, Search, X, Copy, Check, Eye, Edit, Trash2, User as UserIcon } from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import { useTicketFilters } from '../hooks/useTicketFilters'
import type { Ticket } from '../types'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import { formatRelativeTime, copyTicketCode } from '../utils'
import { EmptyState } from '@/components/EmptyState'

function TicketListPage() {
  const navigate = useNavigate()
  const { filters, setFilter, clearFilters } = useTicketFilters()
  const { tickets, loading, error, totalPages, currentPage, setCurrentPage, refetch } =
    useTickets(filters)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Handlers: handleCopyCode, handleRowClick, handlePageChange, handleAction
  // Render helpers: renderCell (switch case cho code, title, status, priority, assignee, updated, actions)
  
  // Structure:
  // - Header: h1 "Tickets" + "New Ticket" button
  // - Search & Filters Card: Input search + 5 Select filters (Status, Priority, Type, Environment, Clear)
  // - Tickets Table Card: Table với columns [code, title, priority, status, assignee, updated, actions]
  // - Pagination (nếu totalPages > 1)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Search & Filters Card */}
      {/* Tickets Table Card */}
      {/* Pagination */}
    </div>
  )
}

export default TicketListPage
```

### TicketDetailPage.tsx

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs,
  Tab,
  Chip,
  Card,
  CardBody,
  Skeleton,
  Button,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { ArrowLeft, RefreshCw, Edit, MoreVertical } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useTicket } from '../hooks/useTicket'
import TicketOverviewTab from '../components/TicketOverviewTab'
import TicketCommentsTab from '../components/TicketCommentsTab'
import TicketEventsTab from '../components/TicketEventsTab'
import { StatusChangeModal } from '../components/StatusChangeModal'
import { TicketEditModal } from '../components/TicketEditModal'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import type { TicketStatus, Ticket } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'
import { addEvent } from '../services/events.service'

function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { ticket, loading, error, refetch, changeStatus, update } = useTicket(ticketId)
  const { handleError } = useApiError()
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<TicketStatus | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  // Handlers: handleStatusChange, handleStatusSelect, handleEditSave
  
  // Structure:
  // - Breadcrumb: Back button + Breadcrumb component
  // - Ticket Info Header Card: Title + Status/Priority/Environment chips + Actions (Status Select, Edit, Refresh, More menu)
  // - Tabs Card: Tabs với 3 tabs:
  //   - Tab "overview": <TicketOverviewTab ticketId={ticketId} />
  //   - Tab "comments": <TicketCommentsTab ticketId={ticketId} />
  //   - Tab "events": <TicketEventsTab ticketId={ticketId} />
  // - Modals: StatusChangeModal, TicketEditModal
  
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      {/* Ticket Info Header Card */}
      {/* Tabs Card */}
      {/* Status Change Modal */}
      {/* Edit Modal */}
    </div>
  )
}

export default TicketDetailPage
```

### Child Components (đang tồn tại):

1. **TicketOverviewTab** (`features/tickets/components/TicketOverviewTab.tsx`)
   - Props: `{ ticketId?: string }`
   - Layout: 2 cột (8 cols left: Description, Requirements, Verification, Links, Attachments | 4 cols right: Summary, Quick Info)
   - Uses: `useTicket` hook

2. **TicketCommentsTab** (`features/tickets/components/TicketCommentsTab.tsx`)
   - Props: `{ ticketId?: string }`
   - Layout: Form add comment ở top + List comments bên dưới
   - Uses: `useTicketComments`, `useTicket` hooks

3. **TicketEventsTab** (`features/tickets/components/TicketEventsTab.tsx`)
   - Props: `{ ticketId?: string }`
   - Layout: Filter dropdown + Timeline events list
   - Uses: `useTicketEvents` hook

4. **StatusChangeModal** (`features/tickets/components/StatusChangeModal.tsx`)
   - Props: `{ isOpen, onClose, currentStatus, newStatus, assignee, hasResolvedAt, onConfirm }`

5. **TicketEditModal** (`features/tickets/components/TicketEditModal.tsx`)
   - Props: `{ isOpen, onClose, ticket, onSave }`
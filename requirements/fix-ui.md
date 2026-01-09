A) TicketOverviewTab.tsx nên chia layout như thế nào (best practice)

Trong Overview tab, bạn nên có 2 khối chính:

Summary (read-only detail view) – hiển thị các field dạng “label/value” gọn gàng

Description + checklist / requirements – phần nội dung dài, có thể markdown

Khuyến nghị layout: grid 12 cột

Trái (8 cột): Description, checklist/requirements, attachments

Phải (4 cột): Summary card + quick info (status/priority/env/assignee…)

B) Component mapping chi tiết cho từng phần
1) Summary (các field Code, App Name, Assignee, Type, Tags, Due Date, Env, Requester, Started At, Resolved At)

Dùng:

Card + CardHeader + CardBody

Divider

Chip cho status/priority/environment/type (những thứ có “state”)

Tooltip cho label dài / value bị truncate

Layout field: custom “KeyValue” component (không nhất thiết là HeroUI component riêng)

Prompt cho Cursor:

Refactor TicketOverviewTab.tsx phần Summary thành Card (HeroUI).

Bên trong dùng layout dạng dl/grid 2 cột: cột label muted, cột value rõ ràng.

Field dạng trạng thái (status/priority/environment/type) hiển thị bằng Chip (variant phù hợp), không render text thô.

Các value dài dùng truncate + Tooltip show full value.

Không để icon Edit lẻ tẻ trong Summary; editing thực hiện qua TicketEditModal từ header.

Lý do: Summary là read-only view; inline edit ở đây thường làm UI rối và gây “click conflict”.

2) Description (nội dung dài)

Dùng:

Card

Textarea chỉ trong edit modal

Nếu có markdown: render bằng markdown renderer (không phải HeroUI), nhưng wrapper vẫn là Card

Checklist: CheckboxGroup + Checkbox (nếu cần tick)

Prompt:

Description section dùng Card riêng.

Nếu description là markdown, render markdown trong CardBody (readonly).

Nếu có danh sách yêu cầu (ports/env vars/health check/notes), render thành List hoặc ul có spacing rõ ràng.

Nếu có checklist trạng thái công việc (optional), dùng CheckboxGroup (readonly trong Overview; edit trong modal).

3) Attachments / linked docs (nếu bạn có “env vars doc will provide”)

Dùng:

Link + Button variant light (icon + text)

Dropdown “More actions” nếu nhiều link

Snippet/Code style: nếu cần copy URL/command

Prompt:

Add Attachments section dưới Description:

Mỗi attachment hiển thị dạng row: icon + filename + size/date (nếu có) + action open/download.

Dùng Link hoặc Button variant light; tránh button primary.

4) “Meta” thông tin nhanh (Status/Priority/Env/Assignee) hiển thị bên phải

Dùng:

Card “Quick Info”

Chip cho status/priority/env

User component (HeroUI có User) cho Assignee/Requester (avatar + name + subtitle)

Prompt:

Create a right sidebar Card (Quick Info) trong Overview tab:

Render assignee/requester bằng HeroUI User (name + subtitle).

Status/Priority/Environment dùng Chip.

Due date/started/resolved hiển thị dạng text + formatted date.

C) Comments tab nên dùng component gì

Dùng:

List comment: Card per comment (hoặc 1 Card chứa list)

Comment composer: Textarea + Button

User component cho author

Dropdown per comment (edit/delete) nếu cần

Prompt:

TicketCommentsTab.tsx:

Top: composer Textarea + button “Add comment” (disabled khi empty).

Below: list comments, mỗi comment là Card nhỏ: header là User + timestamp, body là text/markdown, actions là Dropdown (optional).

Support loading skeleton & empty state.

D) Events tab nên dùng component gì

Events thường hợp nhất với timeline/list hơn là table.

Dùng:

Card

Listbox / Accordion / custom vertical timeline

Chip cho event type (status_changed, ticket_updated…)

Code/Snippet nếu event payload có changedFields

Prompt:

TicketEventsTab.tsx render events dạng timeline:

Mỗi row: timestamp (muted), Chip event type, actor, và detail (changedFields).

Nếu event là ticket_updated: hiển thị changedFields dạng Chip list.

Có empty state + skeleton.

------

F) Prompt chuẩn để Cursor làm Table custom cells (Tickets list)

Bạn có thể dùng prompt này cho trang list (không phải Overview):

Implement HeroUI Table với custom cells giống mẫu (name/subtitle, status chip, actions icons).
Requirements:

Columns: Code, Title (subtitle = app_name), Priority (Chip), Status (Chip), Assignee (User), UpdatedAt, Actions.

Use TableHeader, TableBody, TableRow, TableCell.

Create renderCell(ticket, columnKey) switch-case để custom render từng cột.

Actions column: IconButtons (View / Edit / Delete) có Tooltip; dùng onPress.

Support isLoading, empty state, pagination (optional).

Ensure alignment: header uppercase muted, cells vertically centered, consistent spacing, row hover.

Nếu Cursor vẫn làm “lệch trái lệch phải”, bạn thêm ràng buộc:

Use fixed widths for actions/status columns, and className="w-[...]" on TableColumn/TableCell where needed. Ensure align="center" for Actions.

G) “Các mục còn lại” trong Overview: bạn nên bổ sung gì để UI hoàn chỉnh

Dựa vào hình bạn gửi trước (ticket detail đang trống nhiều thứ), các mục thường có:

Service Requirements (ports, health check, volumes, env doc)

Card + list bullet / Accordion (nếu dài)

Verification (health endpoint, expected HTTP code)

Card + Snippet cho URL /health + expected 200

Runbook / Steps (DevOps steps)

Accordion hoặc Ordered list trong Card

Prompt:

In TicketOverviewTab, after Description add 2 cards:

“Requirements” card: show ports, env doc link, health check expectation, volume notes.

“Verification” card: show /health endpoint as copyable Snippet, expected status code as Chip.
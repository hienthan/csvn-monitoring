1) Prompt sửa tổng thể layout header + action buttons (đang lệch và dư thừa)

Prompt cho Cursor:

Fix Ticket Details header layout theo chuẩn app (MosaicLite + HeroUI).
Yêu cầu:

Header chia 2 khu: Left (Breadcrumb + Title + meta) và Right (Actions).

Title lớn “Setup docker…” nằm bên trái; meta dạng Chip: Status, Priority, Environment đặt cùng hàng/2 dòng ngay cạnh title.

Cụm action bên phải gom vào 1 hàng, canh phải:

Primary: Change Status (Dropdown/Select)

Secondary: Edit (Button)

Icon-only: Refresh (IconButton) và More (Dropdown menu)

Xoá icon “Edit” bị lặp ở khu vực Summary và header (hiện đang có 2 nút edit). Chỉ giữ 1 nút Edit chính ở header.

Responsive: khi màn hình hẹp, actions xuống dòng dưới và vẫn canh phải; không làm title bị nhảy vị trí.

Implement bằng HeroUI components: Breadcrumbs, Button, Dropdown, Chip, Divider (nếu cần). Dùng flex + gap + align để không lệch.

2) Prompt sửa “Change status dropdown không hiện selected new status”

Lỗi này thường do component đang “uncontrolled” hoặc set sai selectedKeys/value.

Prompt cho Cursor:

Fix Change Status control để luôn hiển thị status đang chọn.
Yêu cầu kỹ thuật:

Dùng HeroUI Select hoặc Dropdown nhưng phải là controlled component.

Khi user chọn status mới: cập nhật state selectedStatus, UI phải reflect ngay (optimistic).

Nếu save API thành công: update ticket record + append event status_changed.

Nếu save API fail: rollback về status cũ và show toast error.

Acceptance criteria:

Mở dropdown thấy status hiện tại được selected.

Chọn status mới xong, label hiển thị đúng ngay (không bị trống).

Reload trang vẫn đúng vì lấy từ ticket.status.

3) Prompt sửa “2 nút edit click không hoạt động” + vị trí không hợp lý

Prompt cho Cursor:

Fix toàn bộ Edit actions:

Hiện có 2 nút Edit (header + Summary) và cả 2 đang click không hoạt động.
Yêu cầu:

Chỉ giữ một nút Edit ở header (Button “Edit”).

Bấm Edit mở Modal (HeroUI) chứa form edit ticket (title, description, assignee, priority, environment, due_date, tags…).

Nút Save gọi API update ticket; success thì đóng modal + refresh data + append event ticket_updated với changedFields.

Nút Cancel đóng modal, không đổi dữ liệu.

Bắt buộc sửa event handler đúng chuẩn HeroUI: dùng onPress (không dùng onClick nếu component yêu cầu onPress).

Acceptance criteria:

Edit luôn mở modal. Save/Cancel hoạt động. Không còn nút Edit dư thừa ở Summary.

4) Prompt sửa “Overview fields không click để thay đổi”

Option A (khuyến nghị): chỉnh qua Modal (đơn giản, ít bug)

Prompt cho Cursor:

Overview tab hiện dạng read-only (display). Khi user muốn đổi field thì bấm Edit (ở header) mở modal.
Trong Overview: render bằng Card + Divider + layout 2–3 cột.
Không implement inline edit rải rác để tránh click conflict.

Acceptance criteria:

Overview nhìn như “detail view” gọn gàng, consistent spacing, không có icon Edit lẻ tẻ.

5) Prompt áp HeroUI Tabs đúng chuẩn (Overview / Comments / Events)

Trong hình, tab bar đang “rời rạc” và canh spacing chưa ổn.

Prompt cho Cursor:

Refactor Ticket Details body dùng HeroUI Tabs:

Tabs: Overview, Comments, Events.

Default tab = Overview.

Tab content nằm trong Card container, padding chuẩn, max width hợp lý.

Comments tab: list comment cards + composer ở top/bottom (HeroUI Textarea + Button).

Events tab: timeline/list gọn (HeroUI Listbox hoặc custom list + Chip cho event type).

Acceptance criteria:

Tabs canh trái, spacing đều, không trôi ra giữa trang như hiện tại.

6) Hero component để apply:
"Dùng HeroUI Select controlled cho status”, “Dùng Modal cho edit”, “Dùng Tabs cho 3 tab”, “Dùng Card cho Summary/Description”, "dùng table cho tickets list page".

7) Prompt gợi ý thêm theo best practice UI (dựa vào hình)

Bạn có thể đưa thêm các prompt sau để nâng chất lượng:

7.1 Spacing + typography + max-width

Apply layout constraints:

Main container max-w-[1100px] (hoặc theo MosaicLite), center, padding 24.

Title size rõ ràng (text-2xl/3xl), meta dùng Chip nhỏ.

Overview Summary dùng grid 2–3 cột, gap 24, label muted, value bold vừa.

7.2 States: loading / error / empty

Add UI states:

Loading: Skeleton cho header + overview.

Error: alert banner + retry button.

Empty comments/events: empty state component.

7.3 Status change safety

When changing status:

Nếu status chuyển sang “Resolved/Closed” thì yêu cầu confirm (Modal confirm).

Disable dropdown + show spinner trong lúc saving.

7.4 Accessibility + keyboard

Ensure a11y:

Buttons có aria-label (icon-only).

Tab navigation bằng keyboard ok.

Focus ring đúng chuẩn.
----
Prompt sửa cụ thể từng khu vực:

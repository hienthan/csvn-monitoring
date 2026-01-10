Prompt chuẩn để Cursor apply “YouTrack-like theme” (copy dùng ngay)
Prompt chính (theme tổng thể)

dựa vào các hình: manage-tickets.png, ticket-detail.png, ticket-list.png

hãy phân tích, suy nghĩ để có thể lấy ý tưởng, ngôn ngữ thiết kế để làm lại:
Left sidebar với màu sắc tương tự, top layout tương tự, ticket list và ticket details page tương tự.
Chỉ là ngôn ngữ thiết kế lấy cảm hứng từ các hình trên chớ k cần hoàn toàn giống, t k muốn đổi code quá nhiều.
Tăng container của các page lên chiếm tỉ lệ gần hết màn hình thay vì max là 6xl như hiện tại. Vì chỗ trống quá nhiều.
Thêm phần đê show dung lượng ổ cứng ở tab overrview.
Thêm Logo tương tự với chữ VG - đổi tên app thành VG Data Center

Apply a YouTrack-inspired UI theme (not a pixel-perfect clone).

Design goals:

Clean, minimal, enterprise internal tool style

Generous spacing, centered content (max-w-6xl)

Subtle colors, low visual noise, high readability

Theme rules:

Primary color: calm blue (not saturated)

Background: very light gray in light mode, dark gray/blue in dark mode

Borders: thin and subtle

Shadows: very soft or almost flat

Rounded corners: medium (cards, inputs)

Apply consistently to:

Cards, Tables, Tabs, Buttons, Inputs, Chips

Server pages, Ticket pages, Apps, Ports

Do not introduce flashy gradients or strong contrasts.

Prompt cho HeroUI + Tailwind tokens

Configure HeroUI and Tailwind tokens to match YouTrack-like appearance:

Use bg-background, bg-content1, bg-content2 instead of pure white

Text hierarchy: title > body > muted

Table header with subtle background

Chips use soft semantic colors (success/warning/danger)

Hover states are minimal and calm

Prompt cho Tabs (YouTrack-style)

Update Tabs to YouTrack-style:

Underline indicator only for active tab

No boxed tabs

Smooth transition

Active tab text slightly bolder

Inactive tabs muted

Prompt cho Table (rất quan trọng)

Update all tables to YouTrack-like style:

Compact rows

Subtle row hover

Header background slightly different from body

No heavy borders

Use spacing and typography instead of lines
--------------

Part 2:
A. Prompt “Design intent lock” (rất quan trọng – để AI không làm quá tay)

This is an internal enterprise tool UI inspired by YouTrack.
Design priorities (must follow strictly):

Clarity > decoration

Calm colors, no flashy gradients

Minimal shadows, mostly flat surfaces

Consistent spacing and typography across all pages

Do NOT:

Introduce marketing-style visuals

Use large gradients, neon colors, or heavy shadows

Change layout density inconsistently between pages

B. Prompt “Sidebar system” (để sidebar giống YouTrack thật sự)

Refactor the left sidebar as a system component, not page-specific:

Sidebar width is fixed and consistent across routes.

Use a dark, slightly bluish background in dark mode; neutral light gray in light mode.

Active item:

Calm blue text + icon

Thin vertical indicator on the left

Hover state:

Slight background tint only

Icons:

Same size and stroke width across items

Nested items (Tickets list / New Ticket):

Indented

Use lighter background highlight when active

Sidebar must never affect content width or cause horizontal scroll.

C. Prompt “Topbar behavior & hierarchy” (để không chỉ là 1 thanh trống)

Implement a global topbar with clear hierarchy:

Breadcrumb shows navigation context only (no redundancy with page title).

Page title is shown inside the page content, not in the breadcrumb.

Global search:

Searches across Servers, Apps, Ports, Tickets (UI only for now).

Placeholder text is descriptive but short.

Primary action button:

Context-aware by route.

Only one primary action at a time.

Topbar visual style:

Subtle background

Thin bottom border

No strong shadow

The topbar must feel “quiet” and not compete with page content.

D. Prompt “PageContainer contract” (để không bao giờ lệch width nữa)

Enforce a strict layout contract:

All pages must be wrapped in PageContainer.

PageContainer defines:

max width = 6xl

horizontal padding

vertical spacing rhythm

No page is allowed to override width, padding, or horizontal alignment.

If any page needs full-width content in the future, it must be an explicit exception, not default behavior.

E. Prompt “List pages system” (Server list & Ticket list cùng hệ)

Treat Servers list and Tickets list as one design system:

Same header layout (title + count + action).

Same search/filter placement.

Same table density and typography.

Same empty, loading, and error states.

Differences are only in columns and actions, not layout or styling.

F. Prompt “Tables – YouTrack-like density & behavior”

Tables must follow YouTrack-inspired rules:

Compact row height

Subtle row hover only

Header background slightly different from body

No heavy grid lines

Typography and spacing define structure, not borders

Avoid horizontal scrolling; columns should adapt or truncate gracefully.

G. Prompt “Custom cells & actions” (rất quan trọng cho UX)

Implement HeroUI Table custom cells consistently:

Name cell:

Primary text bold

Secondary info muted on second line

Status cell:

Use soft Chip colors (not saturated)

Actions cell:

Inline icon buttons (View / Edit / Copy / Delete)

Each icon has tooltip

No overflow menus unless actions > 4

Icons use isIconOnly, variant="light"

Actions must be immediately discoverable without opening menus.

H. Prompt “Tabs system” (Apps / Ports / Overview)

Tabs should be YouTrack-style:

Text-only tabs with underline indicator

No boxed or pill tabs

Active tab slightly bolder

Inactive tabs muted

Smooth underline transition

Each tab panel content:

Wrapped in Card

Clear padding

No leftover UI from other tabs

I. Prompt “Color & token discipline” (để theme không lệch)

Use HeroUI + Tailwind semantic tokens consistently:

Backgrounds: bg-background, bg-content1, bg-content2

Text: text-foreground, text-default-600, text-default-400

Borders: border-divider

Do not hardcode colors unless defining theme tokens.

J. Prompt “Final QA checklist” (bắt AI tự kiểm tra)

Before finalizing:

Verify all pages have identical content width

Verify sidebar active state matches route exactly.

Verify no horizontal scroll at any viewport size.

Verify light & dark mode readability.

Verify Servers list and Tickets list feel like the same product.
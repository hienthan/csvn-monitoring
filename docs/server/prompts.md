Bạn là AI coding assistant. Hãy implement logic fetch Netdata metrics cho Server Detail Page (React + TS). KHÔNG thay đổi layout tổng thể (layout đã xong). Chỉ thêm status line/badges và wiring dữ liệu.

Mục tiêu dữ liệu (tối giản, không mapping disk mount/interface):
- Dùng các chart: system.cpu, system.load, system.ram, system.swap, system.net, system.io
- Mỗi chart gọi /api/v1/data với points=1 để payload nhỏ.
- Thêm alarms (đẹp, gọn): lấy từ /api/v1/alarms và hiển thị badge counts.

Endpoints (host động theo server IP):
- GET http://{serverIp}:19999/api/v1/data?chart=system.cpu&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/data?chart=system.load&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/data?chart=system.ram&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/data?chart=system.swap&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/data?chart=system.net&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/data?chart=system.io&format=json&after=-30&points=1
- GET http://{serverIp}:19999/api/v1/alarms (optional nhưng cần cho UI badge)

Polling rules:
1) Chỉ fetch khi user đang ở Server Detail Page (route server/:id) và có serverIp.
2) Poll mỗi 15 giây.
3) Dừng polling ngay khi:
   - user rời detail page (unmount/route change)
   - document.visibilityState !== 'visible'
4) Mỗi request phải có timeout 3–5s và AbortController để tránh treo.
5) Nếu 2 chu kỳ poll liên tiếp fail: backoff interval = 60s. Khi success lại -> trở về 15s.
6) Không tạo nhiều interval chồng nhau (cleanup đúng).

Caching & UX:
- Giữ last good metrics trong state và tiếp tục hiển thị khi lỗi tạm thời (stale data).
- Lưu lastUpdated timestamp khi fetch thành công.
- Trạng thái Netdata:
  - Online: fetch OK
  - Degraded: fetch OK nhưng alarms warning/critical > 0 (hoặc một phần metric fail)
  - Offline: timeout/connection error liên tục

UI (không đổi layout, chỉ thêm các phần nhỏ):
A) Header của Server Detail:
- Thêm 1 dòng nhỏ bên phải: "Netdata: Online/Degraded/Offline" + "Last updated: HH:mm:ss"
- Thêm badges alarms ngay cạnh status (đẹp, gọn):
  - Critical: {count} (badge)
  - Warning: {count} (badge)
  - Nếu 0 hết thì ẩn hoặc hiển thị "No alerts"

B) Cards metrics:
- Loading: skeleton nhẹ (không làm giật layout)
- Error: hiển thị "—" và tooltip "Netdata timeout" hoặc "Connection refused"
- Network: hiển thị cả In/Out lấy từ system.net (format KB/s/MB/s)
- Disk IO: từ system.io hiển thị Read/Write (KB/s/MB/s)
- CPU/RAM/Swap/Load: format số gọn, thống nhất unit

Implementation details:
- Tạo 1 hook: useNetdataKpis({serverIp, enabled}) trả về:
  { data, alarms, status, lastUpdated, isLoading, isDegraded, error }
- Tạo helper parseNetdataDataResponse(resp) để lấy giá trị mới nhất từ response /api/v1/data (points=1).
- Với /api/v1/alarms: chỉ cần count theo status (CRITICAL/WARNING). Không cần render list alarms.
- Không hardcode layout mới, chỉ gắn status line + badges vào vị trí header hiện có và bind data vào cards.

Deliverables:
- Code thay đổi ở hook/service + minimal changes ở detail page component để hiển thị status/alarms và map metrics.
- Đảm bảo TypeScript types rõ ràng, xử lý null/undefined an toàn.

-----
Bug fix 1:
Bạn là AI coding assistant. Hãy fix bug Netdata metrics trên Server Detail Page để UI luôn hiển thị dữ liệu mới nhất và sửa đúng mapping cho Disk I/O + Swap. KHÔNG thay đổi layout tổng thể, chỉ sửa logic fetch/parse/state update và bổ sung badges alert.

1) Endpoints dùng (tối giản):
- system.cpu:  GET http://{serverIp}:19999/api/v1/data?chart=system.cpu&format=json&after=-30&points=1
- system.load: GET http://{serverIp}:19999/api/v1/data?chart=system.load&format=json&after=-30&points=1
- system.ram:  GET http://{serverIp}:19999/api/v1/data?chart=system.ram&format=json&after=-30&points=1
- system.net:  GET http://{serverIp}:19999/api/v1/data?chart=system.net&format=json&after=-30&points=1
- system.io:   GET http://{serverIp}:19999/api/v1/data?chart=system.io&format=json&after=-30&points=1
- swap:        dùng mem.swap (vì system.swap 404 trên host này)
  GET http://{serverIp}:19999/api/v1/data?chart=mem.swap&format=json&after=-30&points=1
- alarms:      GET http://{serverIp}:19999/api/v1/alarms

2) Fix Disk I/O parsing (bắt buộc đúng với dữ liệu thực tế)
- Response system.io có labels: ["time","reads","writes"].
- Khi parse, phải lấy đúng 2 dimension "reads" và "writes" (đúng chính tả, số nhiều).
- Giá trị writes có thể âm => hiển thị abs(writes) để tránh negative.
- Card tên là "Disk I/O" (không phải disk space usage). Hiển thị Read/Write theo KB/s hoặc MB/s.

3) Fix Swap parsing
- mem.swap có labels: ["time","free","used"].
- UI hiển thị "Swap Used" = used, có thể thêm "Swap Free" nhỏ bên dưới nếu muốn.
- Nếu mem.swap cũng fail/404 => coi như swapUnavailable và hiển thị "Swap: —" (tooltip: not available).

4) Fix bug UI không cập nhật latest data (root cause thường gặp: interval/cleanup/state closure)
- Implement polling đúng:
  - Chỉ chạy khi đang ở Server Detail Page + có serverIp.
  - Interval 15s (refetch).
  - Dừng polling khi unmount/route change/serverId change hoặc document.visibilityState !== 'visible'.
  - Không được tạo nhiều interval chồng nhau.
- Mỗi request phải có timeout 3–5s và AbortController; hủy request cũ khi refresh hoặc khi rời trang.
- Đảm bảo state update luôn lấy kết quả fetch mới nhất:
  - Không dùng stale closure trong setInterval.
  - Dùng một hàm async poll() và schedule bằng setTimeout hoặc dùng React Query/SWR refetchInterval.
- Chỉ update UI bằng data từ "last row" của resp.data. Set lastUpdated = new Date() khi poll thành công.
- Thêm debug DEV-only: log labels + last row values 1 lần khi metric về 0 bất thường để kiểm tra.

5) Alerts UI
- Parse /api/v1/alarms và tính counts:
  - criticalCount, warningCount (đếm các alarm đang active/raised).
- Trên header, luôn hiển thị 2 badge cạnh nhau, có icon:
  - [AlertOctagon] Critical: {criticalCount} (show 0 nếu không có)
  - [AlertTriangle] Warning: {warningCount} (show 0 nếu không có)
- Netdata status text: Online/Degraded/Offline + Last updated HH:mm:ss
  - Offline: fetch fail
  - Degraded: warningCount>0 hoặc criticalCount>0 hoặc một phần metric fail

6) Deliverables
- Tạo hook/service useNetdataKpis(serverIp, enabled) trả về:
  { cpu, load, ram, swapUsed, swapFree, diskRead, diskWrite, netIn, netOut, alarms, status, lastUpdated, isLoading, error }
- Update component detail page để bind đúng dữ liệu vào cards hiện có và header badges/status.
- KHÔNG thay đổi layout/spacing tổng thể.

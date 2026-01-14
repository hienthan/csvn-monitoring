BACKUP FEATURE – CONTEXT OVERVIEW (PocketBase)
1. Bối cảnh vận hành thực tế

Team nhỏ, internal apps, dữ liệu ít.

Hiện tại 1 server chính chạy hầu hết app production.

Apps chạy bằng Docker, data chủ yếu nằm ngoài container (bind mount).

Backup hiện tại:

Chạy bằng script trên server (cron/systemd timer).

Lưu backup local trên server, giữ tối đa ~3 ngày.

Xoá thủ công.

Có workload lớn riêng: CCTV ~4GB/ngày.

👉 Backup feature trong Monitoring App không thay thế hệ thống backup hiện tại, mà:

Chuẩn hoá.

Quan sát.

Quản lý trạng thái.

Trigger (manual / schedule).

Mở đường cho tự động hoá sau này.

2. Triết lý thiết kế Backup Feature
Không backup “container” làm mặc định

Backup theo DATASET, không theo container runtime.

Container image có thể rebuild; dữ liệu mới là thứ cần bảo vệ.

Backup target = 1 đơn vị quản lý

Một app có thể có nhiều backup target, ví dụ:

Database dump.

Uploads / filesystem.

CCTV daily files.

(Optional) Docker volume hoặc container snapshot.

👉 Monitoring App quản lý target, không quản lý logic bên trong script.

3. Vai trò của Monitoring App (GUI + API)

Monitoring App KHÔNG thực hiện backup trực tiếp, mà:

Lưu metadata + config của backup.

Trigger script backup qua API (manual hoặc scheduler).

Ghi nhận kết quả lần chạy gần nhất:

Success / Failed / Overdue.

Thời gian chạy.

Dung lượng backup.

Log / error summary.

Hiển thị cho leader/dev:

App nào đã backup.

App nào tới hạn nhưng chưa backup.

Lý do failed.

4. PocketBase – Cách tiếp cận đúng
Nguyên tắc

1 collection = 1 backup target.

Không tạo nhiều bảng phức tạp ngay từ đầu.

Dùng field + JSON để mở rộng, tránh migrate liên tục.

Collection đề xuất: ma_backups
5. Collection ma_backups – Logical Structure
A. Identity & Scope
Field	Type	Ý nghĩa
app_id	relation → ma_apps	Backup thuộc app nào
server_id	relation → ma_servers	Server thực hiện backup
name	text	Tên target (db, uploads, cctv_daily…)
description	text	Mô tả ngắn
B. Backup Target Definition
Field	Type	Ghi chú
target_type	select	db_dump, filesystem, docker_volume, docker_container_optional
source_ref	text	Path / volume / db alias
backup_script	text	Path script chính
pre_hook_script	text	Optional
post_hook_script	text	Optional

👉 PocketBase không chạy script, chỉ lưu reference.

C. Schedule & Due Logic
Field	Type	Ghi chú
schedule_type	select	cron, daily, weekly, manual_only
schedule_spec	text	Cron hoặc giờ chạy
timezone	text	Default: Asia/Ho_Chi_Minh
next_due_at	date	Để tính overdue
grace_minutes	number	Cho phép trễ
D. Storage & Retention
Field	Type	Ghi chú
storage_backend	select	local_fs, nas, s3, remote
storage_path_template	text	/backups/{app}/{target}/{date}
retention_keep_days	number	Default: 3
retention_keep_last_n	number	Optional
compression	select	none, gzip, zstd
encryption	bool	Optional
E. Last Run Status (quan trọng cho GUI)
Field	Type	Ý nghĩa
last_run_at	date	Lần chạy gần nhất
last_status	select	success, failed, running, overdue
last_success_at	date	Để xác định health
last_duration_ms	number	Thời gian chạy
last_backup_size_bytes	number	Dung lượng
last_artifact_path	text	File/tar path
last_exit_code	number	Exit code
last_error_summary	text	Log ngắn cho GUI
last_log_path	text	Path log đầy đủ

👉 GUI chỉ cần collection này là đủ để vẽ dashboard backup.

F. Control & Audit
Field	Type	Ghi chú
is_enabled	bool	Bật/tắt backup
last_triggered_by	select	scheduler, manual, api
last_triggered_user_id	relation → users	Nullable
script_version	text	Optional
meta	json	Mở rộng tự do
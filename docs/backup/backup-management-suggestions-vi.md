# Đề Xuất Quản Lý Backup - Hệ Thống Nội Bộ Nhỏ

## Tổng Quan

Tài liệu này cung cấp các đề xuất thực tế và đơn giản cho việc quản lý backup cho một đội nhỏ với các ứng dụng nội bộ. Các đề xuất tập trung vào tính thực tiễn, dễ triển khai và bảo trì.

## 1. Chiến Lược Backup Cơ Bản

### 1.1. Quy Tắc 3-2-1 (Đơn Giản Hóa)

- **3 bản sao**: Dữ liệu gốc + 2 bản backup
- **2 loại phương tiện**: Local (server) + External (cloud hoặc USB)
- **1 bản offsite**: Backup ở nơi khác (cloud hoặc server khác)

### 1.2. Tần Suất Backup

**Cho ứng dụng nhỏ nội bộ:**
- **Database**: Hàng ngày (daily) - vào lúc 2-3h sáng
- **Files/Code**: Hàng tuần (weekly) - cuối tuần
- **Cấu hình hệ thống**: Hàng tháng (monthly) - đầu tháng

**Lưu ý**: Tần suất có thể điều chỉnh dựa trên tần suất thay đổi dữ liệu.

## 2. Các Loại Backup Cần Thiết

### 2.1. Database Backup

**Mục đích**: Bảo vệ dữ liệu quan trọng nhất

**Cách thực hiện:**
- Sử dụng công cụ native của database (mysqldump, pg_dump, mongodump)
- Backup toàn bộ database hoặc từng database riêng
- Nén file backup để tiết kiệm dung lượng

**Ví dụ script đơn giản:**
```bash
#!/bin/bash
# Backup MySQL database
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u user -p database_name | gzip > /backup/db_${DATE}.sql.gz
# Giữ lại 7 bản gần nhất
ls -t /backup/db_*.sql.gz | tail -n +8 | xargs rm -f
```

### 2.2. Application Files Backup

**Mục đích**: Backup code, cấu hình, upload files

**Cách thực hiện:**
- Backup thư mục application (code, config)
- Backup thư mục uploads/user files
- Sử dụng tar hoặc zip để nén

**Ví dụ:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/app_${DATE}.tar.gz /var/www/app
# Giữ lại 4 bản gần nhất (1 tháng)
ls -t /backup/app_*.tar.gz | tail -n +5 | xargs rm -f
```

### 2.3. System Configuration Backup

**Mục đích**: Backup cấu hình server, nginx, firewall rules

**Cách thực hiện:**
- Backup `/etc` directory (cẩn thận với passwords)
- Backup cấu hình nginx/apache
- Backup SSL certificates
- Backup cron jobs

## 3. Lưu Trữ Backup

### 3.1. Local Storage (Trên Server)

**Ưu điểm**: Nhanh, dễ truy cập
**Nhược điểm**: Nếu server hỏng, mất cả backup

**Khuyến nghị**: 
- Chỉ dùng cho backup tạm thời
- Giữ tối đa 3-7 ngày
- Tự động xóa backup cũ

### 3.2. External Storage

**Tùy chọn:**
- **Cloud Storage**: Google Drive, Dropbox, OneDrive (miễn phí đến 15GB)
- **VPS khác**: Server backup riêng (nếu có)
- **USB/External HDD**: Backup thủ công định kỳ

**Khuyến nghị cho đội nhỏ:**
- Sử dụng cloud storage miễn phí cho backup quan trọng
- Sync tự động qua rclone hoặc script
- Mã hóa backup nhạy cảm trước khi upload

### 3.3. Rotation Policy (Xoay Vòng Backup)

**Chính sách đơn giản:**
- **Daily**: Giữ 7 ngày
- **Weekly**: Giữ 4 tuần (1 tháng)
- **Monthly**: Giữ 3 tháng

**Ví dụ cấu trúc:**
```
/backup/
  ├── daily/
  │   ├── db_20250110_020000.sql.gz
  │   └── db_20250109_020000.sql.gz
  ├── weekly/
  │   ├── db_20250105_020000.sql.gz
  │   └── db_20241229_020000.sql.gz
  └── monthly/
      ├── db_20250101_020000.sql.gz
      └── db_20241201_020000.sql.gz
```

## 4. Tự Động Hóa Backup

### 4.1. Cron Jobs

**Setup cron job cho backup tự động:**

```bash
# Backup database hàng ngày lúc 2h sáng
0 2 * * * /path/to/backup-db.sh

# Backup files hàng tuần vào Chủ Nhật lúc 3h sáng
0 3 * * 0 /path/to/backup-files.sh

# Backup cấu hình hàng tháng ngày 1 lúc 4h sáng
0 4 1 * * /path/to/backup-config.sh
```

### 4.2. Notification

**Thông báo khi backup thành công/thất bại:**
- Gửi email khi backup hoàn thành
- Gửi cảnh báo khi backup thất bại
- Log vào file để theo dõi

**Ví dụ:**
```bash
# Gửi email sau khi backup
if [ $? -eq 0 ]; then
    echo "Backup thành công: $(date)" | mail -s "Backup Success" admin@company.com
else
    echo "Backup thất bại: $(date)" | mail -s "Backup Failed" admin@company.com
fi
```

## 5. Kiểm Tra và Test Backup

### 5.1. Kiểm Tra Định Kỳ

**Hàng tuần:**
- Kiểm tra backup có được tạo đúng lịch không
- Kiểm tra dung lượng backup
- Kiểm tra file backup có hợp lệ không

**Hàng tháng:**
- Test restore một file/database nhỏ
- Kiểm tra thời gian restore
- Xác minh dữ liệu sau khi restore

### 5.2. Test Restore Procedure

**Quy trình test:**
1. Tạo môi trường test riêng
2. Restore backup vào môi trường test
3. Kiểm tra ứng dụng hoạt động bình thường
4. Ghi lại thời gian và các vấn đề gặp phải

## 6. Best Practices Cho Đội Nhỏ

### 6.1. Đơn Giản Hóa

- **Không over-engineer**: Chỉ backup những gì thực sự cần
- **Tự động hóa tối đa**: Tránh backup thủ công
- **Documentation**: Ghi lại quy trình backup/restore

### 6.2. Ưu Tiên

**Backup quan trọng nhất:**
1. Database (dữ liệu người dùng, transactions)
2. Upload files (hình ảnh, documents)
3. Cấu hình ứng dụng
4. Code (thường đã có trên Git)

### 6.3. Chi Phí

**Cho đội nhỏ:**
- Sử dụng cloud storage miễn phí (15GB thường đủ)
- Nén backup để tiết kiệm dung lượng
- Xóa backup cũ tự động
- Chỉ backup production, không backup dev/test

## 7. Công Cụ Đề Xuất

### 7.1. Backup Scripts

- **Bash scripts**: Đơn giản, dễ customize
- **Python scripts**: Nếu cần logic phức tạp hơn

### 7.2. Sync Tools

- **rclone**: Sync với cloud storage (Google Drive, Dropbox)
- **rsync**: Sync giữa các server
- **scp/sftp**: Copy backup lên server khác

### 7.3. Monitoring

- **Simple log file**: Ghi log backup vào file
- **Email notification**: Thông báo qua email
- **Health check script**: Kiểm tra backup định kỳ

## 8. Kế Hoạch Triển Khai

### Bước 1: Đánh Giá Hiện Trạng
- Liệt kê các ứng dụng cần backup
- Xác định dữ liệu quan trọng
- Đánh giá dung lượng cần backup

### Bước 2: Thiết Lập Backup Cơ Bản
- Tạo script backup database
- Tạo script backup files
- Setup cron jobs

### Bước 3: Tự Động Hóa
- Tự động xóa backup cũ
- Tự động sync lên cloud
- Tự động gửi thông báo

### Bước 4: Test và Cải Thiện
- Test restore procedure
- Điều chỉnh tần suất backup
- Tối ưu dung lượng backup

## 9. Lưu Ý Quan Trọng

### 9.1. Bảo Mật

- **Mã hóa backup nhạy cảm**: Database có thông tin người dùng
- **Quyền truy cập**: Chỉ admin mới có quyền truy cập backup
- **Không backup passwords**: Tránh backup file chứa passwords dạng plain text

### 9.2. Documentation

- **Ghi lại quy trình**: Backup và restore procedure
- **Liệt kê backup locations**: Biết backup ở đâu
- **Contact information**: Ai chịu trách nhiệm backup

### 9.3. Disaster Recovery Plan

**Kịch bản cần chuẩn bị:**
- Server bị hỏng hoàn toàn
- Database bị corrupt
- Files bị xóa nhầm
- Ransomware attack

**Thời gian phục hồi mục tiêu (RTO):**
- Database: < 1 giờ
- Application: < 4 giờ
- Toàn bộ hệ thống: < 24 giờ

## 10. Kết Luận

Với một đội nhỏ và ứng dụng nội bộ, việc quản lý backup không cần phức tạp. Quan trọng nhất là:

1. **Tự động hóa**: Backup phải chạy tự động, không phụ thuộc vào con người
2. **Kiểm tra định kỳ**: Đảm bảo backup hoạt động đúng
3. **Test restore**: Biết cách restore khi cần
4. **Đơn giản**: Dễ hiểu, dễ bảo trì

Bắt đầu với backup cơ bản, sau đó cải thiện dần dần dựa trên nhu cầu thực tế.

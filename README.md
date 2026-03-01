# Backend-API-student-monitoring
Middleware
authMiddleware → Xác thực token
roleMiddleware → Kiểm tra quyền truy cập (Admin, Lecturer, Student)
🧠 Logic hoạt động
User đăng ký → lưu vào collection users
Admin tạo sinh viên → lưu vào students
Sinh viên đăng nhập → nhận token
Sinh viên check-in → lưu vào checkins
Giảng viên/Admin xem dữ liệu
Database Schema (Tóm tắt)
User
name
email
password (hashed)
role (admin | lecturer | student)
Student
userId
studentCode
class
hometown
Checkin
studentId
time
status
location
🧪 Test API
Có thể test bằng:
Thunder Client (VSCode)
Postman
 Tính năng chính
✔ Xác thực JWT
✔ Phân quyền theo role
✔ CRUD sinh viên
✔ Điểm danh sinh viên
✔ Middleware bảo mật
Hướng phát triển tương lai
Tích hợp GPS check-in
Upload hình ảnh khi điểm danh
Dashboard thống kê
Triển khai Docker
Deploy lên Render / Railway

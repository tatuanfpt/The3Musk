# Project: 3Musk - Small Team Task Management

## 1. Business Objective
Dự án **3Musk** được xây dựng nhằm tối ưu hóa hiệu suất làm việc cho các nhóm nhỏ (đặc biệt là nhóm 3 người - "The Three Musketeers"). Mục tiêu là tạo ra một môi trường cộng tác chặt chẽ, nơi mọi thành viên đều nắm bắt được tiến độ của nhau theo tinh thần "Một người vì mọi người, mọi người vì một người".

- **Mục tiêu 1:** Cung cấp giao diện quản lý task tối giản, tập trung vào hành động.
- **Mục tiêu 2:** Tăng cường tính trách nhiệm thông qua việc minh bạch hóa trạng thái công việc của từng thành viên.
- **Mục tiêu 3:** Xây dựng dashboard chung giúp nhóm đưa ra quyết định nhanh chóng dựa trên dữ liệu thực tế.

## 2. Business Rules (Quy tắc nghiệp vụ)
- **BR-01:** Một không gian làm việc (Workspace) chỉ cho phép tối đa 3 thành viên chính (Musketeers).
- **BR-02:** Mọi task khởi tạo phải được gán cho ít nhất một thành viên.
- **BR-03:** Task chỉ được chuyển sang trạng thái "Done" khi người được gán hoàn thành và ít nhất một thành viên khác xác nhận (Review).
- **BR-04:** Dashboard tổng quan phải hiển thị cân bằng tải (Workload) giữa 3 người để tránh quá tải cho bất kỳ ai.

## 3. System Requirements Specification (SRS)

### 3.1. Functional Requirements (Yêu cầu chức năng)
| ID | Chức năng | Mô tả chi tiết | Ưu tiên |
|:---|:---|:---|:---|
| FR-01 | Quản lý thành viên | Thêm/Sửa/Xóa thông tin 3 thành viên chính. | High |
| FR-02 | Kanban Board | Kéo thả task qua các trạng thái: Todo, In Progress, Review, Done. | High |
| FR-03 | Phân quyền Task | Gán người chịu trách nhiệm và deadline cho từng task. | High |
| FR-04 | Thông báo | Cập nhật khi có thay đổi trạng thái task hoặc comment mới. | Medium |
| FR-05 | Báo cáo hiệu suất | Biểu đồ tròn hiển thị tỉ lệ hoàn thành công việc của nhóm. | Low |

### 3.2. Non-functional Requirements (Yêu cầu phi chức năng)
- **Hiệu năng:** Tải trang đầu tiên dưới 1.5 giây.
- **Bảo mật:** Lưu trữ dữ liệu an toàn, mã hóa thông tin nhạy cảm.
- **Tính khả dụng:** Giao diện Dark/Light mode, tối ưu cho cả Mobile và Desktop.

### 3.3. System Architecture & Constraints
- **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript (Vanilla ES6+).
- **State Management:** Reactive state pattern with LocalStorage.
- **Backend/DB:** LocalStorage (Client-side persistence).
- **Deployment:** GitHub Pages (tối ưu cho bản demo nhanh).

---
*Tài liệu này được khởi tạo bởi AI Project Manager. Vui lòng cung cấp chi tiết "Task mô tả" để tôi có thể cập nhật nội dung chính xác nhất.*

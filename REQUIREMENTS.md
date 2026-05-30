# Project: 3Musk - Small Team Task Management with One Thing AI Assistant

---

## 1. Business Objective
Dự án **3Musk + One Thing** được xây dựng nhằm tối ưu hóa hiệu suất làm việc cho các nhóm nhỏ (đặc biệt là nhóm 3 người - "The Three Musketeers"). Mục tiêu là tạo ra một môi trường cộng tác chặt chẽ, với trợ lý AI "One Thing" giúp mọi người tập trung vào thứ quan trọng nhất mỗi ngày theo tinh thần "Một người vì mọi người, mọi người vì một người".

- **Mục tiêu 1:** Cung cấp giao diện quản lý task tối giản, tập trung vào hành động.
- **Mục tiêu 2:** Tăng cường tính trách nhiệm thông qua quy trình review bắt buộc.
- **Mục tiêu 3:** Xây dựng dashboard chung giúp nhóm ra quyết định nhanh chóng.
- **Mục tiêu 4:** Tích hợp trợ lý AI "One Thing" để tương tác, đề xuất task và tập trung vào ưu tiên hàng đầu mỗi ngày.

---

## 2. Business Rules (Quy tắc nghiệp vụ)
- **BR-01:** Một workspace cho phép từ 1 đến 5 thành viên (tối ưu nhóm nhỏ).
- **BR-02:** Mọi task phải được gán cho ít nhất một thành viên.
- **BR-03:** Task chỉ được chuyển sang "Done" nếu đã được review và approve bởi ít nhất 1 thành viên khác.
- **BR-04:** Không cho xóa thành viên cuối cùng.
- **BR-05:** Task quá hạn (deadline) sẽ hiển thị màu đỏ để cảnh báo.
- **BR-06:** "One Thing" là task ưu tiên cao nhất của người dùng trong ngày (dựa trên deadline và độ ưu tiên).

---

## 3. System Requirements Specification (SRS)

### 3.1. Functional Requirements (Yêu cầu chức năng)

| ID | Chức năng | Mô tả chi tiết | Ưu tiên | Epic |
|---|---|---|---|---|
| FR-01 | Quản lý thành viên | Thêm/Sửa/Xóa thông tin thành viên | High | Epic 1 |
| FR-02 | Kanban Board | Di chuyển task qua 4 trạng thái: Todo, In Progress, Review, Done | High | Epic 2 |
| FR-03 | Phân công Task | Gán người thực hiện và deadline | High | Epic 2 |
| FR-04 | Review & Approval | Chỉ người không phải assignee có thể approve task | High | Epic 3 |
| FR-05 | Dark/Light Mode | Chuyển đổi theme, lưu preference | Medium | Epic 4 |
| FR-06 | Export/Import | Backup/restore dữ liệu JSON | Medium | Epic 5 |
| FR-07 | One Thing Chat Assistant | Chatbot giúp xem task hôm nay, ưu tiên, task liên quan | High | Epic 6 |
| FR-08 | Focus Mode | Chỉ hiển thị "One Thing" để tập trung | Medium | Epic 6 |

### 3.2. Non-functional Requirements (Yêu cầu phi chức năng)
- **Hiệu năng:** Tải trang đầu tiên dưới 1.5 giây.
- **Tính khả dụng:** Responsive trên mobile, tablet, desktop; Dark/Light mode.
- **Bảo mật:** Lưu dữ liệu LocalStorage an toàn.

### 3.3. System Architecture & Constraints
- **Frontend:** HTML5, Tailwind CSS (CDN), JavaScript (Vanilla ES6+).
- **State Management:** Reactive state pattern với LocalStorage.
- **Backend/DB:** LocalStorage.
- **Deployment:** GitHub Pages.

---

## 4. Team & Task Assignment
- **Anh Tuấn:** Code Owner (Merge, check code chính), chịu trách nhiệm sản phẩm chính).
- **Thắng:** Phụ trách Epic 1, Epic 2.
- **Nhật:** Phụ trách Epic 6 (One Thing AI Assistant).
- **Tuấn:** Phụ trách Epic 3, Epic 4, Epic 5, Merge code.
